'use client'

import type { TvMatch } from '@/lib/tv-data'
import { getFlagUrl } from '@/lib/flags'
import { phaseLabels } from '@/lib/utils'

function Flag({ team, size = 48 }: { team: string; size?: number }) {
  const url = getFlagUrl(team, size)
  if (!url) return null
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url} alt={team}
      style={{ width: size, height: Math.round(size * 0.67), objectFit: 'cover', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
    />
  )
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
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <span style={{ fontSize: 90 }}>⏳</span>
        <p style={{ color: 'white', fontSize: 32, fontWeight: 800, margin: 0 }}>Aguardando resultados</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20, margin: 0 }}>A Copa ainda não começou!</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '4px 48px 0', gap: 14 }}>
      <h2 style={{ fontSize: 32, fontWeight: 900, color: 'white', margin: 0, textAlign: 'center', letterSpacing: '0.04em' }}>
        📊 &nbsp;ÚLTIMOS RESULTADOS
      </h2>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center' }}>
        {matches.slice(0, 10).map((match) => {
          const w     = winner(match)
          const label = match.groupName ?? phaseLabels[match.phase as keyof typeof phaseLabels] ?? match.phase
          const flagSize = 44

          const homeWon  = w === 'home'
          const awayWon  = w === 'away'
          const isDraw   = w === 'draw'

          return (
            <div
              key={match.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 100px 1fr 120px 1fr 36px',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                padding: '12px 20px',
              }}
            >
              {/* Date */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                  {formatDate(match.matchDate)}
                </p>
              </div>

              {/* Phase / Group */}
              <div>
                <p style={{
                  fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0,
                }}>
                  {label}
                </p>
                {match.venue && (
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    📍 {match.venue}
                  </p>
                )}
              </div>

              {/* Home team */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end',
                opacity: awayWon ? 0.45 : 1,
              }}>
                <p style={{
                  fontSize: 17, fontWeight: homeWon ? 900 : 600,
                  color: homeWon ? 'white' : 'rgba(255,255,255,0.75)',
                  margin: 0, textAlign: 'right',
                }}>
                  {match.homeTeam}
                </p>
                <Flag team={match.homeTeam} size={flagSize} />
              </div>

              {/* Score */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 10, padding: '6px 14px',
              }}>
                <span style={{
                  fontSize: 28, fontWeight: 900,
                  color: homeWon ? '#01E18E' : 'white',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {match.homeScore}
                </span>
                <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>×</span>
                <span style={{
                  fontSize: 28, fontWeight: 900,
                  color: awayWon ? '#01E18E' : 'white',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {match.awayScore}
                </span>
              </div>

              {/* Away team */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: homeWon ? 0.45 : 1,
              }}>
                <Flag team={match.awayTeam} size={flagSize} />
                <p style={{
                  fontSize: 17, fontWeight: awayWon ? 900 : 600,
                  color: awayWon ? 'white' : 'rgba(255,255,255,0.75)',
                  margin: 0,
                }}>
                  {match.awayTeam}
                </p>
              </div>

              {/* Result icon */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 20 }}>
                  {isDraw ? '🤝' : '✅'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
