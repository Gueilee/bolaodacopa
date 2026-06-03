'use server'

import { db } from '@/lib/db'
import { tournamentPredictions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

// Prazo: início do primeiro jogo da Copa 2026
const CUP_START = new Date('2026-06-11T20:00:00Z')

type TournamentInput = {
  champion:  string
  runnerUp:  string
  topScorer: string
}

export async function saveTournamentPrediction(
  input: TournamentInput,
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Não autenticado.' }

  if (input.champion === input.runnerUp) {
    return { success: false, error: 'Campeão e vice-campeão não podem ser o mesmo.' }
  }

  // Regra: prazo encerra no início da Copa
  if (new Date() >= CUP_START) {
    return { success: false, error: 'Prazo encerrado: o palpite final deve ser registrado antes do início da Copa (11/06/2026 às 17h de Brasília).' }
  }

  // Regra: uma vez salvo, não pode ser alterado
  const existing = await db.query.tournamentPredictions.findFirst({
    where: eq(tournamentPredictions.userId, session.userId),
  })

  if (existing) {
    return { success: false, error: 'Palpite final já registrado e não pode ser alterado.' }
  }

  await db.insert(tournamentPredictions).values({
    userId:    session.userId,
    champion:  input.champion,
    runnerUp:  input.runnerUp,
    topScorer: input.topScorer,
  })

  revalidatePath('/dashboard/finais')
  revalidatePath('/dashboard/palpites')
  return { success: true }
}
