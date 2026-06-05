'use client'

import { useState } from 'react'
import { getFlagUrl } from '@/lib/flags'
import { phaseLabels } from '@/lib/utils'
import { parseGoals, parseBookings, parseSubs, formatMinute } from '@/lib/match-events'
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
    style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
    onError={() => setFailed(true)} />
}

function fmtTime(d: Date | string) {
  return new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
}
function fmtFullDate(d: Date | string) {
  return new Date(d).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo',
  })
}
function fmtShortDate(d: Date | string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
}

function phaseLabel(m: Match): string {
  if (m.groupName) return m.groupName
  return phaseLabels[m.phase as keyof typeof phaseLabels] ?? m.phase
}

// ─── Navegador de jogo (detalhe completo) ─────────────────────────────────────

function MatchViewer({ matches, index, onNav }: {
  matches: Match[]
  index:   number
  onNav:   (i: number) => void
}) {
  const m        = matches[index]
  const goals    = parseGoals(m.goalsJson)
  const bookings = parseBookings(m.bookingsJson)
  const subs     = parseSubs(m.subsJson)

  const homeWon  = (m.homeScore ?? 0) > (m.awayScore ?? 0)
  const awayWon  = (m.awayScore ?? 0) > (m.homeScore ?? 0)

  // Gols por time (próprios invertidos)
  const homeGoals = goals.filter(g => g.type !== 'OWN_GOAL'
    ? g.team === m.homeTeam : g.team === m.awayTeam)
  const awayGoals = goals.filter(g => g.type !== 'OWN_GOAL'
    ? g.team === m.awayTeam : g.team === m.homeTeam)

  // Cartões por time
  const homeBookings = bookings.filter(b => b.team === m.homeTeam)
  const awayBookings = bookings.filter(b => b.team === m.awayTeam)

  // Subs por time
  const homeSubs = subs.filter(s => s.team === m.homeTeam)
  const awaySubs = subs.filter(s => s.team === m.awayTeam)

  const hasEvents = goals.length > 0 || bookings.length > 0 || subs.length > 0

  return (
    <div style={{
      background: 'linear-gradient(160deg, #0d0920 0%, #1a0d36 60%, #0d0920 100%)',
      borderRadius: 20, overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
    }}>

      {/* Navegação topo */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <button
          onClick={() => onNav(index - 1)}
          disabled={index === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer',
            color: index === 0 ? 'rgba(255,255,255,0.2)' : '#01E18E',
            fontSize: 13, fontWeight: 700, padding: '6px 12px',
            borderRadius: 8, transition: 'background 0.15s',
          }}
        >
          ← Mais recente
        </button>

        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            Jogo {index + 1} de {matches.length}
          </span>
        </div>

        <button
          onClick={() => onNav(index + 1)}
          disabled={index === matches.length - 1}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: index === matches.length - 1 ? 'not-allowed' : 'pointer',
            color: index === matches.length - 1 ? 'rgba(255,255,255,0.2)' : '#01E18E',
            fontSize: 13, fontWeight: 700, padding: '6px 12px',
            borderRadius: 8, transition: 'background 0.15s',
          }}
        >
          Mais antigo →
        </button>
      </div>

      {/* Cabeçalho do jogo */}
      <div style={{ padding: '18px 24px 0', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#01E18E',
            background: 'rgba(1,225,142,0.1)', padding: '3px 12px',
            borderRadius: 20, letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            {phaseLabel(m)}
          </span>
          {m.matchResult && m.matchResult !== 'FT' && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              {m.matchResult === 'AET' ? '· Prorrogação' : '· Pênaltis'}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0', textTransform: 'capitalize' }}>
          {fmtFullDate(m.matchDate)} · {fmtTime(m.matchDate)} (Brasília)
        </p>
        {(m.venue || m.city) && (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '2px 0 0' }}>
            📍 {[m.venue, m.city].filter(Boolean).join(' — ')}
          </p>
        )}
      </div>

      {/* Placar principal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '24px 24px 20px' }}>
        {/* Casa */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <Flag team={m.homeTeam} size={56} />
          <p style={{
            fontSize: 18, fontWeight: homeWon ? 900 : 600, margin: 0, textAlign: 'right',
            color: homeWon ? 'white' : 'rgba(255,255,255,0.55)', lineHeight: 1.2, maxWidth: 160,
          }}>
            {dn(m.homeTeam)}
          </p>
          {/* Gols casa */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end', minHeight: 40 }}>
            {homeGoals.map((g, i) => (
              <span key={i} style={{ fontSize: 12, color: homeWon ? 'rgba(1,225,142,0.85)' : 'rgba(255,255,255,0.45)' }}>
                {g.type === 'OWN_GOAL' ? '⚽ CG' : '⚽'} {g.scorer.split(' ').slice(-1)[0]}{' '}
                <span style={{ opacity: 0.7, fontSize: 11 }}>{formatMinute(g.minute, g.injuryTime)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Placar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'rgba(0,0,0,0.45)', borderRadius: 16, padding: '16px 22px',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 56, fontWeight: 900, color: homeWon ? '#01E18E' : 'white',
            fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {m.homeScore ?? '–'}
          </span>
          <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>×</span>
          <span style={{ fontSize: 56, fontWeight: 900, color: awayWon ? '#01E18E' : 'white',
            fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {m.awayScore ?? '–'}
          </span>
        </div>

        {/* Visitante */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
          <Flag team={m.awayTeam} size={56} />
          <p style={{
            fontSize: 18, fontWeight: awayWon ? 900 : 600, margin: 0,
            color: awayWon ? 'white' : 'rgba(255,255,255,0.55)', lineHeight: 1.2, maxWidth: 160,
          }}>
            {dn(m.awayTeam)}
          </p>
          {/* Gols visitante */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minHeight: 40 }}>
            {awayGoals.map((g, i) => (
              <span key={i} style={{ fontSize: 12, color: awayWon ? 'rgba(1,225,142,0.85)' : 'rgba(255,255,255,0.45)' }}>
                {g.type === 'OWN_GOAL' ? '⚽ CG' : '⚽'} {g.scorer.split(' ').slice(-1)[0]}{' '}
                <span style={{ opacity: 0.7, fontSize: 11 }}>{formatMinute(g.minute, g.injuryTime)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Eventos detalhados */}
      {hasEvents && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1px 1fr',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          margin: '0 0 0 0',
        }}>
          {/* Casa */}
          <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
              {dn(m.homeTeam)}
            </p>

            {homeBookings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
                  textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Cartões</p>
                {homeBookings.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ display: 'inline-block', width: 9, height: 13, borderRadius: 2, flexShrink: 0,
                      background: b.card === 'YELLOW' ? '#f59e0b' : '#ef4444' }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', flex: 1 }}>
                      {b.player.split(' ').slice(-1)[0]}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatMinute(b.minute)}&apos;
                    </span>
                  </div>
                ))}
              </div>
            )}

            {homeSubs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
                  textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Substituições</p>
                {homeSubs.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginTop: 1,
                      fontVariantNumeric: 'tabular-nums' }}>
                      {formatMinute(s.minute)}&apos;
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ fontSize: 12, color: '#01E18E' }}>▲ {s.playerIn.split(' ').slice(-1)[0]}</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>▼ {s.playerOut.split(' ').slice(-1)[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divisor */}
          <div style={{ background: 'rgba(255,255,255,0.07)' }} />

          {/* Visitante */}
          <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
              {dn(m.awayTeam)}
            </p>

            {awayBookings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
                  textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Cartões</p>
                {awayBookings.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ display: 'inline-block', width: 9, height: 13, borderRadius: 2, flexShrink: 0,
                      background: b.card === 'YELLOW' ? '#f59e0b' : '#ef4444' }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', flex: 1 }}>
                      {b.player.split(' ').slice(-1)[0]}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatMinute(b.minute)}&apos;
                    </span>
                  </div>
                ))}
              </div>
            )}

            {awaySubs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
                  textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Substituições</p>
                {awaySubs.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginTop: 1,
                      fontVariantNumeric: 'tabular-nums' }}>
                      {formatMinute(s.minute)}&apos;
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ fontSize: 12, color: '#01E18E' }}>▲ {s.playerIn.split(' ').slice(-1)[0]}</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>▼ {s.playerOut.split(' ').slice(-1)[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dots de navegação */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 6,
        padding: '12px 24px 16px',
        borderTop: hasEvents ? '1px solid rgba(255,255,255,0.07)' : 'none',
      }}>
        {matches.slice(0, 20).map((_, i) => (
          <button
            key={i}
            onClick={() => onNav(i)}
            style={{
              width: i === index ? 20 : 7, height: 7, borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === index ? '#01E18E' : 'rgba(255,255,255,0.18)',
              transition: 'all 0.25s', padding: 0, flexShrink: 0,
            }}
          />
        ))}
        {matches.length > 20 && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>
            +{matches.length - 20}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Card compacto da lista ───────────────────────────────────────────────────

function MatchListCard({ match, active, onClick }: { match: Match; active: boolean; onClick: () => void }) {
  const homeWon = (match.homeScore ?? 0) > (match.awayScore ?? 0)
  const awayWon = (match.awayScore ?? 0) > (match.homeScore ?? 0)
  const goals   = parseGoals(match.goalsJson)

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', background: active ? '#fff' : 'rgba(255,255,255,0.6)',
        border: active ? '2px solid #422c76' : '1px solid rgba(0,0,0,0.07)',
        borderRadius: 12, padding: '10px 14px', cursor: 'pointer',
        boxShadow: active ? '0 2px 12px rgba(66,44,118,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ minWidth: 52, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: active ? '#422c76' : '#8a8490' }}>
            {fmtTime(match.matchDate)}
          </div>
          <div style={{ fontSize: 10, color: '#c4bfba' }}>{fmtShortDate(match.matchDate)}</div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <Flag team={match.homeTeam} size={20} />
          <span style={{ fontSize: 12, fontWeight: homeWon ? 800 : 500,
            color: homeWon ? '#1a1625' : '#6b6672',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {dn(match.homeTeam)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
          background: '#f5f2ef', borderRadius: 8, padding: '4px 10px' }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: homeWon ? '#422c76' : '#1a1625',
            fontVariantNumeric: 'tabular-nums' }}>{match.homeScore}</span>
          <span style={{ fontSize: 10, color: '#c4bfba' }}>×</span>
          <span style={{ fontSize: 15, fontWeight: 900, color: awayWon ? '#422c76' : '#1a1625',
            fontVariantNumeric: 'tabular-nums' }}>{match.awayScore}</span>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 12, fontWeight: awayWon ? 800 : 500,
            color: awayWon ? '#1a1625' : '#6b6672',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'right' }}>
            {dn(match.awayTeam)}
          </span>
          <Flag team={match.awayTeam} size={20} />
        </div>
      </div>

      {/* Gols resumo */}
      {goals.length > 0 && (
        <div style={{ marginTop: 5, fontSize: 10, color: '#8a8490',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          ⚽ {goals.map(g => g.scorer.split(' ').slice(-1)[0]).join(', ')}
        </div>
      )}
    </button>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ResultadosView({ matches }: { matches: Match[] }) {
  const [selected, setSelected] = useState(0)

  if (matches.length === 0) {
    return (
      <div className="card p-12" style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>⏳</span>
        <p style={{ fontWeight: 700, fontSize: 16, color: '#1a1625', margin: '0 0 6px' }}>Nenhum jogo encerrado ainda</p>
        <p style={{ fontSize: 13, color: '#8a8490', margin: 0 }}>Os resultados aparecerão aqui após o início da Copa.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Visualizador de jogo */}
      <MatchViewer matches={matches} index={selected} onNav={setSelected} />

      {/* Lista de todos os jogos */}
      <div>
        <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
          color: '#8a8490', margin: '0 0 12px 2px' }}>
          Todos os jogos ({matches.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {matches.map((m, i) => (
            <MatchListCard
              key={m.id}
              match={m}
              active={i === selected}
              onClick={() => { setSelected(i); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
