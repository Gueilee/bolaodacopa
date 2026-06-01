/**
 * Agregador de dados para relatórios (PDF e CSV).
 * Centraliza todos os fetches para evitar duplicação entre os dois formatos.
 */

import { db }            from '@/lib/db'
import { users, predictions, matches, settings } from '@/db/schema'
import { eq, and, desc, count, sql, isNotNull } from 'drizzle-orm'
import { getRanking }     from '@/lib/queries'
import { getDeptRanking } from '@/lib/dept-ranking'
import { getHrOverview }  from '@/lib/hr-analytics'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ReportUser = {
  id:                 string
  position:           number
  name:               string
  email:              string
  department:         string | null
  totalPoints:        number
  predictionCount:    number
  exactCount:         number
  isPredictionLocked: boolean
}

export type ReportDept = {
  position:          number
  department:        string
  totalMembers:      number
  lockedMembers:     number
  participationRate: number
  avgPoints:         number
  maxPoints:         number
  leader:            string | null
}

export type TournamentSettings = {
  champion:   string | null
  runnerUp:   string | null
  topScorer:  string | null
}

export type FullReportData = {
  generatedAt:    Date
  overview:       Awaited<ReturnType<typeof getHrOverview>>
  ranking:        ReportUser[]
  deptRanking:    ReportDept[]
  tournament:     TournamentSettings
  pendingUsers:   { name: string; email: string; department: string | null; betCount: number }[]
}

// ─── Relatório completo ───────────────────────────────────────────────────────

export async function getFullReportData(): Promise<FullReportData> {
  const [rawRanking, deptRaw, overview, tournamentRows] = await Promise.all([
    getRanking(),
    getDeptRanking(),
    getHrOverview(),
    db.select().from(settings).where(
      sql`${settings.key} in ('champion', 'runner_up', 'top_scorer')`,
    ),
  ])

  // Enriquece o ranking com contagem de palpites
  const betCounts = await db
    .select({
      userId:     predictions.userId,
      total:      count(),
      exactCount: sql<number>`cast(sum(case when ${predictions.points} = 10 then 1 else 0 end) as integer)`,
    })
    .from(predictions)
    .groupBy(predictions.userId)

  const betMap = new Map(betCounts.map((b) => [b.userId, {
    total: Number(b.total),
    exact: Number(b.exactCount),
  }]))

  const ranking: ReportUser[] = rawRanking.map((u, i) => ({
    id:                 u.id,
    position:           i + 1,
    name:               u.name,
    email:              u.email,
    department:         null,          // enriquecemos abaixo
    totalPoints:        u.totalPoints,
    predictionCount:    betMap.get(u.id)?.total ?? 0,
    exactCount:         betMap.get(u.id)?.exact ?? 0,
    isPredictionLocked: u.isPredictionLocked,
  }))

  // Busca departamentos de todos os usuários
  const allDepts = await db
    .select({ id: users.id, department: users.department })
    .from(users)
    .where(eq(users.isActive, true))

  const deptMap = new Map(allDepts.map((u) => [u.id, u.department]))
  for (const r of ranking) r.department = deptMap.get(r.id) ?? null

  const deptRanking: ReportDept[] = deptRaw.map((d) => ({
    position:          d.position,
    department:        d.department,
    totalMembers:      d.totalMembers,
    lockedMembers:     d.lockedMembers,
    participationRate: d.participationRate,
    avgPoints:         d.avgPoints,
    maxPoints:         d.maxPoints,
    leader:            d.leader,
  }))

  const kv = Object.fromEntries(tournamentRows.map((r) => [r.key, r.value]))
  const tournament: TournamentSettings = {
    champion:   kv['champion']   ?? null,
    runnerUp:   kv['runner_up']  ?? null,
    topScorer:  kv['top_scorer'] ?? null,
  }

  // Pendentes
  const pendingRaw = await db
    .select({ id: users.id, name: users.name, email: users.email, department: users.department })
    .from(users)
    .where(and(eq(users.isActive, true), eq(users.isPredictionLocked, false)))
    .orderBy(users.department, users.name)

  const pendingBets = await db
    .select({ userId: predictions.userId, c: count() })
    .from(predictions)
    .groupBy(predictions.userId)

  const pendingBetMap = new Map(pendingBets.map((b) => [b.userId, Number(b.c)]))
  const pendingUsers = pendingRaw.map((u) => ({
    name:       u.name,
    email:      u.email,
    department: u.department,
    betCount:   pendingBetMap.get(u.id) ?? 0,
  }))

  return {
    generatedAt: new Date(),
    overview,
    ranking,
    deptRanking,
    tournament,
    pendingUsers,
  }
}
