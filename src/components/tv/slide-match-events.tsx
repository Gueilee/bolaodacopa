'use client'

import type { TvMatch } from '@/lib/tv-data'
import { getFlagUrl } from '@/lib/flags'
import { phaseLabels } from '@/lib/utils'
import { parseGoals, parseBookings, parseSubs, formatMinute } from '@/lib/match-events'

function Flag({ team, size = 64 }: { team: string; size?: number }) {
  const url = getFlagUrl(team, size)
  if (!url) return <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>🏳</span>
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={team} style={{ width: size, height: Math.round(size * 0.67),
    objectFit: 'cover', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.6)', flexShrink: 0 }} />
}

function phaseLabel(m: TvMatch) {
  if (m.groupName) return m.groupName
  return phaseLabels[m.phase as keyof typeof phaseLabels] ?? m.phase
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', timeZone: 'America/Sao_Paulo',
  })
}

export function SlideMatchEvents({ match }: { match: TvMatch | null }) {
  if (!match) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <span style={{ fontSize: 72 }}>⚽</span>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 22, fontWeight: 700, margin: 0 }}>Aguardando próximo jogo</p>
      </div>
    )
  }

  const goals    = parseGoals(match.goalsJson)
  const bookings = parseBookings(match.bookingsJson)
  const subs     = parseSubs(match.subsJson)

  const homeWon = (match.homeScore ?? 0) > (match.awayScore ?? 0)
  const awayWon = (match.awayScore ?? 0) > (match.homeScore ?? 0)

  const homeGoals = goals.filter(g => g.type !== 'OWN_GOAL'
    ? g.team === match.homeTeam : g.team === match.awayTeam)
  const awayGoals = goals.filter(g => g.type !== 'OWN_GOAL'
    ? g.team === match.awayTeam : g.team === match.homeTeam)

  const homeBookings = bookings.filter(b => b.team === match.homeTeam)
  const awayBookings = bookings.filter(b => b.team === match.awayTeam)
  const homeSubs     = subs.filter(s => s.team === match.homeTeam)
  const awaySubs     = subs.filter(s => s.team === match.awayTeam)

  const yellowsHome = homeBookings.filter(b => b.card === 'YELLOW').length
  const redsHome    = homeBookings.filter(b => b.card !== 'YELLOW').length
  const yellowsAway = awayBookings.filter(b => b.card === 'YELLOW').length
  const redsAway    = awayBookings.filter(b => b.card !== 'YELLOW').length

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 52px', gap: 20 }}>

      {/* Fase + Data */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#01E18E', textTransform: 'uppercase',
          letterSpacing: '0.16em', background: 'rgba(1,225,142,0.1)', padding: '3px 12px', borderRadius: 20 }}>
          {phaseLabel(match)}
        </span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
          {formatDate(match.matchDate)}
        </span>
      </div>

      {/* Placar principal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>

        {/* Time da casa */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <Flag team={match.homeTeam} size={72} />
          <p style={{ fontSize: 22, fontWeight: homeWon ? 900 : 600, color: homeWon ? 'white' : 'rgba(255,255,255,0.6)',
            margin: 0, textAlign: 'right', lineHeight: 1.2, maxWidth: 220 }}>
            {match.homeTeam}
          </p>
          {/* Gols casa */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end', minHeight: 48 }}>
            {homeGoals.map((g, i) => (
              <span key={i} style={{ fontSize: 13, color: homeWon ? 'rgba(1,225,142,0.9)' : 'rgba(255,255,255,0.5)' }}>
                {g.type === 'OWN_GOAL' ? '⚽ CG' : '⚽'} {g.scorer.split(' ').slice(-1)[0]}{' '}
                <span style={{ fontSize: 11, opacity: 0.7 }}>{formatMinute(g.minute, g.injuryTime)}</span>
              </span>
            ))}
          </div>
          {/* Cartões casa */}
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: yellowsHome }).map((_, i) => (
              <span key={i} style={{ display: 'inline-block', width: 12, height: 17, background: '#f59e0b', borderRadius: 2 }} />
            ))}
            {Array.from({ length: redsHome }).map((_, i) => (
              <span key={i} style={{ display: 'inline-block', width: 12, height: 17, background: '#ef4444', borderRadius: 2 }} />
            ))}
          </div>
        </div>

        {/* Placar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16,
            background: 'rgba(0,0,0,0.5)', borderRadius: 18, padding: '14px 24px' }}>
            <span style={{ fontSize: 64, fontWeight: 900, color: homeWon ? '#01E18E' : 'white',
              fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {match.homeScore ?? '–'}
            </span>
            <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>×</span>
            <span style={{ fontSize: 64, fontWeight: 900, color: awayWon ? '#01E18E' : 'white',
              fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {match.awayScore ?? '–'}
            </span>
          </div>
          {match.matchResult && match.matchResult !== 'FT' && (
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
              {match.matchResult === 'AET' ? '⏱ Prorrogação' : '🎯 Pênaltis'}
            </span>
          )}
          {match.venue && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              📍 {match.venue}
            </span>
          )}
        </div>

        {/* Time visitante */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
          <Flag team={match.awayTeam} size={72} />
          <p style={{ fontSize: 22, fontWeight: awayWon ? 900 : 600, color: awayWon ? 'white' : 'rgba(255,255,255,0.6)',
            margin: 0, lineHeight: 1.2, maxWidth: 220 }}>
            {match.awayTeam}
          </p>
          {/* Gols visitante */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minHeight: 48 }}>
            {awayGoals.map((g, i) => (
              <span key={i} style={{ fontSize: 13, color: awayWon ? 'rgba(1,225,142,0.9)' : 'rgba(255,255,255,0.5)' }}>
                {g.type === 'OWN_GOAL' ? '⚽ CG' : '⚽'} {g.scorer.split(' ').slice(-1)[0]}{' '}
                <span style={{ fontSize: 11, opacity: 0.7 }}>{formatMinute(g.minute, g.injuryTime)}</span>
              </span>
            ))}
          </div>
          {/* Cartões visitante */}
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: yellowsAway }).map((_, i) => (
              <span key={i} style={{ display: 'inline-block', width: 12, height: 17, background: '#f59e0b', borderRadius: 2 }} />
            ))}
            {Array.from({ length: redsAway }).map((_, i) => (
              <span key={i} style={{ display: 'inline-block', width: 12, height: 17, background: '#ef4444', borderRadius: 2 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Substituições (se houver) */}
      {(homeSubs.length > 0 || awaySubs.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16,
          borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            {homeSubs.slice(0, 4).map((s, i) => (
              <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                🔄 {formatMinute(s.minute)}&apos; {s.playerIn.split(' ').slice(-1)[0]} ↔ {s.playerOut.split(' ').slice(-1)[0]}
              </span>
            ))}
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {awaySubs.slice(0, 4).map((s, i) => (
              <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                🔄 {formatMinute(s.minute)}&apos; {s.playerIn.split(' ').slice(-1)[0]} ↔ {s.playerOut.split(' ').slice(-1)[0]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
