'use server'

import { db } from '@/lib/db'
import { predictions, tournamentPredictions, users, matches, settings } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { scoreMatchInternal, calculateTournamentBonus } from '@/lib/scoring-engine'
import type { TournamentActual } from '@/lib/scoring-engine'

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

  // Regra: palpites fecham 30 minutos antes da partida começar
  const matchStart = new Date(match.matchDate)
  const cutoffTime = new Date(matchStart.getTime() - 30 * 60 * 1000)
  if (new Date() >= cutoffTime) {
    return { success: false, error: 'Prazo encerrado: os palpites fecham 30 minutos antes da partida começar.' }
  }

  // Regra: palpite já registrado não pode ser alterado
  const existing = await db.query.predictions.findFirst({
    where: and(eq(predictions.userId, session.userId), eq(predictions.matchId, matchId)),
  })
  if (existing) {
    return { success: false, error: 'Palpite já registrado para esta partida e não pode ser alterado.' }
  }

  await db.insert(predictions).values({ userId: session.userId, matchId, homeScore, awayScore })

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

  // Upsert individual para garantir que cada chave receba seu próprio valor
  for (const row of [
    { key: 'champion',   value: actual.champion,  label: 'Campeão' },
    { key: 'runner_up',  value: actual.runnerUp,  label: 'Vice-Campeão' },
    { key: 'top_scorer', value: actual.topScorer, label: 'Artilheiro' },
  ] as const) {
    await db
      .insert(settings)
      .values({ key: row.key, value: row.value, label: row.label, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value: row.value, updatedAt: new Date() } })
  }

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
