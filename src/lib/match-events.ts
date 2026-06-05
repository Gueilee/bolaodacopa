/**
 * Helpers para parsear os campos goalsJson / bookingsJson / subsJson
 * gravados pela sincronização com football-data.org.
 */

export type MatchGoalEvent = {
  minute:     number | null
  injuryTime: number | null
  type:       'REGULAR' | 'PENALTY' | 'OWN_GOAL'
  team:       string
  scorer:     string
  assist:     string | null
  scoreHome:  number
  scoreAway:  number
}

export type MatchBookingEvent = {
  minute: number | null
  team:   string
  player: string
  card:   'YELLOW' | 'RED' | 'YELLOW_RED'
}

export type MatchSubEvent = {
  minute:    number | null
  team:      string
  playerOut: string
  playerIn:  string
}

export function parseGoals(json: string | null | undefined): MatchGoalEvent[] {
  if (!json) return []
  try { return JSON.parse(json) as MatchGoalEvent[] } catch { return [] }
}

export function parseBookings(json: string | null | undefined): MatchBookingEvent[] {
  if (!json) return []
  try { return JSON.parse(json) as MatchBookingEvent[] } catch { return [] }
}

export function parseSubs(json: string | null | undefined): MatchSubEvent[] {
  if (!json) return []
  try { return JSON.parse(json) as MatchSubEvent[] } catch { return [] }
}

export function formatMinute(minute: number | null, injuryTime?: number | null): string {
  if (minute === null) return ''
  if (injuryTime) return `${minute}+${injuryTime}'`
  return `${minute}'`
}

export function goalIcon(type: MatchGoalEvent['type']): string {
  if (type === 'PENALTY')  return '⚽ P'
  if (type === 'OWN_GOAL') return '⚽ CG'
  return '⚽'
}
