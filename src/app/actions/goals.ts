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

// ─── Top artilheiros — lê goalsJson das partidas (football-data.org) ──────────

export type TopScorer = {
  playerName: string
  country:    string
  goals:      number
  penalties:  number
}

export async function getTopScorers(): Promise<TopScorer[]> {
  // Busca todas as partidas que têm dados de gols da API
  const allMatches = await db.query.matches.findMany({
    columns: { goalsJson: true, homeTeam: true, awayTeam: true },
  })

  const map = new Map<string, TopScorer>()

  for (const m of allMatches) {
    if (!m.goalsJson) continue
    let goals: Array<{
      type:   string
      scorer: string
      team:   string
    }>
    try { goals = JSON.parse(m.goalsJson) } catch { continue }

    for (const g of goals) {
      if (g.type === 'OWN_GOAL') continue                    // gol contra não conta
      if (!g.scorer || g.scorer === 'N/A') continue

      // País = time que marcou (traduzir se necessário)
      const country = g.team ?? ''
      const key     = `${g.scorer}||${country}`

      if (!map.has(key)) {
        map.set(key, { playerName: g.scorer, country, goals: 0, penalties: 0 })
      }
      const entry = map.get(key)!
      entry.goals++
      if (g.type === 'PENALTY') entry.penalties++
    }
  }

  return [...map.values()]
    .sort((a, b) => b.goals - a.goals || a.playerName.localeCompare(b.playerName))
}

// ─── Líder atual (para bonus scoring) ─────────────────────────────────────────

export async function getActualTopScorer(): Promise<string | null> {
  const top = await getTopScorers()
  return top[0]?.playerName ?? null
}
