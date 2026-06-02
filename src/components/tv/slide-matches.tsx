'use client'

import type { TvMatch } from '@/lib/tv-data'
import { getFlagUrl } from '@/lib/flags'
import { phaseLabels } from '@/lib/utils'

function Flag({ team, size = 48 }: { team: string; size?: number }) {
  const url = getFlagUrl(team, size)
  if (!url) return <span style={{ fontSize: size * 0.8 }}>🏳</span>
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={team} style={{ width: size, height: 'auto', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }} />
}

function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
}

export function SlideMatches({ matches }: { matches: TvMatch[] }) {
  if (matches.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <span style={{ fontSize: 80 }}>📅</span>
        <p style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>Nenhum jogo hoje</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }}>Confira o calendário completo no sistema</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 60px', gap: 24 }}>
      <h2 style={{ fontSize: 36, fontWeight: 900, color: 'white', margin: 0, textAlign: 'center' }}>
        ⚽ Jogos de Hoje
      </h2>

      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: matches.length === 1 ? '1fr' : matches.length <= 4 ? '1fr 1fr' : '1fr 1fr 1fr',
        gap: 16, alignContent: 'center',
      }}>
        {matches.slice(0, 6).map((match) => {
          const isLive     = match.status === 'live'
          const isFinished = match.status === 'finished'
          const label      = match.groupName ?? phaseLabels[match.phase as keyof typeof phaseLabels] ?? match.phase

          return (
            <div key={match.id} style={{
              background: isLive
                ? 'linear-gradient(135deg, rgba(255,47,105,0.15), rgba(255,47,105,0.05))'
                : 'rgba(255,255,255,0.05)',
              border: isLive
                ? '2px solid rgba(255,47,105,0.5)'
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, padding: '20px 24px',
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              {/* Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                }}>
                  {label}
                </span>
                {isLive ? (
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: '#ff2f69',
                    background: 'rgba(255,47,105,0.2)', padding: '3px 10px', borderRadius: 20,
                    animation: 'pulse 1s infinite',
                  }}>
                    🔴 AO VIVO
                  </span>
                ) : (
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                    {formatTime(match.matchDate)}
                  </span>
                )}
              </div>

              {/* Teams + Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <Flag team={match.homeTeam} size={40} />
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0, textAlign: 'right' }}>
                    {match.homeTeam}
                  </p>
                </div>

                <div style={{ textAlign: 'center', minWidth: 80 }}>
                  {isFinished || isLive ? (
                    <p style={{ fontSize: 36, fontWeight: 900, color: 'white', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                      {match.homeScore ?? 0} × {match.awayScore ?? 0}
                    </p>
                  ) : (
                    <p style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                      ×
                    </p>
                  )}
                  {isFinished && (
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>ENCERRADO</p>
                  )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                  <Flag team={match.awayTeam} size={40} />
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                    {match.awayTeam}
                  </p>
                </div>
              </div>

              {match.venue && (
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0, textAlign: 'center' }}>
                  📍 {match.venue}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
