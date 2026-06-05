/**
 * Queries do Ranking por Unidade.
 * Mesma mecânica do dept-ranking: média de pontos de todos os membros ativos.
 */

import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq, and, desc, sql, inArray } from 'drizzle-orm'

// Exclui admins de todos os rankings (user + rh participam, admin não)
const RANKED_ROLES = ['user', 'rh'] as const
const activeRanked = () => and(eq(users.isActive, true), inArray(users.role, RANKED_ROLES))

// ─── Ícone / cor por unidade ──────────────────────────────────────────────────

export const UNIT_META: Record<string, { icon: string; color: string; state: string }> = {
  'Garuva':        { icon: '🌲', color: '#166534', state: 'SC' },
  'Itapevi':       { icon: '🏭', color: '#1e40af', state: 'SP' },
  'Navegantes CD01': { icon: '⚓', color: '#0891b2', state: 'SC' },
  'Navegantes CD02': { icon: '🚢', color: '#0e7490', state: 'SC' },
  'Vila Olímpia':  { icon: '🏙️', color: '#7c3aed', state: 'SP' },
}

export function getUnitMeta(unit: string) {
  return UNIT_META[unit] ?? { icon: '📍', color: '#422c76', state: '' }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type UnitRankEntry = {
  position:          number
  unit:              string
  totalMembers:      number
  lockedMembers:     number
  participationRate: number
  avgPoints:         number
  maxPoints:         number
  totalPoints:       number
  leader:            string | null
  leaderPoints:      number
}

export type MyUnitStatus = {
  unit:              string | null
  position:          number | null
  totalUnits:        number
  avgPoints:         number
  totalMembers:      number
  lockedMembers:     number
  participationRate: number
  leader:            string | null
  userIsLeader:      boolean
  userPoints:        number
}

// ─── Ranking completo ─────────────────────────────────────────────────────────

export async function getUnitRanking(): Promise<UnitRankEntry[]> {
  const rows = await db
    .select({
      unit:          sql<string>`coalesce(${users.unit}, 'Sem Unidade')`,
      totalMembers:  sql<number>`cast(count(*) as integer)`,
      lockedMembers: sql<number>`cast(sum(case when ${users.isPredictionLocked} = 1 then 1 else 0 end) as integer)`,
      avgPoints:     sql<number>`cast(round(avg(${users.totalPoints}), 2) as real)`,
      maxPoints:     sql<number>`cast(max(${users.totalPoints}) as integer)`,
      totalPoints:   sql<number>`cast(sum(${users.totalPoints}) as integer)`,
    })
    .from(users)
    .where(activeRanked())
    .groupBy(sql`coalesce(${users.unit}, 'Sem Unidade')`)
    .orderBy(
      desc(sql`round(avg(${users.totalPoints}), 2)`),
      desc(sql`cast(sum(case when ${users.isPredictionLocked} = 1 then 1 else 0 end) as real) / count(*)`),
      desc(sql`max(${users.totalPoints})`),
    )

  const allUsers = await db
    .select({
      name:   users.name,
      unit:   sql<string>`coalesce(${users.unit}, 'Sem Unidade')`,
      points: users.totalPoints,
    })
    .from(users)
    .where(activeRanked())
    .orderBy(desc(users.totalPoints))

  const leaderMap = new Map<string, { name: string; points: number }>()
  for (const u of allUsers) {
    if (!leaderMap.has(u.unit)) leaderMap.set(u.unit, { name: u.name, points: u.points })
  }

  return rows.map((r, idx) => {
    const total  = Number(r.totalMembers)
    const locked = Number(r.lockedMembers)
    const leader = leaderMap.get(r.unit)
    return {
      position:          idx + 1,
      unit:              r.unit,
      totalMembers:      total,
      lockedMembers:     locked,
      participationRate: total > 0 ? Math.round((locked / total) * 100) : 0,
      avgPoints:         Number(r.avgPoints ?? 0),
      maxPoints:         Number(r.maxPoints ?? 0),
      totalPoints:       Number(r.totalPoints ?? 0),
      leader:            leader?.name ?? null,
      leaderPoints:      leader?.points ?? 0,
    }
  })
}

// ─── Status da unidade do usuário logado ──────────────────────────────────────

export async function getMyUnitStatus(userId: string): Promise<MyUnitStatus> {
  const me = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { unit: true, totalPoints: true },
  })

  const ranking    = await getUnitRanking()
  const myUnit     = me?.unit ?? null
  const unitLabel  = myUnit ?? 'Sem Unidade'
  const myEntry    = ranking.find(u => u.unit === unitLabel) ?? null

  return {
    unit:              myUnit,
    position:          myEntry?.position ?? null,
    totalUnits:        ranking.length,
    avgPoints:         myEntry?.avgPoints ?? 0,
    totalMembers:      myEntry?.totalMembers ?? 0,
    lockedMembers:     myEntry?.lockedMembers ?? 0,
    participationRate: myEntry?.participationRate ?? 0,
    leader:            myEntry?.leader ?? null,
    userIsLeader:      myEntry?.leaderPoints === me?.totalPoints && (me?.totalPoints ?? 0) > 0,
    userPoints:        me?.totalPoints ?? 0,
  }
}
