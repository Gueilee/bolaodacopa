/**
 * Serviço de sincronização com a API-Football.
 *
 * ⚠  REQUISITO: plano Starter ou superior em api-sports.io
 *    O plano Free só acessa temporadas 2022–2024.
 *    Faça o upgrade em: https://dashboard.api-sports.io
 *
 * Estratégia:
 *  1. GET /fixtures?league=1&season=2026  →  todos os 104 jogos (1 req)
 *  2. Fixture status FT/AET/PEN não pontuado → atualiza placar + scoring automático
 *  3. Fixture ao vivo                         → atualiza status + elapsed
 *  4. Knockout com times confirmados           → substitui placeholders do seed
 *  5. Metadados de sync gravados em settings
 *
 * Matching de fixtures → partidas do banco:
 *  - Fast path : apiFixtureId (após primeiro sync do jogo)
 *  - Grupo     : homeTeam/awayTeam  (TEAM_NAME_MAP EN→PT)
 *  - Knockout  : phase + janela de ±4h na data
 */

import { db } from '@/lib/db'
import { matches, settings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import {
  ApiFootballClient,
  ApiFixture,
  FINISHED_STATUSES,
  LIVE_STATUSES,
  MatchResultCode,
  extractFulltimeScore,
  roundToPhase,
  translateTeamName,
} from '@/lib/api-football'
import { scoreMatchInternal } from '@/lib/scoring-engine'
import type { Match } from '@/db/schema'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type SyncResult = {
  ok:                boolean
  planError:         boolean     // true = precisa upgrade do plano
  fixturesFetched:   number
  matchesUpdated:    number
  predictionsScored: number
  teamsUpdated:      number
  rateLimitDaily:    number | null
  errors:            string[]
  syncedAt:          string
}

// ─── Match de fixture → partida do banco ─────────────────────────────────────

function findDbMatch(
  fixture: ApiFixture,
  dbMatches: Match[],
  byApiId: Map<number, Match>,
): Match | null {

  // 1. Fast path
  const fast = byApiId.get(fixture.fixture.id)
  if (fast) return fast

  const phase = roundToPhase(fixture.league.round)

  // 2. Fase de grupos — por nomes traduzidos
  if (phase === 'group') {
    const homePt = translateTeamName(fixture.teams.home.name)
    const awayPt = translateTeamName(fixture.teams.away.name)
    return (
      dbMatches.find(
        (m) => m.phase === 'group' && m.homeTeam === homePt && m.awayTeam === awayPt,
      ) ?? null
    )
  }

  // 3. Mata-mata — por phase + janela de ±4h
  const apiTs  = new Date(fixture.fixture.date).getTime()
  const WINDOW = 4 * 60 * 60 * 1000
  return (
    dbMatches.find(
      (m) => m.phase === phase && Math.abs(m.matchDate.getTime() - apiTs) <= WINDOW,
    ) ?? null
  )
}

// ─── Processamento de um fixture ─────────────────────────────────────────────

type ProcessResult = { updated: boolean; scored: number; teamsUpdated: boolean }

async function processFixture(
  fixture: ApiFixture,
  dbMatches: Match[],
  byApiId: Map<number, Match>,
): Promise<ProcessResult> {

  const dbMatch = findDbMatch(fixture, dbMatches, byApiId)
  if (!dbMatch) return { updated: false, scored: 0, teamsUpdated: false }

  const statusShort = fixture.fixture.status.short
  const phase       = roundToPhase(fixture.league.round)
  let updated       = false
  let scored        = 0
  let teamsUpdated  = false

  // Armazena apiFixtureId na primeira ocorrência
  if (!dbMatch.apiFixtureId) {
    await db
      .update(matches)
      .set({ apiFixtureId: fixture.fixture.id, updatedAt: new Date() })
      .where(eq(matches.id, dbMatch.id))
    byApiId.set(fixture.fixture.id, { ...dbMatch, apiFixtureId: fixture.fixture.id })
  }

  // Knockout: substitui times TBD quando a API os confirmar
  if (phase !== 'group') {
    const homePt = translateTeamName(fixture.teams.home.name)
    const awayPt = translateTeamName(fixture.teams.away.name)
    const isTbd  = /^(1º|2º|Venc\.|Perd\.|TBD|A Definir|\?)/.test(dbMatch.homeTeam)

    if (isTbd && homePt !== fixture.teams.home.name) {
      await db
        .update(matches)
        .set({ homeTeam: homePt, awayTeam: awayPt, updatedAt: new Date() })
        .where(eq(matches.id, dbMatch.id))
      teamsUpdated = true
    }
  }

  // Ao vivo
  if (LIVE_STATUSES.has(statusShort) && dbMatch.status !== 'live') {
    await db
      .update(matches)
      .set({
        status:    'live',
        elapsed:   fixture.fixture.status.elapsed ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(matches.id, dbMatch.id))
    updated = true
  }

  // Encerrado — pontua se ainda não pontuado
  if (FINISHED_STATUSES.has(statusShort) && !dbMatch.isScored) {
    const score = extractFulltimeScore(fixture)
    if (!score) return { updated, scored, teamsUpdated }

    const result = await scoreMatchInternal(
      dbMatch.id,
      score.home,
      score.away,
      statusShort as MatchResultCode,
    )
    scored  = result.scored
    updated = true
  }

  return { updated, scored, teamsUpdated }
}

// ─── Sync principal ───────────────────────────────────────────────────────────

export async function syncFixtures(): Promise<SyncResult> {
  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) throw new Error('API_FOOTBALL_KEY não configurada.')

  const syncedAt = new Date().toISOString()
  const errors: string[] = []

  // ── 1. Busca os 104 fixtures (1 requisição) ──
  const client = new ApiFootballClient(apiKey)
  let apiResponse

  try {
    apiResponse = await client.getFixtures(1, 2026)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)

    // Detecta especificamente o erro de plano insuficiente
    const isPlanError = msg.includes('Free plans do not have access')

    const result: SyncResult = {
      ok: false, planError: isPlanError,
      fixturesFetched: 0, matchesUpdated: 0, predictionsScored: 0, teamsUpdated: 0,
      rateLimitDaily: null, errors: [msg], syncedAt,
    }
    await storeSyncMeta(result)

    // Não re-lança o erro de plano — é esperado até o upgrade
    if (isPlanError) return result
    throw err
  }

  // ── 2. Processa cada fixture ──
  const dbMatches = await db.query.matches.findMany()
  const byApiId   = new Map<number, Match>(
    dbMatches.filter((m) => m.apiFixtureId != null).map((m) => [m.apiFixtureId!, m]),
  )

  let matchesUpdated    = 0
  let predictionsScored = 0
  let teamsUpdated      = 0

  for (const fixture of apiResponse.fixtures) {
    try {
      const r = await processFixture(fixture, dbMatches, byApiId)
      if (r.updated)      matchesUpdated++
      predictionsScored  += r.scored
      if (r.teamsUpdated) teamsUpdated++
    } catch (err) {
      errors.push(
        `Fixture ${fixture.fixture.id} ` +
        `(${fixture.teams.home.name} × ${fixture.teams.away.name}): ` +
        (err instanceof Error ? err.message : String(err)),
      )
    }
  }

  const summary: SyncResult = {
    ok: errors.length === 0,
    planError: false,
    fixturesFetched: apiResponse.results,
    matchesUpdated,
    predictionsScored,
    teamsUpdated,
    rateLimitDaily: apiResponse.rateLimits.dailyRemaining,
    errors,
    syncedAt,
  }

  await storeSyncMeta(summary)
  return summary
}

// ─── Persiste metadados ───────────────────────────────────────────────────────

async function storeSyncMeta(result: SyncResult): Promise<void> {
  const rows = [
    { key: 'last_sync_at',         value: result.syncedAt },
    { key: 'last_sync_status',     value: result.ok ? 'success' : result.planError ? 'plan_error' : 'error' },
    { key: 'last_sync_plan_error', value: result.planError ? '1' : '0' },
    { key: 'last_sync_fetched',    value: String(result.fixturesFetched) },
    { key: 'last_sync_updated',    value: String(result.matchesUpdated) },
    { key: 'last_sync_scored',     value: String(result.predictionsScored) },
    { key: 'last_sync_teams',      value: String(result.teamsUpdated) },
    { key: 'last_sync_rate_limit', value: String(result.rateLimitDaily ?? '') },
    { key: 'last_sync_errors',     value: result.errors.join(' | ') },
  ]

  for (const row of rows) {
    await db
      .insert(settings)
      .values({ key: row.key, value: row.value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: row.value, updatedAt: new Date() } })
  }
}
