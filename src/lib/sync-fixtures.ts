/**
 * Sincronização de resultados via football-data.org (gratuito).
 *
 * Estratégia:
 *  1. GET /competitions/WC/matches?season=2026  →  104 jogos em 1 requisição
 *  2. FINISHED não pontuado   → grava placar + scoring automático + eventos
 *  3. Ao vivo                 → atualiza status + minuto + eventos parciais
 *  4. Knockout confirmado     → substitui placeholders TBD pelos times reais
 *  5. Metadados gravados em settings
 *
 * Matching API → banco:
 *  - Fast path : apiFixtureId (football-data.org match ID)
 *  - Grupos    : homeTeam + awayTeam (traduzidos EN→PT)
 *  - Knockout  : phase + janela ±4h na data
 */

import { db } from '@/lib/db'
import { matches, settings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import {
  FootballDataClient,
  FdMatch,
  LIVE_STATUSES,
  FINISHED_STATUSES,
  stageToPhase,
  durationToResult,
  translateTeamName,
  extractFulltimeScore,
  type MatchResultCode,
} from '@/lib/football-data-org'
import { scoreMatchInternal } from '@/lib/scoring-engine'
import type { Match } from '@/db/schema'

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type SyncResult = {
  ok:                boolean
  planError:         boolean   // mantido por compatibilidade — sempre false aqui
  fixturesFetched:   number
  matchesUpdated:    number
  predictionsScored: number
  teamsUpdated:      number
  rateLimitDaily:    number | null
  errors:            string[]
  syncedAt:          string
}

// ─── Matching API → partida do banco ─────────────────────────────────────────

function findDbMatch(
  fdMatch: FdMatch,
  dbMatches: Match[],
  byApiId: Map<number, Match>,
): Match | null {

  // 1. Fast path via ID já gravado
  const fast = byApiId.get(fdMatch.id)
  if (fast) return fast

  const phase = stageToPhase(fdMatch.stage)

  // 2. Fase de grupos — por nomes traduzidos
  if (phase === 'group') {
    const homePt = translateTeamName(fdMatch.homeTeam.name)
    const awayPt = translateTeamName(fdMatch.awayTeam.name)
    return dbMatches.find(
      (m) => m.phase === 'group' && m.homeTeam === homePt && m.awayTeam === awayPt,
    ) ?? null
  }

  // 3. Mata-mata — phase + janela ±4h
  const apiTs  = new Date(fdMatch.utcDate).getTime()
  const WINDOW = 4 * 60 * 60 * 1000
  return dbMatches.find(
    (m) => m.phase === phase && Math.abs(m.matchDate.getTime() - apiTs) <= WINDOW,
  ) ?? null
}

// ─── Processamento de um jogo ─────────────────────────────────────────────────

type ProcessResult = { updated: boolean; scored: number; teamsUpdated: boolean }

async function processMatch(
  fdMatch: FdMatch,
  dbMatches: Match[],
  byApiId: Map<number, Match>,
): Promise<ProcessResult> {

  const dbMatch = findDbMatch(fdMatch, dbMatches, byApiId)
  if (!dbMatch) return { updated: false, scored: 0, teamsUpdated: false }

  const phase = stageToPhase(fdMatch.stage)
  let updated      = false
  let scored       = 0
  let teamsUpdated = false

  // Armazena o ID da football-data.org na primeira ocorrência
  if (!dbMatch.apiFixtureId) {
    await db.update(matches)
      .set({ apiFixtureId: fdMatch.id, updatedAt: new Date() })
      .where(eq(matches.id, dbMatch.id))
    byApiId.set(fdMatch.id, { ...dbMatch, apiFixtureId: fdMatch.id })
  }

  // Knockout: substitui TBD quando a API confirmar os times
  if (phase !== 'group') {
    const homePt = translateTeamName(fdMatch.homeTeam.name)
    const awayPt = translateTeamName(fdMatch.awayTeam.name)
    const isTbd  = /^(1º|2º|Venc\.|Perd\.|TBD|A Definir|\?)/.test(dbMatch.homeTeam)
    if (isTbd && fdMatch.homeTeam.name !== 'TBD') {
      await db.update(matches)
        .set({ homeTeam: homePt, awayTeam: awayPt, updatedAt: new Date() })
        .where(eq(matches.id, dbMatch.id))
      teamsUpdated = true
    }
  }

  // Serializa eventos (sempre atualiza se o jogo está ativo/encerrado)
  const hasEvents = fdMatch.goals.length > 0 || fdMatch.bookings.length > 0 || fdMatch.substitutions.length > 0
  const isActive  = LIVE_STATUSES.has(fdMatch.status) || FINISHED_STATUSES.has(fdMatch.status)

  const goalsJson    = hasEvents || isActive ? JSON.stringify(
    fdMatch.goals.map((g) => ({
      minute:     g.minute,
      injuryTime: g.injuryTime ?? null,
      type:       g.type,
      team:       g.team.name,
      scorer:     g.scorer.name,
      assist:     g.assist?.name ?? null,
      scoreHome:  g.score.home,
      scoreAway:  g.score.away,
    }))
  ) : null

  const bookingsJson = hasEvents || isActive ? JSON.stringify(
    fdMatch.bookings.map((b) => ({
      minute: b.minute,
      team:   b.team.name,
      player: b.player.name,
      card:   b.card,
    }))
  ) : null

  const subsJson = hasEvents || isActive ? JSON.stringify(
    fdMatch.substitutions.map((s) => ({
      minute:    s.minute,
      team:      s.team.name,
      playerOut: s.playerOut.name,
      playerIn:  s.playerIn.name,
    }))
  ) : null

  // Ao vivo — atualiza status + minuto + eventos em tempo real
  if (LIVE_STATUSES.has(fdMatch.status)) {
    await db.update(matches)
      .set({
        status:       'live',
        elapsed:      fdMatch.minute ?? undefined,
        goalsJson:    goalsJson ?? undefined,
        bookingsJson: bookingsJson ?? undefined,
        subsJson:     subsJson ?? undefined,
        updatedAt:    new Date(),
      })
      .where(eq(matches.id, dbMatch.id))
    updated = true
  }

  // Encerrado — pontua se ainda não pontuado + grava eventos finais
  if (FINISHED_STATUSES.has(fdMatch.status) && !dbMatch.isScored) {
    const ftScore = extractFulltimeScore(fdMatch)
    if (!ftScore) return { updated, scored, teamsUpdated }

    const result = await scoreMatchInternal(
      dbMatch.id,
      ftScore.home,
      ftScore.away,
      durationToResult(fdMatch.score.duration) as MatchResultCode,
    )
    scored  = result.scored
    updated = true

    // Grava eventos no registro já atualizado pelo scoring
    if (goalsJson || bookingsJson || subsJson) {
      await db.update(matches)
        .set({
          goalsJson:    goalsJson ?? undefined,
          bookingsJson: bookingsJson ?? undefined,
          subsJson:     subsJson ?? undefined,
          updatedAt:    new Date(),
        })
        .where(eq(matches.id, dbMatch.id))
    }
  }

  return { updated, scored, teamsUpdated }
}

// ─── Sync principal ───────────────────────────────────────────────────────────

export async function syncFixtures(): Promise<SyncResult> {
  const apiKey = process.env.FOOTBALL_DATA_KEY
  if (!apiKey) throw new Error('FOOTBALL_DATA_KEY não configurada.')

  const syncedAt = new Date().toISOString()
  const errors:  string[] = []

  // 1 req busca todos os 104 jogos
  const client = new FootballDataClient(apiKey)
  let apiResponse

  try {
    apiResponse = await client.getWCMatches(2026)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const result: SyncResult = {
      ok: false, planError: false,
      fixturesFetched: 0, matchesUpdated: 0, predictionsScored: 0, teamsUpdated: 0,
      rateLimitDaily: null, errors: [msg], syncedAt,
    }
    await storeSyncMeta(result)
    throw err
  }

  // 2. Processa cada jogo
  const dbMatches = await db.query.matches.findMany()
  const byApiId   = new Map<number, Match>(
    dbMatches.filter((m) => m.apiFixtureId != null).map((m) => [m.apiFixtureId!, m]),
  )

  let matchesUpdated    = 0
  let predictionsScored = 0
  let teamsUpdated      = 0

  for (const fdMatch of apiResponse.matches) {
    try {
      const r = await processMatch(fdMatch, dbMatches, byApiId)
      if (r.updated)      matchesUpdated++
      predictionsScored  += r.scored
      if (r.teamsUpdated) teamsUpdated++
    } catch (err) {
      errors.push(
        `Match ${fdMatch.id} (${fdMatch.homeTeam.name} × ${fdMatch.awayTeam.name}): ` +
        (err instanceof Error ? err.message : String(err)),
      )
    }
  }

  const summary: SyncResult = {
    ok:                errors.length === 0,
    planError:         false,
    fixturesFetched:   apiResponse.count,
    matchesUpdated,
    predictionsScored,
    teamsUpdated,
    rateLimitDaily:    null,   // football-data.org não expõe esse header
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
    { key: 'last_sync_status',     value: result.ok ? 'success' : 'error' },
    { key: 'last_sync_plan_error', value: '0' },
    { key: 'last_sync_fetched',    value: String(result.fixturesFetched) },
    { key: 'last_sync_updated',    value: String(result.matchesUpdated) },
    { key: 'last_sync_scored',     value: String(result.predictionsScored) },
    { key: 'last_sync_teams',      value: String(result.teamsUpdated) },
    { key: 'last_sync_rate_limit', value: '' },
    { key: 'last_sync_errors',     value: result.errors.join(' | ') },
  ]

  for (const row of rows) {
    await db
      .insert(settings)
      .values({ key: row.key, value: row.value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: row.value, updatedAt: new Date() } })
  }
}
