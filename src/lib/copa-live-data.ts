import { db }      from '@/lib/db'
import { matches } from '@/db/schema'
import { asc, eq } from 'drizzle-orm'

export type LiveMatch = {
  id:           string
  homeTeam:     string
  awayTeam:     string
  homeScore:    number | null
  awayScore:    number | null
  matchDate:    Date
  status:       string
  elapsed:      number | null
  phase:        string
  groupName:    string | null
  venue:        string | null
  city:         string | null
  matchResult:  string | null
  goalsJson:    string | null
  bookingsJson: string | null
  subsJson:     string | null
}

export type GroupTeam = {
  name:       string
  played:     number
  won:        number
  drawn:      number
  lost:       number
  goalsFor:   number
  goalsAgainst: number
  goalDiff:   number
  points:     number
}

export type Group = {
  name:  string
  teams: GroupTeam[]
}

export type CopaLiveData = {
  liveMatches:    LiveMatch[]
  todayMatches:   LiveMatch[]
  upcomingDays:   { date: string; matches: LiveMatch[] }[]
  recentResults:  LiveMatch[]
  groups:         Group[]
  fetchedAt:      string
}

// ─── Fetch all Copa data ─────────────────────────────────────────────────────

export async function getCopaLiveData(): Promise<CopaLiveData> {
  const allMatches = await db.query.matches.findMany({
    orderBy: [asc(matches.matchDate)],
  })

  const now    = new Date()
  const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tmr    = new Date(today.getTime() + 86400000)

  const toL = (m: typeof matches.$inferSelect): LiveMatch => ({
    id:           m.id,
    homeTeam:     m.homeTeam,
    awayTeam:     m.awayTeam,
    homeScore:    m.homeScore,
    awayScore:    m.awayScore,
    matchDate:    m.matchDate,
    status:       m.status,
    elapsed:      m.elapsed,
    phase:        m.phase,
    groupName:    m.groupName,
    venue:        m.venue,
    city:         m.city,
    matchResult:  m.matchResult ?? null,
    goalsJson:    m.goalsJson ?? null,
    bookingsJson: m.bookingsJson ?? null,
    subsJson:     m.subsJson ?? null,
  })

  const liveMatches   = allMatches.filter(m => m.status === 'live').map(toL)
  const todayMatches  = allMatches.filter(m => {
    const d = new Date(m.matchDate)
    return d >= today && d < tmr && m.status !== 'finished'
  }).map(toL)

  const recentResults = allMatches
    .filter(m => m.status === 'finished')
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
    .slice(0, 10)
    .map(toL)

  // Próxima rodada = apenas o PRÓXIMO dia com jogos (hoje incluso se ainda há jogos)
  const upcoming = allMatches.filter(m => {
    const d = new Date(m.matchDate)
    return d >= now && m.status === 'upcoming'
  })

  const dayMap = new Map<string, LiveMatch[]>()
  for (const m of upcoming) {
    const key = new Date(m.matchDate).toISOString().split('T')[0]
    if (!dayMap.has(key)) dayMap.set(key, [])
    dayMap.get(key)!.push(toL(m))
  }

  // Só o primeiro dia com jogos (próxima rodada)
  const upcomingDays = [...dayMap.entries()]
    .slice(0, 1)
    .map(([date, ms]) => ({ date, matches: ms }))

  // Standings dos grupos
  const groups = computeGroupStandings(allMatches)

  return {
    liveMatches,
    todayMatches,
    upcomingDays,
    recentResults,
    groups,
    fetchedAt: now.toISOString(),
  }
}

// ─── Calcular classificação dos grupos ───────────────────────────────────────

function computeGroupStandings(
  allMatches: (typeof matches.$inferSelect)[],
): Group[] {
  const groupMatches = allMatches.filter(m => m.phase === 'group')

  // Coletar times por grupo
  const groupTeams = new Map<string, Map<string, GroupTeam>>()

  for (const m of groupMatches) {
    const gName = m.groupName ?? 'Grupo ?'
    if (!groupTeams.has(gName)) groupTeams.set(gName, new Map())
    const teams = groupTeams.get(gName)!

    if (!teams.has(m.homeTeam)) teams.set(m.homeTeam, emptyTeam(m.homeTeam))
    if (!teams.has(m.awayTeam)) teams.set(m.awayTeam, emptyTeam(m.awayTeam))

    // Computar resultados apenas de jogos finalizados
    if (m.status === 'finished' && m.homeScore !== null && m.awayScore !== null) {
      const home = teams.get(m.homeTeam)!
      const away = teams.get(m.awayTeam)!

      home.played++;  away.played++
      home.goalsFor    += m.homeScore;  home.goalsAgainst += m.awayScore
      away.goalsFor    += m.awayScore;  away.goalsAgainst += m.homeScore
      home.goalDiff = home.goalsFor - home.goalsAgainst
      away.goalDiff = away.goalsFor - away.goalsAgainst

      if (m.homeScore > m.awayScore)      { home.won++;   home.points += 3; away.lost++ }
      else if (m.homeScore < m.awayScore) { away.won++;   away.points += 3; home.lost++ }
      else                                { home.drawn++; home.points++;    away.drawn++; away.points++ }
    }
  }

  return [...groupTeams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, teamsMap]) => ({
      name,
      teams: [...teamsMap.values()].sort(sortTeams),
    }))
}

function emptyTeam(name: string): GroupTeam {
  return { name, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 }
}

function sortTeams(a: GroupTeam, b: GroupTeam): number {
  if (b.points    !== a.points)    return b.points    - a.points
  if (b.goalDiff  !== a.goalDiff)  return b.goalDiff  - a.goalDiff
  if (b.goalsFor  !== a.goalsFor)  return b.goalsFor  - a.goalsFor
  return a.name.localeCompare(b.name)
}
