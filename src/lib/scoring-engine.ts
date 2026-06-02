/**
 * Motor de pontuação interno — sem checagem de sessão.
 * Usado tanto pelas Server Actions de admin quanto pelo serviço de sync automático.
 */
import { db } from '@/lib/db'
import { predictions, users, matches } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type MatchScore = { homeScore: number; awayScore: number }
export type MatchPointsResult = { points: number; breakdown: string }
type Winner = 'home' | 'away' | 'draw'

function getWinner(home: number, away: number): Winner {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'draw'
}

export function calculateMatchPoints(
  prediction: MatchScore,
  result:     MatchScore,
): MatchPointsResult {
  const predWinner   = getWinner(prediction.homeScore, prediction.awayScore)
  const resultWinner = getWinner(result.homeScore, result.awayScore)

  // 1. Placar exato (vale tanto para vitórias quanto para empates)
  if (
    prediction.homeScore === result.homeScore &&
    prediction.awayScore === result.awayScore
  ) {
    return { points: 10, breakdown: 'Placar exato (+10)' }
  }

  // 2. Resultado errado (errou quem vence / se houve empate ou não)
  if (predWinner !== resultWinner) {
    return { points: 0, breakdown: 'Resultado incorreto (0)' }
  }

  // 3. Acertou o empate mas errou o placar exato
  //    (saldo é sempre 0 em empates, então "saldo correto" não se aplica aqui)
  if (resultWinner === 'draw') {
    return { points: 5, breakdown: 'Empate correto (+5)' }
  }

  // 4. Acertou o vencedor E o saldo de gols (ex: palpitou 2×0, resultado 3×1)
  const predDiff   = prediction.homeScore - prediction.awayScore
  const resultDiff = result.homeScore     - result.awayScore

  if (predDiff === resultDiff) {
    return {
      points: 7,
      breakdown: `Vencedor e saldo corretos (+7) — saldo ${resultDiff > 0 ? '+' : ''}${resultDiff}`,
    }
  }

  // 5. Acertou apenas o vencedor
  return { points: 5, breakdown: 'Vencedor correto (+5)' }
}

export type TournamentActual = {
  champion:  string
  runnerUp:  string
  topScorer: string
}

export type TournamentBonusResult = {
  points:    number
  breakdown: string[]
}

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
