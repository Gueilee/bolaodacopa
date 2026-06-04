'use client'

import type { TvMatch } from '@/lib/tv-data'
import { getFlagUrl } from '@/lib/flags'
import { phaseLabels } from '@/lib/utils'

function Flag({ team, size = 72 }: { team: string; size?: number }) {
  const url = getFlagUrl(team, size)
  if (!url) return <span style={{ fontSize: size * 0.6, lineHeight: 1 }}>🏳</span>
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url} alt={team}
      style={{ width: size, height: Math.round(size * 0.67), objectFit: 'cover', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}
    />
  )
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
}

export function SlideMatches({ matches }: { matches: TvMatch[] }) {
  if (matches.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <span style={{ fontSize: 90 }}>⏳</span>
        <p style={{ color: 'white', fontSize: 32, fontWeight: 800, margin: 0 }}>Copa começa em 11/06/2026</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20, margin: 0 }}>17h00 · Estádio Azteca · México × África do Sul</p>
      </div>
    )
  }

  const cols = matches.length === 1 ? 1 : matches.length <= 2 ? 2 : matches.length <= 4 ? 2 : 3
  const flagSize = matches.length <= 2 ? 88 : matches.length <= 4 ? 72 : 56

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '4px 48px 0', gap: 16 }}>
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 14,
        alignContent: 'center',
      }}>
        {matches.slice(0, 9).map((match) => {
          const isLive     = match.status === 'live'
          const isFinished = match.status === 'finished'
          const label      = match.groupName ?? phaseLabels[match.phase as keyof typeof phaseLabels] ?? match.phase

          return (
            <div
              key={match.id}
              style={{
                display: 'flex', flexDirection: 'column', gap: 0,
                background: isLive
                  ? 'linear-gradient(135deg, rgba(255,47,105,0.18) 0%, rgba(20,10,40,0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
                border: isLive
                  ? '2px solid rgba(255,47,105,0.6)'
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20,
                overflow: 'hidden',
              }}
            >
              {/* Top bar: phase + status/time */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 18px',
                background: 'rgba(0,0,0,0.25)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {label}
                </span>
                {isLive ? (
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: '#ff2f69',
                    background: 'rgba(255,47,105,0.2)', padding: '3px 12px', borderRadius: 20,
                    letterSpacing: '0.1em',
                  }}>
                    🔴 AO VIVO
                  </span>
                ) : isFinished ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
                    ENCERRADO
                  </span>
                ) : (
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#01E18E' }}>
                    {formatTime(match.matchDate)}
                  </span>
                )}
              </div>

              {/* Teams row */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '18px 18px 12px', gap: 8 }}>
                {/* Home */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <Flag team={match.homeTeam} size={flagSize} />
                  <p style={{
                    fontSize: matches.length <= 2 ? 18 : 14,
                    fontWeight: 800, color: 'white', margin: 0, textAlign: 'center', lineHeight: 1.2,
                  }}>
                    {match.homeTeam}
                  </p>
                </div>

                {/* Score / VS */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 90, gap: 4 }}>
                  {isFinished || isLive ? (
                    <>
                      <p style={{
                        fontSize: matches.length <= 4 ? 44 : 36,
                        fontWeight: 900, color: 'white', margin: 0,
                        fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                        textShadow: '0 0 30px rgba(1,225,142,0.4)',
                      }}>
                        {match.homeScore ?? 0}
                      </p>
                      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>×</span>
                      <p style={{
                        fontSize: matches.length <= 4 ? 44 : 36,
                        fontWeight: 900, color: 'white', margin: 0,
                        fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                      }}>
                        {match.awayScore ?? 0}
                      </p>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>VS</span>
                    </>
                  )}
                </div>

                {/* Away */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <Flag team={match.awayTeam} size={flagSize} />
                  <p style={{
                    fontSize: matches.length <= 2 ? 18 : 14,
                    fontWeight: 800, color: 'white', margin: 0, textAlign: 'center', lineHeight: 1.2,
                  }}>
                    {match.awayTeam}
                  </p>
                </div>
              </div>

              {/* Venue */}
              {match.venue && (
                <div style={{
                  padding: '8px 18px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'center',
                }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                    📍 {match.venue}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
