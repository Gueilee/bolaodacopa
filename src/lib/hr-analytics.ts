/**
 * Queries de analytics para o Dashboard de Engajamento RH.
 * Todas as funções são server-only (sem 'use client').
 */

import { db } from '@/lib/db'
import { users, predictions, matches } from '@/db/schema'
import { eq, and, count, sql, desc, isNull, isNotNull, inArray } from 'drizzle-orm'

// ─── KPIs Gerais ─────────────────────────────────────────────────────────────

export type HrOverview = {
  totalUsers:         number
  lockedUsers:        number
  participationRate:  number   // 0–100
  totalPredictions:   number
  avgPredictionsPerUser: number
  totalMatches:       number
  avgPoints:          number
  maxPoints:          number
  usersWithAnyBet:    number   // algum palpite, mas não necessariamente finalizado
}

export async function getHrOverview(): Promise<HrOverview> {
  const [userStats] = await db
    .select({
      total:      count(),
      locked:     sql<number>`cast(sum(case when ${users.isPredictionLocked} = 1 then 1 else 0 end) as integer)`,
      avgPts:     sql<number>`cast(round(avg(${users.totalPoints}), 1) as real)`,
      maxPts:     sql<number>`cast(max(${users.totalPoints}) as integer)`,
    })
    .from(users)
    .where(eq(users.isActive, true))

  const [predStats] = await db
    .select({
      total:       count(),
      usersWithBet: sql<number>`cast(count(distinct ${predictions.userId}) as integer)`,
    })
    .from(predictions)
    .innerJoin(users, eq(predictions.userId, users.id))
    .where(eq(users.isActive, true))

  const [matchCount] = await db.select({ total: count() }).from(matches)

  const total  = Number(userStats.total)
  const locked = Number(userStats.locked)

  return {
    totalUsers:            total,
    lockedUsers:           locked,
    participationRate:     total > 0 ? Math.round((locked / total) * 100) : 0,
    totalPredictions:      Number(predStats.total),
    avgPredictionsPerUser: total > 0 ? Math.round(Number(predStats.total) / total) : 0,
    totalMatches:          Number(matchCount.total),
    avgPoints:             Number(userStats.avgPts ?? 0),
    maxPoints:             Number(userStats.maxPts ?? 0),
    usersWithAnyBet:       Number(predStats.usersWithBet),
  }
}

// ─── Engajamento por Departamento ─────────────────────────────────────────────

export type DeptStats = {
  department:       string
  total:            number
  locked:           number
  participationRate: number
  avgPoints:        number
  maxPoints:        number
  leader:           string | null  // nome do melhor pontuador
}

export async function getDeptEngagement(): Promise<DeptStats[]> {
  const rows = await db
    .select({
      department: sql<string>`coalesce(${users.department}, 'Sem Departamento')`,
      total:      count(),
      locked:     sql<number>`cast(sum(case when ${users.isPredictionLocked} = 1 then 1 else 0 end) as integer)`,
      avgPoints:  sql<number>`cast(round(avg(${users.totalPoints}), 1) as real)`,
      maxPoints:  sql<number>`cast(max(${users.totalPoints}) as integer)`,
    })
    .from(users)
    .where(eq(users.isActive, true))
    .groupBy(sql`coalesce(${users.department}, 'Sem Departamento')`)
    .orderBy(desc(sql`cast(sum(case when ${users.isPredictionLocked} = 1 then 1 else 0 end) as real) / count(*)`))

  // Para cada departamento, busca o líder (maior pontuação)
  const leaders = await db
    .select({
      department: sql<string>`coalesce(${users.department}, 'Sem Departamento')`,
      name:       users.name,
      points:     users.totalPoints,
    })
    .from(users)
    .where(eq(users.isActive, true))
    .orderBy(desc(users.totalPoints))

  const leaderMap = new Map<string, string>()
  for (const l of leaders) {
    if (!leaderMap.has(l.department)) leaderMap.set(l.department, l.name)
  }

  return rows.map((r) => ({
    department:       r.department,
    total:            Number(r.total),
    locked:           Number(r.locked),
    participationRate: Number(r.total) > 0
      ? Math.round((Number(r.locked) / Number(r.total)) * 100)
      : 0,
    avgPoints:        Number(r.avgPoints ?? 0),
    maxPoints:        Number(r.maxPoints ?? 0),
    leader:           leaderMap.get(r.department) ?? null,
  }))
}

// ─── Timeline de Adesão ───────────────────────────────────────────────────────

export type TimelineEntry = {
  date:        string   // "YYYY-MM-DD"
  newLocks:    number   // usuários que finalizaram nesse dia
  cumulative:  number   // total acumulado
}

export async function getLockTimeline(): Promise<TimelineEntry[]> {
  const rows = await db
    .select({
      day:   sql<string>`date(${users.predictionsLockedAt}, 'unixepoch')`,
      count: count(),
    })
    .from(users)
    .where(and(eq(users.isActive, true), isNotNull(users.predictionsLockedAt)))
    .groupBy(sql`date(${users.predictionsLockedAt}, 'unixepoch')`)
    .orderBy(sql`date(${users.predictionsLockedAt}, 'unixepoch')`)

  let cumulative = 0
  return rows.map((r) => {
    cumulative += Number(r.count)
    return {
      date:       r.day ?? '',
      newLocks:   Number(r.count),
      cumulative,
    }
  })
}

// ─── Distribuição de Pontuação ────────────────────────────────────────────────

export type PointsBucket = {
  label:  string
  min:    number
  max:    number | null
  count:  number
  pct:    number
}

export async function getPointsDistribution(): Promise<PointsBucket[]> {
  const buckets: Omit<PointsBucket, 'count' | 'pct'>[] = [
    { label: '0 pts',      min: 0,   max: 0    },
    { label: '1–50',       min: 1,   max: 50   },
    { label: '51–100',     min: 51,  max: 100  },
    { label: '101–200',    min: 101, max: 200  },
    { label: '201–400',    min: 201, max: 400  },
    { label: '401+',       min: 401, max: null },
  ]

  const allUsers = await db
    .select({ points: users.totalPoints })
    .from(users)
    .where(eq(users.isActive, true))

  const total = allUsers.length

  return buckets.map((b) => {
    const count = allUsers.filter(
      (u) => u.points >= b.min && (b.max === null || u.points <= b.max),
    ).length
    return { ...b, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }
  })
}

// ─── Participantes Pendentes ──────────────────────────────────────────────────

export type PendingUser = {
  id:         string
  name:       string
  email:      string
  department: string | null
  hasSomeBet: boolean    // true = começou mas não finalizou
  betCount:   number
}

export async function getPendingUsers(): Promise<PendingUser[]> {
  // Usuários ativos que NÃO finalizaram palpites
  const notLocked = await db
    .select({
      id:         users.id,
      name:       users.name,
      email:      users.email,
      department: users.department,
    })
    .from(users)
    .where(and(eq(users.isActive, true), eq(users.isPredictionLocked, false)))
    .orderBy(users.department, users.name)

  if (notLocked.length === 0) return []

  // Conta palpites de cada um
  const betCounts = await db
    .select({
      userId: predictions.userId,
      count:  count(),
    })
    .from(predictions)
    .groupBy(predictions.userId)

  const betMap = new Map(betCounts.map((b) => [b.userId, Number(b.count)]))

  return notLocked.map((u) => ({
    ...u,
    hasSomeBet: (betMap.get(u.id) ?? 0) > 0,
    betCount:   betMap.get(u.id) ?? 0,
  }))
}

// ─── Top Performers ───────────────────────────────────────────────────────────

export type TopPerformer = {
  position:   number
  name:       string
  department: string | null
  avatarUrl:  string | null
  points:     number
  exactCount: number
  betCount:   number
}

export async function getTopPerformers(limit = 10): Promise<TopPerformer[]> {
  const rows = await db
    .select({
      id:         users.id,
      name:       users.name,
      department: users.department,
      avatarUrl:  users.avatarUrl,
      points:     users.totalPoints,
      exactCount: sql<number>`cast(sum(case when ${predictions.points} = 10 then 1 else 0 end) as integer)`,
      betCount:   count(predictions.id),
    })
    .from(users)
    .leftJoin(predictions, and(eq(predictions.userId, users.id), eq(predictions.isScored, true)))
    .where(eq(users.isActive, true))
    .groupBy(users.id)
    .orderBy(desc(users.totalPoints))
    .limit(limit)

  return rows.map((r, i) => ({
    position:   i + 1,
    name:       r.name,
    department: r.department,
    avatarUrl:  r.avatarUrl ?? null,
    points:     r.points,
    exactCount: Number(r.exactCount),
    betCount:   Number(r.betCount),
  }))
}

// ─── Export CSV ───────────────────────────────────────────────────────────────

export type CsvRow = {
  nome:           string
  email:          string
  departamento:   string
  finalizado:     string
  finalizadoEm:   string
  palpites:       number
  pontosAtuais:   number
  placarExatos:   number
}

export async function getCsvExportData(): Promise<CsvRow[]> {
  const rows = await db
    .select({
      name:       users.name,
      email:      users.email,
      department: users.department,
      locked:     users.isPredictionLocked,
      lockedAt:   users.predictionsLockedAt,
      points:     users.totalPoints,
      betCount:   sql<number>`(select count(*) from predictions where predictions.user_id = ${users.id})`,
      exactCount: sql<number>`(select count(*) from predictions where predictions.user_id = ${users.id} and predictions.points = 10)`,
    })
    .from(users)
    .where(eq(users.isActive, true))
    .orderBy(users.department, users.name)

  return rows.map((r) => ({
    nome:          r.name,
    email:         r.email,
    departamento:  r.department ?? 'Sem Departamento',
    finalizado:    r.locked ? 'Sim' : 'Não',
    finalizadoEm:  r.lockedAt
      ? new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
          timeZone: 'America/Sao_Paulo',
        }).format(r.lockedAt)
      : '',
    palpites:      Number(r.betCount),
    pontosAtuais:  r.points,
    placarExatos:  Number(r.exactCount),
  }))
}

// ─── Quem já acessou o sistema ───────────────────────────────────────────────

export type AccessedUser = {
  id:            string
  name:          string
  email:         string
  department:    string | null
  firstAccessAt: Date
}

export async function getAccessedUsers(): Promise<{ accessed: AccessedUser[]; totalEligible: number }> {
  const ROLES = ['user', 'rh'] as const

  const [accessed, total] = await Promise.all([
    db
      .select({
        id:            users.id,
        name:          users.name,
        email:         users.email,
        department:    users.department,
        firstAccessAt: users.firstAccessAt,
      })
      .from(users)
      .where(and(eq(users.isActive, true), inArray(users.role, ROLES), isNotNull(users.firstAccessAt)))
      .orderBy(users.firstAccessAt),
    db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.isActive, true), inArray(users.role, ROLES))),
  ])

  return {
    accessed:      accessed.map(u => ({ ...u, firstAccessAt: u.firstAccessAt! })),
    totalEligible: Number(total[0].count),
  }
}
