import { db } from '@/lib/db'
import { users, matches, predictions } from '@/db/schema'
import { desc, asc, eq, and, ne, count, sql } from 'drizzle-orm'

// ─── Ranking ────────────────────────────────────────────────────────────────

export type RankingEntry = {
  id:              string
  name:            string
  email:           string
  department:      string | null
  avatarUrl:       string | null
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
      avatarUrl:   users.avatarUrl,
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
    .where(and(eq(users.isActive, true), ne(users.role, 'admin')))
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
    .where(and(eq(users.isActive, true), ne(users.role, 'admin')))

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

// ─── Auditoria: partidas encerradas com resumo de palpites ──────────────────

export type AuditMatchSummary = {
  id:         string
  matchNumber: number
  phase:      string
  groupName:  string | null
  homeTeam:   string
  awayTeam:   string
  homeScore:  number
  awayScore:  number
  matchDate:  Date
  total:      number   // palpites registrados
  exact:      number   // placar exato (10 pts)
  winner:     number   // vencedor certo (5 ou 7 pts)
  miss:       number   // errou (0 pts)
  noBet:      number   // sem palpite
  totalUsers: number
}

export async function getAuditMatchSummaries(): Promise<AuditMatchSummary[]> {
  const [allUsers, finishedMatches] = await Promise.all([
    db.select({ count: count() }).from(users).where(and(eq(users.isActive, true), ne(users.role, 'admin'))),
    db.query.matches.findMany({
      where: eq(matches.status, 'finished'),
      orderBy: [asc(matches.matchDate)],
      with: {
        predictions: {
          columns: { points: true, isScored: true },
        },
      },
    }),
  ])
  const totalUsers = Number(allUsers[0].count)

  return finishedMatches
    .filter(m => m.homeScore !== null && m.awayScore !== null)
    .map(m => {
      const scored = m.predictions.filter(p => p.isScored)
      const exact  = scored.filter(p => p.points === 10).length
      const winner = scored.filter(p => p.points === 5 || p.points === 7).length
      const miss   = scored.filter(p => p.points === 0).length
      return {
        id:          m.id,
        matchNumber: m.matchNumber,
        phase:       m.phase,
        groupName:   m.groupName,
        homeTeam:    m.homeTeam,
        awayTeam:    m.awayTeam,
        homeScore:   m.homeScore!,
        awayScore:   m.awayScore!,
        matchDate:   m.matchDate,
        total:       scored.length,
        exact,
        winner,
        miss,
        noBet:       totalUsers - scored.length,
        totalUsers,
      }
    })
}

// ─── Auditoria: palpites de todos os usuários para uma partida ───────────────

export type AuditMatchDetail = {
  userId:     string
  userName:   string
  department: string | null
  predHome:   number
  predAway:   number
  points:     number
  isScored:   boolean
}

export async function getAuditByMatch(matchId: string): Promise<AuditMatchDetail[]> {
  const rows = await db
    .select({
      userId:     predictions.userId,
      userName:   users.name,
      department: users.department,
      predHome:   predictions.homeScore,
      predAway:   predictions.awayScore,
      points:     predictions.points,
      isScored:   predictions.isScored,
    })
    .from(predictions)
    .innerJoin(users, eq(predictions.userId, users.id))
    .where(eq(predictions.matchId, matchId))
    .orderBy(desc(predictions.points), asc(users.name))

  return rows
}

// ─── Auditoria: todos os palpites de um usuário com resultado real ───────────

export type AuditUserPrediction = {
  matchId:   string
  matchNumber: number
  phase:     string
  groupName: string | null
  homeTeam:  string
  awayTeam:  string
  homeScore: number | null
  awayScore: number | null
  matchDate: Date
  status:    string
  predHome:  number
  predAway:  number
  points:    number
  isScored:  boolean
}

export async function getAuditByUser(userId: string): Promise<AuditUserPrediction[]> {
  const rows = await db
    .select({
      matchId:     predictions.matchId,
      matchNumber: matches.matchNumber,
      phase:       matches.phase,
      groupName:   matches.groupName,
      homeTeam:    matches.homeTeam,
      awayTeam:    matches.awayTeam,
      homeScore:   matches.homeScore,
      awayScore:   matches.awayScore,
      matchDate:   matches.matchDate,
      status:      matches.status,
      predHome:    predictions.homeScore,
      predAway:    predictions.awayScore,
      points:      predictions.points,
      isScored:    predictions.isScored,
    })
    .from(predictions)
    .innerJoin(matches, eq(predictions.matchId, matches.id))
    .where(eq(predictions.userId, userId))
    .orderBy(asc(matches.matchDate))

  return rows
}

// ─── Auditoria: lista de usuários com resumo de pontos ───────────────────────

export type AuditUser = {
  id:         string
  name:       string
  department: string | null
  totalPoints: number
  predCount:  number
  exactCount: number
  winnerCount: number
  missCount:  number
}

export async function getAuditUsers(): Promise<AuditUser[]> {
  const rows = await db
    .select({
      id:          users.id,
      name:        users.name,
      department:  users.department,
      totalPoints: users.totalPoints,
      predCount:   count(predictions.id),
      exactCount:  sql<number>`cast(sum(case when ${predictions.points} = 10 then 1 else 0 end) as integer)`,
      winnerCount: sql<number>`cast(sum(case when ${predictions.points} in (5,7) then 1 else 0 end) as integer)`,
      missCount:   sql<number>`cast(sum(case when ${predictions.points} = 0 and ${predictions.isScored} = 1 then 1 else 0 end) as integer)`,
    })
    .from(users)
    .leftJoin(predictions, and(eq(predictions.userId, users.id), eq(predictions.isScored, true)))
    .where(and(eq(users.isActive, true), ne(users.role, 'admin')))
    .groupBy(users.id)
    .orderBy(desc(users.totalPoints), asc(users.name))

  return rows.map(r => ({
    ...r,
    predCount:   Number(r.predCount),
    exactCount:  Number(r.exactCount),
    winnerCount: Number(r.winnerCount),
    missCount:   Number(r.missCount),
  }))
}
