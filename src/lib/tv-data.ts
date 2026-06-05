import { db } from '@/lib/db'
import { users, matches, predictions, socialPosts, matchGoals } from '@/db/schema'
import { desc, asc, eq, and, count, sql } from 'drizzle-orm'
import { getRanking, getManagerRanking } from '@/lib/queries'
import { getPlayerPhotos } from '@/lib/player-photos'

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
  city:      string | null
  elapsed:   number | null
}

export type TvDept = {
  department:   string
  totalPoints:  number
  participants: number
  leader:       string
}

export type TvManager = {
  manager:      string
  totalPoints:  number
  participants: number
  leader:       string
}

export type TvPost = {
  id:            string
  content:       string | null
  mediaUrl:      string | null
  mediaType:     string
  userName:      string
  userAvatar:    string | null
  likesCount:    number
  commentsCount: number
  createdAt:     Date
}

export type TvGroupTeam = {
  name: string; played: number; won: number; drawn: number; lost: number
  goalsFor: number; goalsAgainst: number; goalDiff: number; points: number
}
export type TvGroup = { name: string; teams: TvGroupTeam[] }

export type TvScorer = { playerName: string; country: string; goals: number; photoUrl?: string | null }

export type TvData = {
  ranking:         TvRankingEntry[]
  todayMatches:    TvMatch[]
  recentResults:   TvMatch[]
  departments:     TvDept[]
  managers:        TvManager[]
  posts:           TvPost[]
  groups:          TvGroup[]
  topScorers:      TvScorer[]
  totalUsers:      number
  updatedAt:       string
}

// Artilheiros conhecidos (fallback pré-Copa)
const PRE_COPA_SCORERS: TvScorer[] = [
  { playerName: 'Kylian Mbappé',      country: 'França',       goals: 0 },
  { playerName: 'Erling Haaland',     country: 'Noruega',      goals: 0 },
  { playerName: 'Vinícius Júnior',    country: 'Brasil',       goals: 0 },
  { playerName: 'Harry Kane',         country: 'Inglaterra',   goals: 0 },
  { playerName: 'Lionel Messi',       country: 'Argentina',    goals: 0 },
  { playerName: 'Lautaro Martínez',   country: 'Argentina',    goals: 0 },
  { playerName: 'Bukayo Saka',        country: 'Inglaterra',   goals: 0 },
  { playerName: 'Raphinha',           country: 'Brasil',       goals: 0 },
  { playerName: 'Jamal Musiala',      country: 'Alemanha',     goals: 0 },
  { playerName: 'Viktor Gyökeres',    country: 'Suécia',       goals: 0 },
]

export async function getTvData(): Promise<TvData> {
  const [rankingRaw, allMatches, managersRaw, postsRaw, goalsRaw] = await Promise.all([
    getRanking(),
    db.query.matches.findMany({ orderBy: [asc(matches.matchDate)] }),
    getManagerRanking(),
    db.query.socialPosts.findMany({
      orderBy: [desc(socialPosts.createdAt)],
      with: { user: { columns: { name: true, avatarUrl: true } } },
      limit: 12,
    }),
    db.select({
      playerName: matchGoals.playerName,
      country:    matchGoals.country,
      goals:      sql<number>`cast(count(*) as integer)`,
    })
    .from(matchGoals)
    .where(eq(matchGoals.isOwnGoal, false))
    .groupBy(matchGoals.playerName, matchGoals.country)
    .orderBy(desc(sql`count(*)`))
    .limit(10),
  ])

  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tmr   = new Date(today.getTime() + 86400000)

  // Jogos de hoje; se vazio, mostra o próximo dia com partidas
  let todayMatches: TvMatch[] = allMatches
    .filter((m) => { const d = new Date(m.matchDate); return d >= today && d < tmr })
    .map(toTvMatch)

  if (todayMatches.length === 0) {
    const upcoming = allMatches
      .filter(m => new Date(m.matchDate) >= tmr && m.status === 'upcoming')
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
    if (upcoming.length > 0) {
      const nextDay = new Date(upcoming[0].matchDate).toISOString().split('T')[0]
      todayMatches = upcoming
        .filter(m => new Date(m.matchDate).toISOString().split('T')[0] === nextDay)
        .slice(0, 9).map(toTvMatch)
    }
  }

  const recentResults: TvMatch[] = allMatches
    .filter((m) => m.status === 'finished')
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
    .slice(0, 10)
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

  const managers: TvManager[] = managersRaw.slice(0, 15).map(m => ({
    manager:      m.manager,
    totalPoints:  m.totalPoints,
    participants: m.participants,
    leader:       m.leader,
  }))

  const posts: TvPost[] = postsRaw.map(p => ({
    id:            p.id,
    content:       p.content,
    mediaUrl:      p.mediaUrl,
    mediaType:     p.mediaType,
    userName:      p.user.name,
    userAvatar:    p.user.avatarUrl,
    likesCount:    p.likesCount,
    commentsCount: p.commentsCount,
    createdAt:     p.createdAt,
  }))

  // Groups standings
  const groups = computeTvGroups(allMatches)

  // Top scorers: dados reais + complemento pré-Copa até 10
  const dbScorers: TvScorer[] = goalsRaw.map(r => ({
    playerName: r.playerName,
    country:    r.country,
    goals:      Number(r.goals),
  }))
  const dbNames    = new Set(dbScorers.map(s => s.playerName.toLowerCase()))
  const supplement = PRE_COPA_SCORERS.filter(p => !dbNames.has(p.playerName.toLowerCase()))
  const fullList   = [...dbScorers, ...supplement].slice(0, 8)

  // Buscar fotos para TODOS os 10 via Wikipedia + TheSportsDB
  let photos: Record<string, string> = {}
  try {
    photos = await getPlayerPhotos(fullList.map(s => ({ name: s.playerName })))
  } catch { /* fotos são opcionais */ }

  const topScorers: TvScorer[] = fullList.map(s => ({
    ...s,
    photoUrl: photos[s.playerName] ?? null,
  }))

  return {
    ranking,
    todayMatches,
    recentResults,
    departments,
    managers,
    posts,
    groups,
    topScorers,
    totalUsers:  rankingRaw.length,
    updatedAt:   now.toISOString(),
  }
}

function computeTvGroups(allMatches: (typeof matches.$inferSelect)[]): TvGroup[] {
  const groupMap = new Map<string, Map<string, TvGroupTeam>>()

  for (const m of allMatches.filter(x => x.phase === 'group')) {
    const g = m.groupName ?? 'Grupo ?'
    if (!groupMap.has(g)) groupMap.set(g, new Map())
    const teams = groupMap.get(g)!
    const emptyT = (n: string): TvGroupTeam => ({ name: n, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 })
    if (!teams.has(m.homeTeam)) teams.set(m.homeTeam, emptyT(m.homeTeam))
    if (!teams.has(m.awayTeam)) teams.set(m.awayTeam, emptyT(m.awayTeam))

    if (m.status === 'finished' && m.homeScore !== null && m.awayScore !== null) {
      const h = teams.get(m.homeTeam)!; const a = teams.get(m.awayTeam)!
      h.played++; a.played++
      h.goalsFor += m.homeScore; h.goalsAgainst += m.awayScore; h.goalDiff = h.goalsFor - h.goalsAgainst
      a.goalsFor += m.awayScore; a.goalsAgainst += m.homeScore; a.goalDiff = a.goalsFor - a.goalsAgainst
      if (m.homeScore > m.awayScore)      { h.won++;   h.points += 3; a.lost++ }
      else if (m.homeScore < m.awayScore) { a.won++;   a.points += 3; h.lost++ }
      else                                { h.drawn++; h.points++;    a.drawn++; a.points++ }
    }
  }

  return [...groupMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, teamsMap]) => ({
      name,
      teams: [...teamsMap.values()].sort((a, b) =>
        b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor || a.name.localeCompare(b.name)
      ),
    }))
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
    city:      m.city,
    elapsed:   m.elapsed ?? null,
  }
}
