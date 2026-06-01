'use server'

import { db } from '@/lib/db'
import { predictions, tournamentPredictions, users, matches, settings } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { scoreMatchInternal } from '@/lib/scoring-engine'

// ─────────────────────────────────────────────────────────────────────────────
// PONTUAÇÃO POR PARTIDA — lógica pura (testável sem banco)
// ─────────────────────────────────────────────────────────────────────────────

export type MatchScore = { homeScore: number; awayScore: number }

export type MatchPointsResult = {
  points:    number
  breakdown: string
}

type Winner = 'home' | 'away' | 'draw'

function getWinner(home: number, away: number): Winner {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'draw'
}

/**
 * Tabela de pontos:
 *   10 — Placar exato
 *    7 — Vencedor correto + saldo de gols igual (ex: 3×1 vs 2×0)
 *    5 — Vencedor correto (ou empate) sem saldo igual
 *    0 — Vencedor errado
 */
export function calculateMatchPoints(
  prediction: MatchScore,
  result:     MatchScore,
): MatchPointsResult {
  const predWinner   = getWinner(prediction.homeScore, prediction.awayScore)
  const resultWinner = getWinner(result.homeScore, result.awayScore)

  if (
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore
  ) {
    return { points: 10, breakdown: 'Placar exato (+10)' }
  }

  if (predWinner !== resultWinner) {
    return { points: 0, breakdown: 'Resultado incorreto (0)' }
  }

  const predDiff   = prediction.homeScore - prediction.awayScore
  const resultDiff = result.homeScore   - result.awayScore

  if (predDiff === resultDiff) {
    return {
      points: 7,
      breakdown: `Vencedor e saldo corretos (+7) — saldo ${resultDiff > 0 ? '+' : ''}${resultDiff}`,
    }
  }

  return { points: 5, breakdown: 'Vencedor correto (+5)' }
}

// ─────────────────────────────────────────────────────────────────────────────
// PONTUAÇÃO DE BÔNUS FINAL DE TORNEIO
// ─────────────────────────────────────────────────────────────────────────────

export type TournamentActual = {
  champion:  string
  runnerUp:  string
  topScorer: string
}

export type TournamentBonusResult = {
  points:    number
  breakdown: string[]
}

/**
 *   50 — Campeão correto
 *   25 — Vice-campeão correto
 *   50 — Artilheiro correto
 */
export function calculateTournamentBonus(
  prediction: { champion: string; runnerUp: string; topScorer: string },
  actual:     TournamentActual,
): TournamentBonusResult {
  let points = 0
  const breakdown: string[] = []

  if (prediction.champion === actual.champion) {
    points += 50
    breakdown.push(`Campeão: ${actual.champion} (+50)`)
  }
  if (prediction.runnerUp === actual.runnerUp) {
    points += 25
    breakdown.push(`Vice: ${actual.runnerUp} (+25)`)
  }
  if (
    prediction.topScorer.trim().toLowerCase() ===
    actual.topScorer.trim().toLowerCase()
  ) {
    points += 50
    breakdown.push(`Artilheiro: ${actual.topScorer} (+50)`)
  }

  if (breakdown.length === 0) breakdown.push('Nenhum bônus de torneio')
  return { points, breakdown }
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRO ÚNICO: verifica se o usuário pode salvar palpites
// Nova regra: o lock é por usuário (isPredictionLocked), não por horário.
// Os palpites ficam abertos até o usuário clicar "Finalizar" ou até a Copa começar.
// ─────────────────────────────────────────────────────────────────────────────

async function assertCanEdit(userId: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { isPredictionLocked: true },
  })
  if (!user) return 'Usuário não encontrado.'
  if (user.isPredictionLocked) return 'Seus palpites já foram finalizados e não podem ser alterados.'
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVER ACTION — salvar/atualizar palpite do usuário logado
// ─────────────────────────────────────────────────────────────────────────────

export async function savePrediction(
  matchId:   string,
  homeScore: number,
  awayScore: number,
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Não autenticado.' }

  const lockError = await assertCanEdit(session.userId)
  if (lockError) return { success: false, error: lockError }

  const match = await db.query.matches.findFirst({ where: eq(matches.id, matchId) })
  if (!match)                       return { success: false, error: 'Partida não encontrada.' }
  if (match.status === 'finished')  return { success: false, error: 'Partida já encerrada.' }

  const existing = await db.query.predictions.findFirst({
    where: and(eq(predictions.userId, session.userId), eq(predictions.matchId, matchId)),
  })

  if (existing) {
    await db
      .update(predictions)
      .set({ homeScore, awayScore, updatedAt: new Date() })
      .where(eq(predictions.id, existing.id))
  } else {
    await db.insert(predictions).values({ userId: session.userId, matchId, homeScore, awayScore })
  }

  revalidatePath('/dashboard/palpites')
  revalidatePath('/dashboard/jogos')
  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVER ACTION (ADMIN) — registrar resultado e recalcular todos os palpites
// ─────────────────────────────────────────────────────────────────────────────

export async function scoreMatch(
  matchId:   string,
  homeScore: number,
  awayScore: number,
): Promise<{ success: boolean; scored: number; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { success: false, scored: 0, error: 'Acesso negado.' }

  const { scored } = await scoreMatchInternal(matchId, homeScore, awayScore)
  return { success: true, scored }
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVER ACTION (ADMIN) — pontuar bônus finais do torneio
// ─────────────────────────────────────────────────────────────────────────────

export async function scoreTournamentBonuses(
  actual: TournamentActual,
): Promise<{ success: boolean; scored: number; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { success: false, scored: 0, error: 'Acesso negado.' }

  await db
    .insert(settings)
    .values([
      { key: 'champion',   value: actual.champion,  label: 'Campeão',      updatedAt: new Date() },
      { key: 'runner_up',  value: actual.runnerUp,  label: 'Vice-Campeão', updatedAt: new Date() },
      { key: 'top_scorer', value: actual.topScorer, label: 'Artilheiro',   updatedAt: new Date() },
    ])
    .onConflictDoUpdate({ target: settings.key, set: { value: actual.champion, updatedAt: new Date() } })

  const allTournamentPreds = await db.query.tournamentPredictions.findMany({
    where: eq(tournamentPredictions.isScored, false),
  })

  let scored = 0
  for (const pred of allTournamentPreds) {
    const { points } = calculateTournamentBonus(
      { champion: pred.champion, runnerUp: pred.runnerUp, topScorer: pred.topScorer },
      actual,
    )

    await db
      .update(tournamentPredictions)
      .set({ bonusPoints: points, isScored: true, updatedAt: new Date() })
      .where(eq(tournamentPredictions.id, pred.id))

    if (points > 0) {
      const user = await db.query.users.findFirst({ where: eq(users.id, pred.userId) })
      if (user) {
        await db
          .update(users)
          .set({ totalPoints: user.totalPoints + points, updatedAt: new Date() })
          .where(eq(users.id, pred.userId))
      }
    }
    scored++
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true, scored }
}
