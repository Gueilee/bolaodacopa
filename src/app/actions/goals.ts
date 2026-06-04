'use server'

import { db }             from '@/lib/db'
import { matchGoals }     from '@/db/schema'
import { eq, desc, sql }  from 'drizzle-orm'
import { getSession }     from '@/lib/session'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Acesso negado.')
}

// ─── Buscar gols de uma partida ────────────────────────────────────────────────

export async function getMatchGoals(matchId: string) {
  return db.query.matchGoals.findMany({
    where: eq(matchGoals.matchId, matchId),
    orderBy: [matchGoals.minute, matchGoals.createdAt],
  })
}

// ─── Adicionar gol ─────────────────────────────────────────────────────────────

export async function addGoal(data: {
  matchId:    string
  playerName: string
  country:    string
  isOwnGoal?: boolean
  minute?:    number | null
}): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin()
    if (!data.playerName.trim()) return { success: false, error: 'Nome do jogador obrigatório.' }
    if (!data.country.trim())    return { success: false, error: 'País obrigatório.' }

    await db.insert(matchGoals).values({
      matchId:    data.matchId,
      playerName: data.playerName.trim(),
      country:    data.country.trim(),
      isOwnGoal:  data.isOwnGoal ?? false,
      minute:     data.minute ?? null,
    })

    revalidatePath('/admin')
    revalidatePath('/admin/artilheiros')
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ─── Remover gol ───────────────────────────────────────────────────────────────

export async function removeGoal(goalId: string): Promise<{ success: boolean }> {
  try {
    await assertAdmin()
    await db.delete(matchGoals).where(eq(matchGoals.id, goalId))
    revalidatePath('/admin')
    revalidatePath('/admin/artilheiros')
    return { success: true }
  } catch {
    return { success: false }
  }
}

// ─── Top artilheiros (gols não-contra) ────────────────────────────────────────

export type TopScorer = {
  playerName: string
  country:    string
  goals:      number
}

export async function getTopScorers(): Promise<TopScorer[]> {
  const rows = await db
    .select({
      playerName: matchGoals.playerName,
      country:    matchGoals.country,
      goals:      sql<number>`cast(count(*) as integer)`,
    })
    .from(matchGoals)
    .where(eq(matchGoals.isOwnGoal, false))
    .groupBy(matchGoals.playerName, matchGoals.country)
    .orderBy(desc(sql`count(*)`), matchGoals.playerName)

  return rows.map(r => ({ ...r, goals: Number(r.goals) }))
}

// ─── Líder atual (para bonus scoring) ─────────────────────────────────────────

export async function getActualTopScorer(): Promise<string | null> {
  const top = await getTopScorers()
  return top[0]?.playerName ?? null
}
