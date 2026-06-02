import { db } from '@/lib/db'
import { users, matches, predictions } from '@/db/schema'
import { desc, asc, eq, and, count, sql, gte, lte } from 'drizzle-orm'
import { getRanking } from '@/lib/queries'

export type TvRankingEntry = {
  position:    number
  name:        string
  department:  string | null
  totalPoints: number
  exactCount:  number
}

export type TvMatch = {
  id:        string
  homeTeam:  string
  awayTeam:  string
  homeScore: number | null
  awayScore: number | null
  matchDate: Date
  status:    string
  phase:     string
  groupName: string | null
  venue:     string | null
}

export type TvDept = {
  department:   string
  totalPoints:  number
  participants: number
  leader:       string
}

export type TvData = {
  ranking:         TvRankingEntry[]
  todayMatches:    TvMatch[]
  recentResults:   TvMatch[]
  departments:     TvDept[]
  totalUsers:      number
  updatedAt:       string
}

export async function getTvData(): Promise<TvData> {
  const [rankingRaw, allMatches] = await Promise.all([
    getRanking(),
    db.query.matches.findMany({
      orderBy: [asc(matches.matchDate)],
    }),
  ])

  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tmr   = new Date(today.getTime() + 86400000)

  const todayMatches: TvMatch[] = allMatches
    .filter((m) => {
      const d = new Date(m.matchDate)
      return d >= today && d < tmr
    })
    .map(toTvMatch)

  const recentResults: TvMatch[] = allMatches
    .filter((m) => m.status === 'finished')
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
    .slice(0, 8)
    .map(toTvMatch)

  // Build department ranking
  const deptMap = new Map<string, { points: number; count: number; leader: string; leaderPts: number }>()
  for (const entry of rankingRaw) {
    const dept = entry.department ?? 'Sem departamento'
    const existing = deptMap.get(dept)
    if (!existing) {
      deptMap.set(dept, { points: entry.totalPoints, count: 1, leader: entry.name, leaderPts: entry.totalPoints })
    } else {
      existing.points += entry.totalPoints
      existing.count++
      if (entry.totalPoints > existing.leaderPts) {
        existing.leaderPts = entry.totalPoints
        existing.leader    = entry.name
      }
    }
  }

  const departments: TvDept[] = [...deptMap.entries()]
    .map(([department, v]) => ({ department, totalPoints: v.points, participants: v.count, leader: v.leader }))
    .sort((a, b) => b.totalPoints - a.totalPoints)

  const ranking: TvRankingEntry[] = rankingRaw.slice(0, 15).map((e) => ({
    position:    e.position,
    name:        e.name,
    department:  e.department ?? null,
    totalPoints: e.totalPoints,
    exactCount:  e.exactCount,
  }))

  return {
    ranking,
    todayMatches,
    recentResults,
    departments,
    totalUsers:  rankingRaw.length,
    updatedAt:   now.toISOString(),
  }
}

function toTvMatch(m: typeof matches.$inferSelect): TvMatch {
  return {
    id:        m.id,
    homeTeam:  m.homeTeam,
    awayTeam:  m.awayTeam,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    matchDate: m.matchDate,
    status:    m.status,
    phase:     m.phase,
    groupName: m.groupName,
    venue:     m.venue,
  }
}
