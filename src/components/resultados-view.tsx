'use client'

import { useState } from 'react'
import { getFlagUrl } from '@/lib/flags'
import { phaseLabels } from '@/lib/utils'
import {
  parseGoals, parseBookings, parseSubs, formatMinute,
} from '@/lib/match-events'
import type { matches } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

type Match = InferSelectModel<typeof matches>

const DISPLAY_NAME: Record<string, string> = { 'Países Baixos': 'Holanda' }
function dn(n: string) { return DISPLAY_NAME[n] ?? n }

function Flag({ team, size = 32 }: { team: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  const url = getFlagUrl(dn(team), size)
  const h = Math.round(size * 0.67)
  if (!url || failed) return <span style={{ fontSize: size * 0.55 }}>🏳</span>
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={dn(team)} width={size} height={h}
    style={{ objectFit: 'cover', borderRadius: 3, flexShrink: 0 }}
    onError={() => setFailed(true)} />
}

function fmtTime(d: Date | string) {
  return new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
}
function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
}

function phaseLabel(m: Match): string {
  if (m.groupName) return m.groupName
  return phaseLabels[m.phase as keyof typeof phaseLabels] ?? m.phase
}

// ─── Card expandível ──────────────────────────────────────────────────────────

function MatchResultCard({ match }: { match: Match }) {
  const [open, setOpen] = useState(false)

  const goals    = parseGoals(match.goalsJson)
  const bookings = parseBookings(match.bookingsJson)
  const subs     = parseSubs(match.subsJson)

  const homeWon  = (match.homeScore ?? 0) > (match.awayScore ?? 0)
  const awayWon  = (match.awayScore ?? 0) > (match.homeScore ?? 0)
  const hasEvents = goals.length > 0 || bookings.length > 0 || subs.length > 0

  const homeGoals = goals.filter(g => g.type !== 'OWN_GOAL'
    ? g.team === match.homeTeam || g.team === dn(match.homeTeam)
    : g.team === match.awayTeam || g.team === dn(match.awayTeam))
  const awayGoals = goals.filter(g => g.type !== 'OWN_GOAL'
    ? g.team === match.awayTeam || g.team === dn(match.awayTeam)
    : g.team === match.homeTeam || g.team === dn(match.homeTeam))

  const yellowsHome = bookings.filter(b => b.card === 'YELLOW' && (b.team === match.homeTeam || b.team === dn(match.homeTeam))).length
  const redsHome    = bookings.filter(b => b.card !== 'YELLOW'  && (b.team === match.homeTeam || b.team === dn(match.homeTeam))).length
  const yellowsAway = bookings.filter(b => b.card === 'YELLOW' && (b.team === match.awayTeam || b.team === dn(match.awayTeam))).length
  const redsAway    = bookings.filter(b => b.card !== 'YELLOW'  && (b.team === match.awayTeam || b.team === dn(match.awayTeam))).length

  const subsHome = subs.filter(s => s.team === match.homeTeam || s.team === dn(match.homeTeam))
  const subsAway = subs.filter(s => s.team === match.awayTeam || s.team === dn(match.awayTeam))

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

      {/* Cabeçalho clicável */}
      <button
        onClick={() => hasEvents && setOpen(o => !o)}
        style={{ width: '100%', background: 'none', border: 'none', cursor: hasEvents ? 'pointer' : 'default',
          padding: '14px 16px', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Meta */}
          <div style={{ minWidth: 100, flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#422c76' }}>{fmtTime(match.matchDate)}</div>
            <div style={{ fontSize: 10, color: '#aaa8b0' }}>{fmtDate(match.matchDate)}</div>
            <div style={{ fontSize: 10, color: '#c4bfba', marginTop: 2, fontWeight: 600 }}>{phaseLabel(match)}</div>
          </div>

          {/* Casa */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 14, fontWeight: homeWon ? 900 : 600,
              color: homeWon ? '#1a1625' : '#6b6672', textAlign: 'right',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {dn(match.homeTeam)}
            </span>
            <Flag team={match.homeTeam} size={28} />
            {/* Cartões resumo casa */}
            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
              {Array.from({ length: yellowsHome }).map((_, i) => (
                <span key={i} style={{ display: 'inline-block', width: 8, height: 11, background: '#f59e0b', borderRadius: 1 }} />
              ))}
              {Array.from({ length: redsHome }).map((_, i) => (
                <span key={i} style={{ display: 'inline-block', width: 8, height: 11, background: '#ef4444', borderRadius: 1 }} />
              ))}
            </div>
          </div>

          {/* Placar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
            background: '#f5f2ef', borderRadius: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: homeWon ? '#422c76' : '#1a1625', fontVariantNumeric: 'tabular-nums' }}>
              {match.homeScore}
            </span>
            <span style={{ fontSize: 12, color: '#c4bfba' }}>×</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: awayWon ? '#422c76' : '#1a1625', fontVariantNumeric: 'tabular-nums' }}>
              {match.awayScore}
            </span>
            {match.matchResult && match.matchResult !== 'FT' && (
              <span style={{ fontSize: 9, fontWeight: 700, color: '#8a8490', paddingLeft: 2 }}>
                {match.matchResult === 'AET' ? 'P.E.' : 'Pên.'}
              </span>
            )}
          </div>

          {/* Visitante */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {/* Cartões resumo visitante */}
            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
              {Array.from({ length: yellowsAway }).map((_, i) => (
                <span key={i} style={{ display: 'inline-block', width: 8, height: 11, background: '#f59e0b', borderRadius: 1 }} />
              ))}
              {Array.from({ length: redsAway }).map((_, i) => (
                <span key={i} style={{ display: 'inline-block', width: 8, height: 11, background: '#ef4444', borderRadius: 1 }} />
              ))}
            </div>
            <Flag team={match.awayTeam} size={28} />
            <span style={{ fontSize: 14, fontWeight: awayWon ? 900 : 600, color: awayWon ? '#1a1625' : '#6b6672',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {dn(match.awayTeam)}
            </span>
          </div>

          {/* Expand icon */}
          {hasEvents && (
            <span style={{ fontSize: 12, color: '#c4bfba', flexShrink: 0, transition: 'transform 0.2s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>
              ▾
            </span>
          )}
        </div>

        {/* Gols resumo (sempre visível) */}
        {goals.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: 4, marginTop: 10, paddingTop: 8,
            borderTop: '1px solid #f5f2ef' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
              {homeGoals.map((g, i) => (
                <span key={i} style={{ fontSize: 11, color: '#4a4555' }}>
                  {g.type === 'OWN_GOAL' ? 'CG' : '⚽'} {g.scorer.split(' ').slice(-1)[0]} {formatMinute(g.minute, g.injuryTime)}
                </span>
              ))}
            </div>
            <div />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {awayGoals.map((g, i) => (
                <span key={i} style={{ fontSize: 11, color: '#4a4555' }}>
                  {g.type === 'OWN_GOAL' ? 'CG' : '⚽'} {g.scorer.split(' ').slice(-1)[0]} {formatMinute(g.minute, g.injuryTime)}
                </span>
              ))}
            </div>
          </div>
        )}
      </button>

      {/* Detalhes expandidos */}
      {open && hasEvents && (
        <div style={{ borderTop: '1px solid #f0ede8', padding: '14px 16px',
          background: 'rgba(66,44,118,0.02)', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Cartões detalhados */}
          {bookings.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase',
                letterSpacing: '0.1em', margin: '0 0 8px' }}>Cartões</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {bookings.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 10, height: 14, borderRadius: 2, flexShrink: 0,
                      background: b.card === 'YELLOW' ? '#f59e0b' : '#ef4444' }} />
                    <span style={{ fontSize: 12, color: '#4a4555', flex: 1 }}>
                      {b.player} <span style={{ color: '#aaa8b0' }}>({dn(b.team)})</span>
                    </span>
                    <span style={{ fontSize: 11, color: '#aaa8b0', fontVariantNumeric: 'tabular-nums' }}>
                      {formatMinute(b.minute)}&apos;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Substituições */}
          {subs.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase',
                letterSpacing: '0.1em', margin: '0 0 8px' }}>Substituições</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[subsHome, subsAway].map((teamSubs, ti) => (
                  <div key={ti} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa8b0', marginBottom: 2 }}>
                      {ti === 0 ? dn(match.homeTeam) : dn(match.awayTeam)}
                    </span>
                    {teamSubs.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span style={{ fontSize: 11, color: '#aaa8b0', flexShrink: 0, marginTop: 1 }}>
                          {formatMinute(s.minute)}&apos;
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <span style={{ fontSize: 11, color: '#01916a' }}>▲ {s.playerIn.split(' ').slice(-1)[0]}</span>
                          <span style={{ fontSize: 11, color: '#aaa8b0' }}>▼ {s.playerOut.split(' ').slice(-1)[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local */}
          {(match.venue || match.city) && (
            <p style={{ fontSize: 11, color: '#aaa8b0', margin: 0 }}>
              📍 {[match.venue, match.city].filter(Boolean).join(' — ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ResultadosView({ matches }: { matches: Match[] }) {
  if (matches.length === 0) {
    return (
      <div className="card p-12" style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>⏳</span>
        <p style={{ fontWeight: 700, fontSize: 16, color: '#1a1625', margin: '0 0 6px' }}>Nenhum jogo encerrado ainda</p>
        <p style={{ fontSize: 13, color: '#8a8490', margin: 0 }}>Os resultados aparecerão aqui após o início da Copa.</p>
      </div>
    )
  }

  // Agrupa por data
  const byDate = new Map<string, Match[]>()
  for (const m of matches) {
    const key = new Date(m.matchDate).toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', timeZone: 'America/Sao_Paulo',
    })
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(m)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {[...byDate.entries()].map(([date, ms]) => (
        <section key={date}>
          <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize', letterSpacing: '0.08em',
            color: '#422c76', margin: '0 0 10px 2px', borderBottom: '2px solid rgba(66,44,118,0.12)',
            paddingBottom: 6 }}>
            {date}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ms.map(m => <MatchResultCard key={m.id} match={m} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
