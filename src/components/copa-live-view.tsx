'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CopaLiveData, LiveMatch, GroupTeam } from '@/lib/copa-live-data'
import { getFlagUrl } from '@/lib/flags'

// Normaliza nomes para exibição (Países Baixos → Holanda)
const DISPLAY_NAME: Record<string, string> = {
  'Países Baixos': 'Holanda',
}
function displayName(name: string): string { return DISPLAY_NAME[name] ?? name }

// ─── Flag com tamanho mínimo 32px para visibilidade ───────────────────────────

function Flag({ team, size = 32 }: { team: string; size?: number }) {
  const actualSize = Math.max(size, 32)
  const url = getFlagUrl(displayName(team), actualSize) || getFlagUrl(team, actualSize)
  if (!url) return <span style={{ fontSize: Math.round(actualSize * 0.7), lineHeight: 1 }}>🏳</span>
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url} alt={displayName(team)}
      style={{ width: actualSize, height: Math.round(actualSize * 0.67), objectFit: 'cover', borderRadius: 4, flexShrink: 0, display: 'block' }}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
    />
  )
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
        ENCERRADO
      </span>
    )
  }
  if (match.status === 'live') {
    return (
      <span style={{ fontSize: 12, fontWeight: 900, color: '#ff2f69', padding: '3px 10px', borderRadius: 8,
        background: 'rgba(255,47,105,0.1)', border: '1px solid rgba(255,47,105,0.3)',
        display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff2f69', flexShrink: 0,
          animation: 'pulse-live 1s infinite' }} />
        {elapsed}&apos;
      </span>
    )
  }
  return null
}

// ─── Card de partida ──────────────────────────────────────────────────────────

function MatchCard({ match, featured = false }: { match: LiveMatch; featured?: boolean }) {
  const isLive     = match.status === 'live'
  const isFinished = match.status === 'finished'
  const hasScore   = match.homeScore !== null && match.awayScore !== null
  const flagSz     = featured ? 40 : 32

  return (
    <div style={{
      background: isLive ? 'rgba(255,47,105,0.03)' : '#fff',
      border: isLive
        ? '2px solid rgba(255,47,105,0.3)'
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
              background: '#f0ede8', color: '#6b6672' }}>
              {match.groupName}
            </span>
          )}
          <LiveClock match={match} />
        </div>
      </div>

      {/* Times + placar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Casa */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: featured ? 16 : 14, fontWeight: 800, color: '#1a1625', textAlign: 'right',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
            {displayName(match.homeTeam)}
          </span>
          <Flag team={match.homeTeam} size={flagSz} />
        </div>

        {/* Placar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, minWidth: 90, justifyContent: 'center',
          background: hasScore ? '#f5f2ef' : 'transparent',
          borderRadius: 10, padding: hasScore ? '8px 14px' : '4px 12px',
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
            <span style={{ fontSize: 13, fontWeight: 700, color: '#c4bfba' }}>vs</span>
          )}
        </div>

        {/* Visitante */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Flag team={match.awayTeam} size={flagSz} />
          <span style={{ fontSize: featured ? 16 : 14, fontWeight: 800, color: '#1a1625',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
            {displayName(match.awayTeam)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Tabela de classificação do grupo ─────────────────────────────────────────

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
            textAlign: i > 0 ? 'center' : 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {h}
          </span>
        ))}
      </div>
      {teams.map((t, i) => (
        <div key={t.name} style={{
          display: 'grid', gridTemplateColumns: '1fr 28px 28px 28px 28px 28px 36px',
          padding: '8px 12px', gap: 4, alignItems: 'center',
          borderBottom: i < teams.length - 1 ? '1px solid #f5f2ef' : 'none',
          background: i < 2 ? 'rgba(66,44,118,0.025)' : 'transparent',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 9, color: i < 2 ? '#422c76' : '#c4bfba', fontWeight: 700, minWidth: 10, flexShrink: 0 }}>
              {i + 1}
            </span>
            <Flag team={t.name} size={20} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1625',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName(t.name)}
            </span>
          </div>
          {[t.played, t.won, t.drawn, t.lost, t.goalDiff, t.points].map((v, j) => (
            <span key={j} style={{
              fontSize: 12, fontWeight: j === 5 ? 800 : 500,
              color: j === 5 ? '#422c76' : '#4a4555',
              textAlign: 'center', fontVariantNumeric: 'tabular-nums',
            }}>
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

  const hasLive    = data.liveMatches.length > 0
  const hasRecent  = data.recentResults.length > 0
  const hasUpcoming = data.upcomingDays.length > 0

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <style>{`
        @keyframes pulse-live { 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>

      {/* 1. ÚLTIMOS RESULTADOS */}
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

      {/* 2. JOGOS AO VIVO */}
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

      {/* 3. PRÓXIMOS JOGOS (próxima rodada) */}
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
          <p style={{ fontSize: 13, color: '#8a8490', margin: 0 }}>
            Os jogos e classificações aparecerão aqui a partir de 11/06/2026.
          </p>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: 10, color: '#c4bfba', margin: 0 }}>
        Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Sao_Paulo' })} · atualiza a cada 30s
      </p>
    </div>
  )
}
