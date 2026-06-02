import { db } from '@/lib/db'
import { users, matches, predictions } from '@/db/schema'
import { desc, asc, eq, and, count, sql } from 'drizzle-orm'

// ─── Ranking ────────────────────────────────────────────────────────────────

export type RankingEntry = {
  id:              string
  name:            string
  email:           string
  department:      string | null
  totalPoints:     number
  predictionCount: number
  exactCount:      number
  isPredictionLocked: boolean
  position:        number
}

export async function getRanking(): Promise<RankingEntry[]> {
  const rows = await db
    .select({
      id:          users.id,
      name:        users.name,
      email:       users.email,
      department:  users.department,
      totalPoints: users.totalPoints,
      isPredictionLocked: users.isPredictionLocked,
      predictionCount: count(predictions.id),
      exactCount: sql<number>`cast(
        sum(case when ${predictions.points} = 10 then 1 else 0 end)
        as integer)`,
    })
    .from(users)
    .leftJoin(
      predictions,
      and(
        eq(predictions.userId, users.id),
        eq(predictions.isScored, true),
      ),
    )
    .where(and(eq(users.isActive, true), eq(users.role, 'user')))
    .groupBy(users.id)
    .orderBy(desc(users.totalPoints), asc(users.name))

  return rows.map((row, index) => ({
    ...row,
    predictionCount: Number(row.predictionCount),
    exactCount:      Number(row.exactCount),
    position:        index + 1,
  }))
}

// ─── Partidas + palpites do usuário ─────────────────────────────────────────

export type MatchWithPrediction = Awaited<
  ReturnType<typeof getMatchesWithUserPredictions>
>[number]

export async function getMatchesWithUserPredictions(userId: string) {
  return db.query.matches.findMany({
    orderBy: [asc(matches.matchDate), asc(matches.matchNumber)],
    with: {
      predictions: {
        where: eq(predictions.userId, userId),
      },
    },
  })
}

// ─── Meus palpites: estatísticas resumidas ────────────────────────────────────

export type MyPredictionStats = {
  totalMatches:  number
  filled:        number
  pending:       number
  pointsEarned:  number
  exactScores:   number
  correctWinner: number
}

export async function getMyPredictionStats(userId: string): Promise<MyPredictionStats> {
  const [matchTotal] = await db.select({ count: count() }).from(matches)
  const [filledCount] = await db
    .select({ count: count() })
    .from(predictions)
    .where(eq(predictions.userId, userId))

  const [earned] = await db
    .select({
      points: sql<number>`coalesce(sum(${predictions.points}), 0)`,
      exact:  sql<number>`cast(sum(case when ${predictions.points} = 10 then 1 else 0 end) as integer)`,
      winner: sql<number>`cast(sum(case when ${predictions.points} = 5 then 1 else 0 end) as integer)`,
    })
    .from(predictions)
    .where(and(eq(predictions.userId, userId), eq(predictions.isScored, true)))

  const total  = Number(matchTotal.count)
  const filled = Number(filledCount.count)

  return {
    totalMatches:  total,
    filled,
    pending:       total - filled,
    pointsEarned:  Number(earned?.points ?? 0),
    exactScores:   Number(earned?.exact  ?? 0),
    correctWinner: Number(earned?.winner ?? 0),
  }
}

// ─── Ranking por gestor ──────────────────────────────────────────────────────

export type ManagerRankingEntry = {
  manager:      string
  totalPoints:  number
  participants: number
  leader:       string
}

export async function getManagerRanking(): Promise<ManagerRankingEntry[]> {
  const rows = await db
    .select({ name: users.name, manager: users.manager, totalPoints: users.totalPoints })
    .from(users)
    .where(and(eq(users.isActive, true), eq(users.role, 'user')))

  const map = new Map<string, { pts: number; count: number; leader: string; leaderPts: number }>()

  for (const u of rows) {
    const key = u.manager?.trim() || 'Sem gestor'
    const e   = map.get(key)
    if (!e) {
      map.set(key, { pts: u.totalPoints, count: 1, leader: u.name, leaderPts: u.totalPoints })
    } else {
      e.pts   += u.totalPoints
      e.count += 1
      if (u.totalPoints > e.leaderPts) { e.leaderPts = u.totalPoints; e.leader = u.name }
    }
  }

  return [...map.entries()]
    .map(([manager, v]) => ({ manager, totalPoints: v.pts, participants: v.count, leader: v.leader }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
}

// ─── Admin: todas as partidas com contagem de palpites ───────────────────────

export type AdminMatch = Awaited<
  ReturnType<typeof getAllMatchesForAdmin>
>[number]

export async function getAllMatchesForAdmin() {
  return db.query.matches.findMany({
    orderBy: [asc(matches.matchDate)],
    with: {
      predictions: {
        columns: { id: true, isScored: true, points: true },
      },
    },
  })
}

// ─── Admin: resumo de estatísticas ──────────────────────────────────────────

export async function getAdminStats() {
  const [userCount]     = await db.select({ count: count() }).from(users).where(eq(users.isActive, true))
  const [lockedCount]   = await db.select({ count: count() }).from(users).where(and(eq(users.isActive, true), eq(users.isPredictionLocked, true)))
  const [matchCount]    = await db.select({ count: count() }).from(matches)
  const [pendingScore]  = await db
    .select({ count: count() })
    .from(matches)
    .where(and(eq(matches.status, 'finished'), eq(matches.isScored, false)))
  const [predCount]     = await db.select({ count: count() }).from(predictions)

  return {
    users:            Number(userCount.count),
    lockedUsers:      Number(lockedCount.count),
    matches:          Number(matchCount.count),
    pendingScoring:   Number(pendingScore.count),
    totalPredictions: Number(predCount.count),
  }
}

// ─── User com status de lock ──────────────────────────────────────────────────

export async function getUserLockStatus(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id:                  true,
      isPredictionLocked:  true,
      predictionsLockedAt: true,
      totalPoints:         true,
    },
  })
}
