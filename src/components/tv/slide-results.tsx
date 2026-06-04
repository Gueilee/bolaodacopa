'use client'

import type { TvMatch } from '@/lib/tv-data'
import { getFlagUrl } from '@/lib/flags'
import { phaseLabels } from '@/lib/utils'

function Flag({ team, size = 48 }: { team: string; size?: number }) {
  const url = getFlagUrl(team, size)
  if (!url) return <span style={{ fontSize: size * 0.55, lineHeight: 1 }}>🏳</span>
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url} alt={team}
      style={{ width: size, height: Math.round(size * 0.67), objectFit: 'cover', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.5)', flexShrink: 0 }}
    />
  )
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour:     '2-digit',
    minute:   '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day:      '2-digit',
    month:    '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

function phaseLabel(match: TvMatch): string {
  if (match.groupName) return match.groupName
  return phaseLabels[match.phase as keyof typeof phaseLabels] ?? match.phase
}

function winner(m: TvMatch): 'home' | 'away' | 'draw' {
  if (m.homeScore === null || m.awayScore === null) return 'draw'
  if (m.homeScore > m.awayScore) return 'home'
  if (m.awayScore > m.homeScore) return 'away'
  return 'draw'
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 48px', gap: 10 }}>

      {/* Header */}
      <h2 style={{ fontSize: 28, fontWeight: 900, color: 'white', margin: 0, textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>
        📊 &nbsp;Últimos Resultados
      </h2>

      {/* Lista de resultados */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
        {matches.slice(0, 8).map((match) => {
          const w       = winner(match)
          const homeWon = w === 'home'
          const awayWon = w === 'away'
          const phase   = phaseLabel(match)
          const flagSz  = 40

          return (
            <div
              key={match.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '130px 1fr 110px 1fr 50px',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '12px 18px',
              }}
            >
              {/* Info da partida: data, hora, fase, estádio */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#01E18E' }}>
                    {formatTime(match.matchDate)}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Brasília</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {formatDate(match.matchDate)} · {phase}
                </span>
                {(match.venue || match.city) && (
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', lineHeight: 1.3 }}>
                    📍 {[match.venue, match.city].filter(Boolean).join(' — ')}
                  </span>
                )}
              </div>

              {/* Time da casa */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end',
                opacity: awayWon ? 0.5 : 1,
              }}>
                <p style={{
                  fontSize: 16, fontWeight: homeWon ? 900 : 600,
                  color: homeWon ? 'white' : 'rgba(255,255,255,0.75)',
                  margin: 0, textAlign: 'right', lineHeight: 1.2,
                }}>
                  {match.homeTeam}
                </p>
                <Flag team={match.homeTeam} size={flagSz} />
              </div>

              {/* Placar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: '8px 12px',
              }}>
                <span style={{
                  fontSize: 28, fontWeight: 900,
                  color: homeWon ? '#01E18E' : 'rgba(255,255,255,0.9)',
                  fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                }}>
                  {match.homeScore ?? '–'}
                </span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>×</span>
                <span style={{
                  fontSize: 28, fontWeight: 900,
                  color: awayWon ? '#01E18E' : 'rgba(255,255,255,0.9)',
                  fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                }}>
                  {match.awayScore ?? '–'}
                </span>
              </div>

              {/* Time visitante */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                opacity: homeWon ? 0.5 : 1,
              }}>
                <Flag team={match.awayTeam} size={flagSz} />
                <p style={{
                  fontSize: 16, fontWeight: awayWon ? 900 : 600,
                  color: awayWon ? 'white' : 'rgba(255,255,255,0.75)',
                  margin: 0, lineHeight: 1.2,
                }}>
                  {match.awayTeam}
                </p>
              </div>

              {/* Ícone de resultado */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 22 }}>
                  {w === 'draw' ? '🤝' : '✅'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
