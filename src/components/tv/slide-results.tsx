'use client'

import type { TvMatch } from '@/lib/tv-data'
import { getFlagUrl } from '@/lib/flags'
import { phaseLabels } from '@/lib/utils'

function Flag({ team, size = 36 }: { team: string; size?: number }) {
  const url = getFlagUrl(team, size)
  if (!url) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={team} style={{ width: size, height: 'auto', borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
}

function winner(m: TvMatch): 'home' | 'away' | 'draw' {
  if (m.homeScore === null || m.awayScore === null) return 'draw'
  if (m.homeScore > m.awayScore) return 'home'
  if (m.awayScore > m.homeScore) return 'away'
  return 'draw'
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
}

export function SlideResults({ matches }: { matches: TvMatch[] }) {
  if (matches.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <span style={{ fontSize: 80 }}>⏳</span>
        <p style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>Aguardando resultados</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }}>A Copa ainda não começou!</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 60px', gap: 24 }}>
      <h2 style={{ fontSize: 36, fontWeight: 900, color: 'white', margin: 0, textAlign: 'center' }}>
        📊 Últimos Resultados
      </h2>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
        {matches.slice(0, 8).map((match) => {
          const w     = winner(match)
          const label = match.groupName ?? phaseLabels[match.phase as keyof typeof phaseLabels] ?? match.phase

          return (
            <div key={match.id} style={{
              display: 'flex', alignItems: 'center', gap: 20,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '14px 24px',
            }}>
              {/* Date */}
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', width: 48, textAlign: 'center', flexShrink: 0 }}>
                {formatDate(match.matchDate)}
              </span>

              {/* Label */}
              <span style={{
                fontSize: 10, color: 'rgba(255,255,255,0.3)', width: 90, flexShrink: 0,
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {label}
              </span>

              {/* Home */}
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end',
                opacity: w === 'away' ? 0.5 : 1,
              }}>
                <p style={{ fontSize: 16, fontWeight: w === 'home' ? 800 : 500, color: 'white', margin: 0 }}>
                  {match.homeTeam}
                </p>
                <Flag team={match.homeTeam} size={32} />
              </div>

              {/* Score */}
              <div style={{
                minWidth: 100, textAlign: 'center',
                fontSize: 28, fontWeight: 900, color: 'white',
                fontVariantNumeric: 'tabular-nums', flexShrink: 0,
              }}>
                {match.homeScore} <span style={{ color: 'rgba(255,255,255,0.3)' }}>×</span> {match.awayScore}
              </div>

              {/* Away */}
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                opacity: w === 'home' ? 0.5 : 1,
              }}>
                <Flag team={match.awayTeam} size={32} />
                <p style={{ fontSize: 16, fontWeight: w === 'away' ? 800 : 500, color: 'white', margin: 0 }}>
                  {match.awayTeam}
                </p>
              </div>

              {/* Winner indicator */}
              <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>
                {w === 'draw' ? '🤝' : '✅'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
