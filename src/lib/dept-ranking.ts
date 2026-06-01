/**
 * Queries do Ranking por Departamento.
 *
 * Métrica de ordenação: MÉDIA DE PONTOS de todos os membros ativos do dept.
 * Incluir membros sem palpite (0 pts) é intencional — cria pressão coletiva para
 * 100% de participação e não permite que um dept "burle" a média excluindo baixos.
 *
 * Critérios de desempate:
 *   1. Média de pontos (↓)
 *   2. Taxa de participação — % com palpites finalizados (↓)
 *   3. Pontuação máxima individual (↓)
 */

import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type DeptRankEntry = {
  position:          number
  department:        string
  totalMembers:      number
  lockedMembers:     number
  participationRate: number     // 0–100
  avgPoints:         number     // métrica principal de ranking
  maxPoints:         number
  totalPoints:       number
  leader:            string | null
  leaderPoints:      number
  /** pontuação do membro com menos pontos (exclui 0 para não distorcer) */
  minActivePoints:   number
}

export type MyDeptStatus = {
  department:        string | null
  position:          number | null
  totalDepts:        number
  avgPoints:         number
  totalMembers:      number
  lockedMembers:     number
  participationRate: number
  leader:            string | null
  userIsLeader:      boolean
}

// ─── Ranking completo ─────────────────────────────────────────────────────────

export async function getDeptRanking(): Promise<DeptRankEntry[]> {
  // Agrega por departamento
  const rows = await db
    .select({
      department:    sql<string>`coalesce(${users.department}, 'Sem Departamento')`,
      totalMembers:  sql<number>`cast(count(*) as integer)`,
      lockedMembers: sql<number>`cast(sum(case when ${users.isPredictionLocked} = 1 then 1 else 0 end) as integer)`,
      avgPoints:     sql<number>`cast(round(avg(${users.totalPoints}), 2) as real)`,
      maxPoints:     sql<number>`cast(max(${users.totalPoints}) as integer)`,
      totalPoints:   sql<number>`cast(sum(${users.totalPoints}) as integer)`,
      minActivePoints: sql<number>`cast(min(case when ${users.totalPoints} > 0 then ${users.totalPoints} end) as integer)`,
    })
    .from(users)
    .where(eq(users.isActive, true))
    .groupBy(sql`coalesce(${users.department}, 'Sem Departamento')`)
    .orderBy(
      desc(sql`round(avg(${users.totalPoints}), 2)`),
      desc(sql`cast(sum(case when ${users.isPredictionLocked} = 1 then 1 else 0 end) as real) / count(*)`),
      desc(sql`max(${users.totalPoints})`),
    )

  // Busca o líder de cada departamento
  const allUsers = await db
    .select({
      name:       users.name,
      department: sql<string>`coalesce(${users.department}, 'Sem Departamento')`,
      points:     users.totalPoints,
    })
    .from(users)
    .where(eq(users.isActive, true))
    .orderBy(desc(users.totalPoints))

  // Mapa: departamento → melhor usuário
  const leaderMap = new Map<string, { name: string; points: number }>()
  for (const u of allUsers) {
    if (!leaderMap.has(u.department)) {
      leaderMap.set(u.department, { name: u.name, points: u.points })
    }
  }

  return rows.map((r, idx) => {
    const total  = Number(r.totalMembers)
    const locked = Number(r.lockedMembers)
    const leader = leaderMap.get(r.department)

    return {
      position:          idx + 1,
      department:        r.department,
      totalMembers:      total,
      lockedMembers:     locked,
      participationRate: total > 0 ? Math.round((locked / total) * 100) : 0,
      avgPoints:         Number(r.avgPoints ?? 0),
      maxPoints:         Number(r.maxPoints ?? 0),
      totalPoints:       Number(r.totalPoints ?? 0),
      leader:            leader?.name ?? null,
      leaderPoints:      leader?.points ?? 0,
      minActivePoints:   Number(r.minActivePoints ?? 0),
    }
  })
}

// ─── Status do departamento do usuário logado ─────────────────────────────────

export async function getMyDeptStatus(
  userId: string,
): Promise<MyDeptStatus> {
  // Busca o departamento do usuário
  const me = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { department: true, totalPoints: true },
  })

  const ranking   = await getDeptRanking()
  const totalDepts = ranking.length
  const myDept    = me?.department ?? null
  const deptLabel = myDept ?? 'Sem Departamento'
  const myEntry   = ranking.find((d) => d.department === deptLabel) ?? null

  return {
    department:        myDept,
    position:          myEntry?.position ?? null,
    totalDepts,
    avgPoints:         myEntry?.avgPoints ?? 0,
    totalMembers:      myEntry?.totalMembers ?? 0,
    lockedMembers:     myEntry?.lockedMembers ?? 0,
    participationRate: myEntry?.participationRate ?? 0,
    leader:            myEntry?.leader ?? null,
    userIsLeader:      myEntry?.leader === me?.totalPoints.toString()
      ? false
      : myEntry?.leaderPoints === me?.totalPoints,
  }
}

// ─── Top 3 para o pódio ───────────────────────────────────────────────────────

export async function getDeptPodium(): Promise<DeptRankEntry[]> {
  const ranking = await getDeptRanking()
  return ranking.slice(0, 3)
}
