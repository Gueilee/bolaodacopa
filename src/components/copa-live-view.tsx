'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CopaLiveData, LiveMatch, GroupTeam } from '@/lib/copa-live-data'
import { getFlagUrl } from '@/lib/flags'
import {
  parseGoals, parseBookings, parseSubs, formatMinute, goalIcon,
  type MatchGoalEvent, type MatchBookingEvent, type MatchSubEvent,
} from '@/lib/match-events'

const DISPLAY_NAME: Record<string, string> = { 'Países Baixos': 'Holanda' }
function displayName(n: string) { return DISPLAY_NAME[n] ?? n }

// ─── Flag ─────────────────────────────────────────────────────────────────────

function Flag({ team, size = 40 }: { team: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  const url = getFlagUrl(displayName(team), 40) || getFlagUrl(team, 40)
  const w = Math.max(size, 28), h = Math.round(w * 0.67)
  if (!url || failed) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: w, height: h, borderRadius: 3, background: '#f0ede8', fontSize: Math.round(h * 0.9), flexShrink: 0 }}>
        🏳
      </span>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={displayName(team)} width={w} height={h}
    style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0, display: 'block' }}
    onError={() => setFailed(true)} />
}

function formatTime(d: Date | string) {
  return new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
}
function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
}
function formatWeekday(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })
}

// ─── Relógio ao vivo ──────────────────────────────────────────────────────────

function LiveClock({ match }: { match: LiveMatch }) {
  const [elapsed, setElapsed] = useState(match.elapsed ?? 0)
  useEffect(() => {
    if (match.status !== 'live') return
    const t = setInterval(() => setElapsed(e => Math.min(e + 1, 120)), 60000)
    return () => clearInterval(t)
  }, [match.status])
  if (match.status === 'finished') {
    return (
      <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa8b0', padding: '2px 8px', borderRadius: 6, background: '#f0ede8' }}>
        ENCERRADO {match.matchResult === 'AET' ? '(P.E.)' : match.matchResult === 'PEN' ? '(Pên.)' : ''}
      </span>
    )
  }
  if (match.status === 'live') {
    return (
      <span style={{ fontSize: 12, fontWeight: 900, color: '#ff2f69', padding: '3px 10px', borderRadius: 8,
        background: 'rgba(255,47,105,0.1)', border: '1px solid rgba(255,47,105,0.3)',
        display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff2f69', flexShrink: 0, animation: 'pulse-live 1s infinite' }} />
        {elapsed}&apos;
      </span>
    )
  }
  return null
}

// ─── Painel de eventos ────────────────────────────────────────────────────────

function EventsPanel({ match }: { match: LiveMatch }) {
  const goals    = parseGoals(match.goalsJson)
  const bookings = parseBookings(match.bookingsJson)
  const subs     = parseSubs(match.subsJson)

  const hasEvents = goals.length > 0 || bookings.length > 0 || (match.status === 'live' && subs.length > 0)
  if (!hasEvents) return null

  // Gols por time
  const homeGoals = goals.filter(g => g.team === match.homeTeam || g.team === displayName(match.homeTeam))
  const awayGoals = goals.filter(g => g.team === match.awayTeam || g.team === displayName(match.awayTeam))
  // Gols contra invertem o time
  const homeGoalsFull = [
    ...homeGoals,
    ...awayGoals.filter(g => g.type === 'OWN_GOAL'),
  ]
  const awayGoalsFull = [
    ...awayGoals,
    ...homeGoals.filter(g => g.type === 'OWN_GOAL'),
  ]

  const yellowsHome = bookings.filter(b => b.card === 'YELLOW' && b.team === match.homeTeam).length
  const redsHome    = bookings.filter(b => (b.card === 'RED' || b.card === 'YELLOW_RED') && b.team === match.homeTeam).length
  const yellowsAway = bookings.filter(b => b.card === 'YELLOW' && b.team === match.awayTeam).length
  const redsAway    = bookings.filter(b => (b.card === 'RED' || b.card === 'YELLOW_RED') && b.team === match.awayTeam).length

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)' }}>

      {/* Gols */}
      {goals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 6, marginBottom: 8 }}>
          {/* Gols casa */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
            {homeGoalsFull.map((g, i) => (
              <span key={i} style={{ fontSize: 11, color: '#4a4555', lineHeight: 1.4, textAlign: 'right' }}>
                {g.type === 'OWN_GOAL' ? '⚽ CG' : '⚽'} {g.scorer.split(' ').slice(-1)[0]} {formatMinute(g.minute, g.injuryTime)}
              </span>
            ))}
          </div>
          <div style={{ width: 1, background: 'rgba(0,0,0,0.08)' }} />
          {/* Gols visitante */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {awayGoalsFull.map((g, i) => (
              <span key={i} style={{ fontSize: 11, color: '#4a4555', lineHeight: 1.4 }}>
                {g.type === 'OWN_GOAL' ? '⚽ CG' : '⚽'} {g.scorer.split(' ').slice(-1)[0]} {formatMinute(g.minute, g.injuryTime)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cartões + Substituições */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {/* Cartões casa */}
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: yellowsHome }).map((_, i) => (
            <span key={i} style={{ display: 'inline-block', width: 10, height: 14, background: '#f59e0b', borderRadius: 2 }} />
          ))}
          {Array.from({ length: redsHome }).map((_, i) => (
            <span key={i} style={{ display: 'inline-block', width: 10, height: 14, background: '#ef4444', borderRadius: 2 }} />
          ))}
        </div>
        {/* Subs ao vivo */}
        {match.status === 'live' && subs.length > 0 && (
          <span style={{ fontSize: 10, color: '#aaa8b0', textAlign: 'center' }}>
            🔄 {subs.length} subs
          </span>
        )}
        {/* Cartões visitante */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          {Array.from({ length: yellowsAway }).map((_, i) => (
            <span key={i} style={{ display: 'inline-block', width: 10, height: 14, background: '#f59e0b', borderRadius: 2 }} />
          ))}
          {Array.from({ length: redsAway }).map((_, i) => (
            <span key={i} style={{ display: 'inline-block', width: 10, height: 14, background: '#ef4444', borderRadius: 2 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Card de partida ──────────────────────────────────────────────────────────

function MatchCard({ match, featured = false }: { match: LiveMatch; featured?: boolean }) {
  const isLive     = match.status === 'live'
  const isFinished = match.status === 'finished'
  const hasScore   = match.homeScore !== null && match.awayScore !== null
  const flagSz     = featured ? 44 : 40

  return (
    <div style={{
      background: isLive ? 'rgba(255,47,105,0.03)' : '#fff',
      border: isLive ? '2px solid rgba(255,47,105,0.3)'
        : featured ? '2px solid rgba(66,44,118,0.15)' : '1px solid rgba(0,0,0,0.07)',
      borderRadius: 16, padding: '14px 18px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: isLive ? '#ff2f69' : '#422c76' }}>
              {formatTime(match.matchDate)}
            </span>
            <span style={{ fontSize: 11, color: '#aaa8b0' }}>Brasília · {formatDate(match.matchDate)}</span>
          </div>
          {(match.venue || match.city) && (
            <span style={{ fontSize: 11, color: '#aaa8b0', lineHeight: 1.4 }}>
              📍 {[match.venue, match.city].filter(Boolean).join(' — ')}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {match.groupName && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
              background: '#f0ede8', color: '#6b6672' }}>{match.groupName}</span>
          )}
          <LiveClock match={match} />
        </div>
      </div>

      {/* Times + placar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: featured ? 16 : 14, fontWeight: 800, color: '#1a1625', textAlign: 'right',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
            {displayName(match.homeTeam)}
          </span>
          <Flag team={match.homeTeam} size={flagSz} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 90, justifyContent: 'center',
          background: hasScore ? '#f5f2ef' : 'transparent', borderRadius: 10, padding: hasScore ? '8px 14px' : '4px 12px' }}>
          {hasScore ? (
            <>
              <span style={{ fontSize: featured ? 28 : 22, fontWeight: 900, color: '#1a1625', fontVariantNumeric: 'tabular-nums' }}>
                {match.homeScore}
              </span>
              <span style={{ fontSize: 14, color: '#c4bfba', fontWeight: 300 }}>×</span>
              <span style={{ fontSize: featured ? 28 : 22, fontWeight: 900, color: '#1a1625', fontVariantNumeric: 'tabular-nums' }}>
                {match.awayScore}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 13, fontWeight: 700, color: '#c4bfba' }}>vs</span>
          )}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Flag team={match.awayTeam} size={flagSz} />
          <span style={{ fontSize: featured ? 16 : 14, fontWeight: 800, color: '#1a1625',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
            {displayName(match.awayTeam)}
          </span>
        </div>
      </div>

      {/* Eventos (gols, cartões, subs) */}
      {(isFinished || isLive) && <EventsPanel match={match} />}
    </div>
  )
}

// ─── Tabela de grupo ──────────────────────────────────────────────────────────

function GroupTable({ name, teams }: { name: string; teams: GroupTeam[] }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
      <div style={{ padding: '9px 14px', background: 'linear-gradient(135deg, #0d0920, #1a0d36)' }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: '#01E18E' }}>{name}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 28px 28px 28px 28px 28px 36px',
        padding: '5px 12px', borderBottom: '1px solid #f0ede8', gap: 4 }}>
        {['CLUBE', 'J', 'V', 'E', 'D', 'SG', 'PTS'].map((h, i) => (
          <span key={h} style={{ fontSize: 9, fontWeight: 700, color: '#aaa8b0',
            textAlign: i > 0 ? 'center' : 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
        ))}
      </div>
      {teams.map((t, i) => (
        <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '1fr 28px 28px 28px 28px 28px 36px',
          padding: '8px 12px', gap: 4, alignItems: 'center',
          borderBottom: i < teams.length - 1 ? '1px solid #f5f2ef' : 'none',
          background: i < 2 ? 'rgba(66,44,118,0.025)' : 'transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 9, color: i < 2 ? '#422c76' : '#c4bfba', fontWeight: 700, minWidth: 10, flexShrink: 0 }}>{i + 1}</span>
            <Flag team={t.name} size={28} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1625',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName(t.name)}</span>
          </div>
          {[t.played, t.won, t.drawn, t.lost, t.goalDiff, t.points].map((v, j) => (
            <span key={j} style={{ fontSize: 12, fontWeight: j === 5 ? 800 : 500,
              color: j === 5 ? '#422c76' : '#4a4555', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
              {j === 4 && v > 0 ? `+${v}` : v}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function CopaLiveView({ data }: { data: CopaLiveData }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [lastUpdated, setLastUpdated] = useState(new Date(data.fetchedAt))

  const hasLive     = data.liveMatches.length > 0
  const hasRecent   = data.recentResults.length > 0
  const hasUpcoming = data.upcomingDays.length > 0

  useEffect(() => {
    const t = setInterval(() => {
      startTransition(() => { router.refresh(); setLastUpdated(new Date()) })
    }, 30000)
    return () => clearInterval(t)
  }, [router])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <style>{`@keyframes pulse-live { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>

      {/* 1. AO VIVO (prioridade máxima) */}
      {hasLive && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff2f69',
              animation: 'pulse-live 1s infinite', display: 'inline-block', flexShrink: 0 }} />
            <h2 style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ff2f69' }}>
              Ao Vivo agora
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.liveMatches.map(m => <MatchCard key={m.id} match={m} featured />)}
          </div>
        </section>
      )}

      {/* 2. ÚLTIMOS RESULTADOS */}
      {hasRecent && (
        <section>
          <h2 style={{ margin: '0 0 12px 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8a8490' }}>
            📊 Últimos resultados
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.recentResults.slice(0, 8).map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* 3. PRÓXIMOS JOGOS */}
      {hasUpcoming && (
        <section>
          <h2 style={{ margin: '0 0 12px 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8a8490' }}>
            📅 Próximos jogos
          </h2>
          {data.upcomingDays.map(({ date, matches: ms }) => (
            <div key={date}>
              <p style={{ margin: '0 0 10px 4px', fontSize: 13, fontWeight: 800, color: '#422c76', textTransform: 'capitalize' }}>
                {formatWeekday(date)}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ms.map(m => <MatchCard key={m.id} match={m} featured />)}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 4. CLASSIFICAÇÃO DOS GRUPOS */}
      {data.groups.length > 0 && (
        <section>
          <h2 style={{ margin: '0 0 14px 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8a8490' }}>
            🏆 Classificação dos grupos
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 12 }}>
            {data.groups.map(g => <GroupTable key={g.name} name={g.name} teams={g.teams} />)}
          </div>
        </section>
      )}

      {!hasRecent && !hasLive && !hasUpcoming && data.groups.length === 0 && (
        <div className="card p-12" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>⚽</span>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#1a1625', margin: '0 0 6px' }}>Copa ainda não começou</p>
          <p style={{ fontSize: 13, color: '#8a8490', margin: 0 }}>Os jogos aparecerão aqui a partir de 11/06/2026.</p>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: 10, color: '#c4bfba', margin: 0 }}>
        Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Sao_Paulo' })} · atualiza a cada 30s
      </p>
    </div>
  )
}
