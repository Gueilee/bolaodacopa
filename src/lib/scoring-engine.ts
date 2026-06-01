/**
 * Motor de pontuação interno — sem checagem de sessão.
 * Usado tanto pelas Server Actions de admin quanto pelo serviço de sync automático.
 */
import { db } from '@/lib/db'
import { predictions, users, matches } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { calculateMatchPoints } from '@/app/actions/scoring'
import { revalidatePath } from 'next/cache'

export type ScoredUserResult = {
  userId:   string
  points:   number
  breakdown: string
  predHome: number
  predAway: number
}

export type ScoreMatchResult = {
  scored:      number
  skipped:     number
  userResults: ScoredUserResult[]
}

/**
 * Atualiza o resultado da partida e pontua todos os palpites não pontuados.
 * Idempotente: se a partida já estiver pontuada (isScored=true), retorna scored=0.
 */
export async function scoreMatchInternal(
  matchId:   string,
  homeScore: number,
  awayScore: number,
  matchResultCode: 'FT' | 'AET' | 'PEN' = 'FT',
): Promise<ScoreMatchResult> {

  // Marca a partida como encerrada e salva o placar
  await db
    .update(matches)
    .set({
      homeScore,
      awayScore,
      matchResult: matchResultCode,
      status:      'finished',
      isScored:    true,
      elapsed:     90,
      updatedAt:   new Date(),
    })
    .where(eq(matches.id, matchId))

  // Busca palpites ainda não pontuados desta partida
  const pendingPredictions = await db.query.predictions.findMany({
    where: and(
      eq(predictions.matchId, matchId),
      eq(predictions.isScored, false),
    ),
  })

  if (pendingPredictions.length === 0) return { scored: 0, skipped: 0, userResults: [] }

  let scored  = 0
  let skipped = 0
  const userResults: ScoredUserResult[] = []

  // Carrega usuários uma vez (evita N+1)
  const userIds = [...new Set(pendingPredictions.map((p) => p.userId))]
  const userMap = new Map<string, { id: string; totalPoints: number }>()

  for (const uid of userIds) {
    const u = await db.query.users.findFirst({
      where: eq(users.id, uid),
      columns: { id: true, totalPoints: true },
    })
    if (u) userMap.set(uid, u)
  }

  for (const pred of pendingPredictions) {
    const { points, breakdown } = calculateMatchPoints(
      { homeScore: pred.homeScore, awayScore: pred.awayScore },
      { homeScore, awayScore },
    )

    await db
      .update(predictions)
      .set({ points, pointsBreakdown: breakdown, isScored: true, updatedAt: new Date() })
      .where(eq(predictions.id, pred.id))

    const user = userMap.get(pred.userId)
    if (user) {
      const newTotal = user.totalPoints + points
      await db
        .update(users)
        .set({ totalPoints: newTotal, updatedAt: new Date() })
        .where(eq(users.id, pred.userId))
      user.totalPoints = newTotal
    }

    userResults.push({
      userId:    pred.userId,
      points,
      breakdown,
      predHome:  pred.homeScore,
      predAway:  pred.awayScore,
    })
    scored++
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')

  // Dispara notificações de resultado em background (fire-and-forget)
  if (userResults.length > 0) {
    import('@/lib/notifications')
      .then(({ sendMatchResultNotifications }) =>
        sendMatchResultNotifications(matchId, homeScore, awayScore, userResults),
      )
      .catch(() => {}) // nunca quebra o fluxo de scoring
  }

  return { scored, skipped, userResults }
}
