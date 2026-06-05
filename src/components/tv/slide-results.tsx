'use client'

import type { TvMatch } from '@/lib/tv-data'
import { getFlagUrl } from '@/lib/flags'
import { phaseLabels } from '@/lib/utils'
import { parseGoals, formatMinute } from '@/lib/match-events'

function Flag({ team, size = 48 }: { team: string; size?: number }) {
  const url = getFlagUrl(team, size)
  if (!url) return <span style={{ fontSize: size * 0.55, lineHeight: 1 }}>🏳</span>
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src={url} alt={team}
      style={{ width: size, height: Math.round(size * 0.67), objectFit: 'cover', borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)', flexShrink: 0 }} />
  )
}

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
}
function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 48px', gap: 8 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center' }}>
        {matches.slice(0, 7).map((match) => {
          const w       = winner(match)
          const homeWon = w === 'home'
          const awayWon = w === 'away'
          const phase   = phaseLabel(match)
          const goals   = parseGoals(match.goalsJson)
          const flagSz  = 40

          const homeGoals = goals.filter(g => g.type !== 'OWN_GOAL'
            ? g.team === match.homeTeam : g.team === match.awayTeam)
          const awayGoals = goals.filter(g => g.type !== 'OWN_GOAL'
            ? g.team === match.awayTeam : g.team === match.homeTeam)

          return (
            <div key={match.id} style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 110px 1fr 44px',
              alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '10px 16px',
            }}>
              {/* Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#01E18E' }}>{formatTime(match.matchDate)}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>BRT</span>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {formatDate(match.matchDate)} · {phase}
                </span>
                {match.matchResult && match.matchResult !== 'FT' && (
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                    {match.matchResult === 'AET' ? 'Prorr.' : 'Pênaltis'}
                  </span>
                )}
              </div>

              {/* Casa */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: awayWon ? 0.5 : 1 }}>
                  <p style={{ fontSize: 15, fontWeight: homeWon ? 900 : 600,
                    color: homeWon ? 'white' : 'rgba(255,255,255,0.7)', margin: 0, textAlign: 'right', lineHeight: 1.2 }}>
                    {match.homeTeam}
                  </p>
                  <Flag team={match.homeTeam} size={flagSz} />
                </div>
                {homeGoals.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    {homeGoals.slice(0, 3).map((g, i) => (
                      <span key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                        ⚽ {g.scorer.split(' ').slice(-1)[0]} {formatMinute(g.minute)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Placar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: '8px 10px', flexShrink: 0 }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: homeWon ? '#01E18E' : 'rgba(255,255,255,0.9)',
                  fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {match.homeScore ?? '–'}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>×</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: awayWon ? '#01E18E' : 'rgba(255,255,255,0.9)',
                  fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {match.awayScore ?? '–'}
                </span>
              </div>

              {/* Visitante */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: homeWon ? 0.5 : 1 }}>
                  <Flag team={match.awayTeam} size={flagSz} />
                  <p style={{ fontSize: 15, fontWeight: awayWon ? 900 : 600,
                    color: awayWon ? 'white' : 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.2 }}>
                    {match.awayTeam}
                  </p>
                </div>
                {awayGoals.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {awayGoals.slice(0, 3).map((g, i) => (
                      <span key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                        ⚽ {g.scorer.split(' ').slice(-1)[0]} {formatMinute(g.minute)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Ícone */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 20 }}>{w === 'draw' ? '🤝' : '✅'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
