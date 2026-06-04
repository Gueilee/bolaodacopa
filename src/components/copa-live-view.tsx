'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CopaLiveData, LiveMatch, GroupTeam } from '@/lib/copa-live-data'
import { getFlagUrl } from '@/lib/flags'

const CUP_START = new Date('2026-06-11T17:00:00-03:00') // 17h Brasília

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Flag({ team, size = 24 }: { team: string; size?: number }) {
  const url = getFlagUrl(team, size)
  if (!url) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={team} style={{ width: size, height: Math.round(size * 0.67), objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
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

// ─── Relógio ao vivo do jogo ─────────────────────────────────────────────────

function LiveClock({ match }: { match: LiveMatch }) {
  const [elapsed, setElapsed] = useState(match.elapsed ?? 0)

  useEffect(() => {
    if (match.status !== 'live') return
    const t = setInterval(() => setElapsed(e => Math.min(e + 1, 120)), 60000)
    return () => clearInterval(t)
  }, [match.status])

  if (match.status === 'finished') {
    return <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa8b0', padding: '2px 6px', borderRadius: 6, background: '#f0ede8' }}>ENCERRADO</span>
  }
  if (match.status === 'live') {
    return (
      <span style={{ fontSize: 12, fontWeight: 900, color: '#ff2f69', padding: '3px 8px', borderRadius: 8,
        background: 'rgba(255,47,105,0.1)', border: '1px solid rgba(255,47,105,0.3)',
        display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff2f69', animation: 'pulse 1s infinite' }} />
        {elapsed}&apos;
      </span>
    )
  }
  return null
}

// ─── Countdown até o início ──────────────────────────────────────────────────

function Countdown() {
  const [diff, setDiff] = useState(CUP_START.getTime() - Date.now())

  useEffect(() => {
    const t = setInterval(() => setDiff(CUP_START.getTime() - Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  if (diff <= 0) return null

  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d0920, #1a0d36)',
      borderRadius: 20, padding: '20px 24px', marginBottom: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
    }}>
      <div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#01E18E', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          ⚽ Copa do Mundo 2026 começa em
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          11 de junho · 17h00 (Brasília) · México vs África do Sul
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {[{ v: d, l: 'DIAS' }, { v: h, l: 'HRS' }, { v: m, l: 'MIN' }, { v: s, l: 'SEG' }].map((item, i) => (
          <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 26, fontWeight: 900, color: '#01E18E', fontVariantNumeric: 'tabular-nums',
                background: 'rgba(1,225,142,0.1)', border: '1.5px solid rgba(1,225,142,0.3)',
                borderRadius: 10, padding: '4px 10px', minWidth: 52, lineHeight: 1.2,
              }}>
                {String(item.v).padStart(2, '0')}
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>{item.l}</p>
            </div>
            {i < 3 && <span style={{ color: 'rgba(1,225,142,0.4)', fontWeight: 900, fontSize: 18, marginBottom: 14 }}>:</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Card de partida ─────────────────────────────────────────────────────────

function MatchCard({ match, featured = false }: { match: LiveMatch; featured?: boolean }) {
  const isLive     = match.status === 'live'
  const isFinished = match.status === 'finished'
  const hasScore   = match.homeScore !== null && match.awayScore !== null

  return (
    <div style={{
      background: isLive ? 'rgba(255,47,105,0.04)' : '#fff',
      border: isLive
        ? '2px solid rgba(255,47,105,0.25)'
        : featured ? '2px solid rgba(66,44,118,0.2)' : '1px solid rgba(0,0,0,0.06)',
      borderRadius: 16,
      padding: featured ? '16px 20px' : '13px 18px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      transition: 'all 0.2s',
    }}>
      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: isLive ? '#ff2f69' : '#422c76' }}>
              {formatTime(match.matchDate)}
            </span>
            <span style={{ fontSize: 10, color: '#aaa8b0' }}>Brasília · {formatDate(match.matchDate)}</span>
          </div>
          {(match.venue || match.city) && (
            <span style={{ fontSize: 11, color: '#aaa8b0' }}>
              📍 {[match.venue, match.city].filter(Boolean).join(' — ')}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {match.groupName && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
              background: '#f0ede8', color: '#8a8490' }}>
              {match.groupName}
            </span>
          )}
          <LiveClock match={match} />
        </div>
      </div>

      {/* Times + placar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Casa */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: featured ? 16 : 14, fontWeight: 800, color: '#1a1625',
            textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
            {match.homeTeam}
          </span>
          <Flag team={match.homeTeam} size={featured ? 32 : 26} />
        </div>

        {/* Placar / VS */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: hasScore ? (isLive ? 'rgba(255,47,105,0.08)' : '#f5f2ef') : 'transparent',
          borderRadius: 10, padding: hasScore ? '6px 14px' : '4px 12px',
          minWidth: 80, justifyContent: 'center',
        }}>
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
            <span style={{ fontSize: 12, fontWeight: 700, color: '#c4bfba' }}>vs</span>
          )}
        </div>

        {/* Visitante */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Flag team={match.awayTeam} size={featured ? 32 : 26} />
          <span style={{ fontSize: featured ? 16 : 14, fontWeight: 800, color: '#1a1625',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
            {match.awayTeam}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Tabela de grupo ─────────────────────────────────────────────────────────

function GroupTable({ name, teams }: { name: string; teams: GroupTeam[] }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #0d0920, #1a0d36)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: '#01E18E' }}>{name}</span>
      </div>

      {/* Col headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 28px 28px 28px 28px 28px 36px',
        padding: '5px 12px', borderBottom: '1px solid #f0ede8', gap: 4 }}>
        {['CLUBE', 'J', 'V', 'E', 'D', 'SG', 'PTS'].map((h, i) => (
          <span key={h} style={{ fontSize: 9, fontWeight: 700, color: '#aaa8b0', textAlign: i > 0 ? 'center' : 'left',
            textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
        ))}
      </div>

      {/* Teams */}
      {teams.map((t, i) => (
        <div key={t.name} style={{
          display: 'grid', gridTemplateColumns: '1fr 28px 28px 28px 28px 28px 36px',
          padding: '7px 12px', gap: 4, alignItems: 'center',
          borderBottom: i < teams.length - 1 ? '1px solid #f5f2ef' : 'none',
          background: i < 2 ? 'rgba(66,44,118,0.03)' : 'transparent',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 9, color: i < 2 ? '#422c76' : '#c4bfba', fontWeight: 700, minWidth: 10 }}>{i + 1}</span>
            <Flag team={t.name} size={18} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1625', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
          </div>
          {[t.played, t.won, t.drawn, t.lost, t.goalDiff, t.points].map((v, j) => (
            <span key={j} style={{ fontSize: 12, fontWeight: j === 5 ? 800 : 500,
              color: j === 5 ? '#422c76' : '#4a4555', textAlign: 'center',
              fontVariantNumeric: 'tabular-nums' }}>
              {v > 0 && j === 4 ? `+${v}` : v}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

type Props = { data: CopaLiveData }

export function CopaLiveView({ data }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [lastUpdated, setLastUpdated] = useState(new Date(data.fetchedAt))

  const hasLive    = data.liveMatches.length > 0
  const hasToday   = data.todayMatches.length > 0
  const copStarted = Date.now() >= CUP_START.getTime()

  // Auto-refresh a cada 30s
  useEffect(() => {
    const t = setInterval(() => {
      startTransition(() => {
        router.refresh()
        setLastUpdated(new Date())
      })
    }, 30000)
    return () => clearInterval(t)
  }, [router])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>

      {/* Countdown (antes da copa começar) */}
      {!copStarted && <Countdown />}

      {/* Jogos ao vivo */}
      {hasLive && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff2f69', animation: 'pulse 1s infinite', display: 'inline-block' }} />
            <h2 style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ff2f69' }}>
              Ao Vivo agora
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.liveMatches.map(m => <MatchCard key={m.id} match={m} featured />)}
          </div>
        </section>
      )}

      {/* Jogos do dia */}
      {(hasToday || hasLive) && (
        <section>
          <h2 style={{ margin: '0 0 10px 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8a8490' }}>
            ⚽ Jogos de hoje
          </h2>
          {hasToday ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.todayMatches.map(m => <MatchCard key={m.id} match={m} featured />)}
            </div>
          ) : (
            <div className="card p-6" style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 14, color: '#8a8490' }}>
                {hasLive ? 'Todos os jogos de hoje já iniciaram.' : 'Nenhum jogo programado para hoje.'}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Últimos resultados */}
      {data.recentResults.length > 0 && (
        <section>
          <h2 style={{ margin: '0 0 10px 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8a8490' }}>
            📊 Últimos resultados
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.recentResults.slice(0, 6).map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* Próximos jogos */}
      {data.upcomingDays.length > 0 && (
        <section>
          <h2 style={{ margin: '0 0 10px 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8a8490' }}>
            📅 Próximos jogos
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.upcomingDays.map(({ date, matches: ms }) => (
              <div key={date}>
                <p style={{ margin: '0 0 8px 4px', fontSize: 12, fontWeight: 700, color: '#422c76', textTransform: 'capitalize' }}>
                  {formatWeekday(date)}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ms.slice(0, 8).map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Classificação dos grupos */}
      {data.groups.length > 0 && (
        <section>
          <h2 style={{ margin: '0 0 12px 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8a8490' }}>
            🏆 Classificação dos grupos
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {data.groups.map(g => <GroupTable key={g.name} name={g.name} teams={g.teams} />)}
          </div>
        </section>
      )}

      {/* Footer com timestamp */}
      <p style={{ textAlign: 'center', fontSize: 11, color: '#c4bfba', margin: 0 }}>
        Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Sao_Paulo' })} · atualiza a cada 30s
      </p>
    </div>
  )
}
