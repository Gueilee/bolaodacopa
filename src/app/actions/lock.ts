'use server'

import { db } from '@/lib/db'
import { users, predictions, matches } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function lockPredictions(): Promise<{
  success: boolean
  error?: string
  lockedAt?: Date
}> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Não autenticado.' }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  })
  if (!user) return { success: false, error: 'Usuário não encontrado.' }
  if (user.isPredictionLocked) return { success: false, error: 'Seus palpites já foram finalizados.' }

  // Verifica se já começou alguma partida — impede lock tardio
  const now = new Date()
  const [firstMatch] = await db
    .select({ matchDate: matches.matchDate })
    .from(matches)
    .orderBy(matches.matchDate)
    .limit(1)

  if (firstMatch && now >= firstMatch.matchDate) {
    return { success: false, error: 'A Copa já começou. O prazo para finalizar palpites encerrou.' }
  }

  const lockedAt = new Date()
  await db
    .update(users)
    .set({ isPredictionLocked: true, predictionsLockedAt: lockedAt, updatedAt: lockedAt })
    .where(eq(users.id, session.userId))

  revalidatePath('/dashboard/palpites')
  revalidatePath('/dashboard')
  return { success: true, lockedAt }
}
