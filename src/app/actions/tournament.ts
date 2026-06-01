'use server'

import { db } from '@/lib/db'
import { tournamentPredictions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

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

  const existing = await db.query.tournamentPredictions.findFirst({
    where: eq(tournamentPredictions.userId, session.userId),
  })

  if (existing?.isScored) {
    return { success: false, error: 'Palpite já foi pontuado e não pode ser alterado.' }
  }

  if (existing) {
    await db
      .update(tournamentPredictions)
      .set({
        champion:  input.champion,
        runnerUp:  input.runnerUp,
        topScorer: input.topScorer,
        updatedAt: new Date(),
      })
      .where(eq(tournamentPredictions.id, existing.id))
  } else {
    await db.insert(tournamentPredictions).values({
      userId:    session.userId,
      champion:  input.champion,
      runnerUp:  input.runnerUp,
      topScorer: input.topScorer,
    })
  }

  revalidatePath('/dashboard/finais')
  return { success: true }
}
