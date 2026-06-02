'use server'

import { db } from '@/lib/db'
import { matches, predictions, users } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { phaseOrder, phaseLabels } from '@/lib/utils'

export type HistoryEntry = {
  matchId:      string
  phase:        string
  phaseLabel:   string
  groupName:    string | null
  matchNumber:  number
  matchDate:    Date
  homeTeam:     string
  awayTeam:     string
  actualHome:   number | null
  actualAway:   number | null
  status:       string
  predHome:     number | null
  predAway:     number | null
  points:       number
  isScored:     boolean
  breakdown:    string | null
}

export type UserHistory = {
  userId:       string
  name:         string
  department:   string | null
  position:     number
  totalPoints:  number
  filledCount:  number
  exactCount:   number
  winnerCount:  number
  totalMatches: number
  entries:      HistoryEntry[]
}

export async function getUserHistory(
  targetUserId: string,
  position: number,
): Promise<UserHistory | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
    columns: { id: true, name: true, department: true, totalPoints: true },
  })
  if (!user) return null

  // Todas as partidas com o palpite do usuário (left join via with)
  const allMatches = await db.query.matches.findMany({
    orderBy: [asc(matches.matchNumber)],
    with: {
      predictions: {
        where: eq(predictions.userId, targetUserId),
      },
    },
  })

  let filledCount = 0, exactCount = 0, winnerCount = 0

  const entries: HistoryEntry[] = allMatches.map((m) => {
    const pred = m.predictions[0] ?? null
    if (pred) {
      filledCount++
      if (pred.isScored) {
        if (pred.points === 10) exactCount++
        if (pred.points === 5 || pred.points === 7) winnerCount++
      }
    }
    return {
      matchId:     m.id,
      phase:       m.phase,
      phaseLabel:  phaseLabels[m.phase as keyof typeof phaseLabels] ?? m.phase,
      groupName:   m.groupName,
      matchNumber: m.matchNumber,
      matchDate:   m.matchDate,
      homeTeam:    m.homeTeam,
      awayTeam:    m.awayTeam,
      actualHome:  m.homeScore ?? null,
      actualAway:  m.awayScore ?? null,
      status:      m.status,
      predHome:    pred?.homeScore ?? null,
      predAway:    pred?.awayScore ?? null,
      points:      pred?.points ?? 0,
      isScored:    pred?.isScored ?? false,
      breakdown:   pred?.pointsBreakdown ?? null,
    }
  })

  // Ordena fases pela ordem correta
  entries.sort((a, b) => {
    const po = (phaseOrder[a.phase as keyof typeof phaseOrder] ?? 99) -
               (phaseOrder[b.phase as keyof typeof phaseOrder] ?? 99)
    return po !== 0 ? po : a.matchNumber - b.matchNumber
  })

  return {
    userId:      user.id,
    name:        user.name,
    department:  user.department,
    position,
    totalPoints: user.totalPoints,
    filledCount,
    exactCount,
    winnerCount,
    totalMatches: allMatches.length,
    entries,
  }
}
