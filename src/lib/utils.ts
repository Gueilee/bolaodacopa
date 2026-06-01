import type { MatchWithPrediction } from './queries'

// ─── Datas ───────────────────────────────────────────────────────────────────

export function formatMatchDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day:     '2-digit',
    month:   'short',
    timeZone: 'America/Sao_Paulo',
  }).format(date)
}

export function formatMatchTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour:   '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(date)
}

export function formatDateKey(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(date)
}

// ─── Agrupamento de partidas por data ────────────────────────────────────────

export function groupMatchesByDate(
  matches: MatchWithPrediction[],
): Map<string, MatchWithPrediction[]> {
  const grouped = new Map<string, MatchWithPrediction[]>()

  for (const match of matches) {
    const key = formatDateKey(match.matchDate)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(match)
  }

  return grouped
}

// ─── Fases ───────────────────────────────────────────────────────────────────

export const phaseLabels: Record<string, string> = {
  group:        'Fase de Grupos',
  round_of_32:  '1ª Fase Eliminatória',
  round_of_16:  'Oitavas de Final',
  quarter_final:'Quartas de Final',
  semi_final:   'Semifinal',
  third_place:  '3º Lugar',
  final:        'Final',
}

export const phaseOrder: Record<string, number> = {
  group:         0,
  round_of_32:   1,
  round_of_16:   2,
  quarter_final: 3,
  semi_final:    4,
  third_place:   5,
  final:         6,
}

// ─── Nomes → Iniciais ────────────────────────────────────────────────────────

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

// ─── Medalhas de ranking ──────────────────────────────────────────────────────

export function positionBadge(pos: number): string {
  if (pos === 1) return '🥇'
  if (pos === 2) return '🥈'
  if (pos === 3) return '🥉'
  return `${pos}º`
}

// ─── Countdown até o bloqueio ─────────────────────────────────────────────────

export function lockCountdownLabel(matchDate: Date, now = new Date()): string | null {
  const lockAt    = new Date(matchDate.getTime() - 15 * 60 * 1000)
  const remaining = lockAt.getTime() - now.getTime()

  if (remaining <= 0) return null // já bloqueado

  const mins = Math.floor(remaining / 60_000)
  const secs = Math.floor((remaining % 60_000) / 1000)

  if (mins > 60) return null // mais de 1h — não mostra contador
  if (mins > 0)  return `Fecha em ${mins}m ${secs}s`
  return `Fecha em ${secs}s`
}
