'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { TvMatch } from '@/lib/tv-data'
import { getFlagUrl } from '@/lib/flags'

// ─── Flag inline ──────────────────────────────────────────────────────────────

function Flag({ team, size = 32 }: { team: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  const url = getFlagUrl(team, 40)
  if (!url || failed) return <span style={{ fontSize: Math.round(size * 0.7) }}>🏳</span>
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={team} width={size} height={Math.round(size * 0.67)}
    style={{ objectFit: 'cover', borderRadius: 3, flexShrink: 0, display: 'block' }}
    onError={() => setFailed(true)} />
}

// ─── Relógio ao vivo ──────────────────────────────────────────────────────────

function LiveClock({ startDate, elapsed }: { startDate: Date; elapsed: number | null }) {
  const [mins, setMins] = useState(elapsed ?? 0)
  useEffect(() => {
    const base = elapsed ?? Math.floor((Date.now() - new Date(startDate).getTime()) / 60000)
    setMins(Math.max(0, Math.min(base, 120)))
    const t = setInterval(() => setMins(m => Math.min(m + 1, 120)), 60000)
    return () => clearInterval(t)
  }, [startDate, elapsed])
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{mins}&apos;</span>
}

// ─── Countdown ───────────────────────────────────────────────────────────────

function Countdown({ target }: { target: Date }) {
  const [diff, setDiff] = useState(new Date(target).getTime() - Date.now())
  useEffect(() => {
    const t = setInterval(() => setDiff(new Date(target).getTime() - Date.now()), 1000)
    return () => clearInterval(t)
  }, [target])
  if (diff <= 0) return <span style={{ color: '#01E18E', fontWeight: 900 }}>Começando!</span>
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  const fmt = (n: number) => String(n).padStart(2, '0')
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em' }}>
      {h > 0 ? `${fmt(h)}:` : ''}{fmt(m)}:{fmt(s)}
    </span>
  )
}

// ─── Formatação ───────────────────────────────────────────────────────────────

function fmtTime(d: Date | string) {
  return new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
}
function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
}

// ─── Props do widget ──────────────────────────────────────────────────────────

type Props = {
  liveMatches:   TvMatch[]
  todayMatches:  TvMatch[]
  recentResults: TvMatch[]
}

type TabId = 'live' | 'today' | 'last'

export function MatchCenterWidget({ liveMatches, todayMatches, recentResults }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [collapsed, setCollapsed] = useState(false)
  const [tab, setTab] = useState<TabId>(() => {
    if (liveMatches.length > 0)   return 'live'
    if (todayMatches.length > 0)  return 'today'
    return 'last'
  })

  // Auto-refresh 30s
  useEffect(() => {
    const t = setInterval(() => startTransition(() => router.refresh()), 30000)
    return () => clearInterval(t)
  }, [router])

  // Auto-tab baseado em dados
  useEffect(() => {
    if (liveMatches.length > 0)  setTab('live')
    else if (todayMatches.length > 0) setTab('today')
    else setTab('last')
  }, [liveMatches.length, todayMatches.length])

  const hasLive  = liveMatches.length > 0
  const hasToday = todayMatches.length > 0
  const hasLast  = recentResults.length > 0

  // ── Collapsed ────────────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={{
          position: 'fixed', bottom: 80, right: 24, zIndex: 90,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
          background: hasLive
            ? 'linear-gradient(135deg, rgba(255,47,105,0.9), rgba(180,0,60,0.9))'
            : 'linear-gradient(135deg, rgba(66,44,118,0.9), rgba(30,15,60,0.9))',
          boxShadow: hasLive ? '0 4px 20px rgba(255,47,105,0.4)' : '0 4px 16px rgba(66,44,118,0.4)',
          color: 'white',
          animation: hasLive ? 'pulse-btn 2s ease-in-out infinite' : 'none',
        }}
      >
        <span style={{ fontSize: 18 }}>{hasLive ? '🔴' : '⚽'}</span>
        <div style={{ textAlign: 'left' }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '0.05em' }}>
            {hasLive ? 'AO VIVO' : hasToday ? 'JOGOS HOJE' : 'RESULTADOS'}
          </p>
          <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Match Center</p>
        </div>
        <style>{`@keyframes pulse-btn{0%,100%{box-shadow:0 4px 20px rgba(255,47,105,0.4)}50%{box-shadow:0 4px 30px rgba(255,47,105,0.8)}}`}</style>
      </button>
    )
  }

  // ── Widget expandido ─────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', bottom: 80, right: 24, zIndex: 90,
      width: 360, borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(160deg, #0f0920 0%, #1a0d36 60%, #0a1020 100%)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 16px 56px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
      animation: 'slideUp 0.3s cubic-bezier(0.34,1.5,0.64,1)',
    }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dot-live{ 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {hasLive && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff2f69', animation: 'dot-live 1s infinite', display: 'inline-block', flexShrink: 0 }} />}
          <span style={{ fontSize: 12, fontWeight: 800, color: '#01E18E', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ⚽ Match Center
          </span>
        </div>
        <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 16, lineHeight: 1, padding: '2px 6px' }}>−</button>
      </div>

      {/* ── Tabs ── */}
      {(hasLive || hasToday || hasLast) && (
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { id: 'live'  as TabId, label: '🔴 Ao Vivo',  show: hasLive  },
            { id: 'today' as TabId, label: '📅 Hoje',      show: hasToday },
            { id: 'last'  as TabId, label: '📊 Resultado', show: hasLast  },
          ].filter(t => t.show).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '8px 4px', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
              background: tab === t.id ? 'rgba(1,225,142,0.1)' : 'transparent',
              color: tab === t.id ? '#01E18E' : 'rgba(255,255,255,0.35)',
              borderBottom: tab === t.id ? '2px solid #01E18E' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Conteúdo ── */}
      <div style={{ padding: '16px 16px 14px' }}>

        {/* AO VIVO */}
        {tab === 'live' && liveMatches.slice(0, 2).map(m => (
          <LiveMatchCard key={m.id} match={m} />
        ))}

        {/* JOGOS DE HOJE */}
        {tab === 'today' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayMatches.slice(0, 4).map(m => (
              <TodayMatchCard key={m.id} match={m} />
            ))}
          </div>
        )}

        {/* ÚLTIMO RESULTADO */}
        {tab === 'last' && recentResults.slice(0, 2).map(m => (
          <ResultCard key={m.id} match={m} />
        ))}

        {/* Vazio → countdown da Copa */}
        {((tab === 'live' && !hasLive) || (tab === 'today' && !hasToday) || (tab === 'last' && !hasLast)) && (
          <CopaCountdown />
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '6px 14px 10px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Copa do Mundo 2026
        </span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)' }}>Atualiza 30s</span>
      </div>
    </div>
  )
}

// ─── Countdown pré-Copa ───────────────────────────────────────────────────────

const COPA_START = new Date('2026-06-11T20:00:00Z')

function CopaCountdown() {
  const [diff, setDiff] = useState(COPA_START.getTime() - Date.now())
  useEffect(() => {
    const t = setInterval(() => setDiff(COPA_START.getTime() - Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const started = diff <= 0
  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const mins    = Math.floor((diff % 3600000) / 60000)
  const secs    = Math.floor((diff % 60000) / 1000)
  const fmt     = (n: number) => String(Math.max(0, n)).padStart(2, '0')

  if (started) {
    return (
      <div style={{ textAlign: 'center', padding: '18px 0' }}>
        <p style={{ fontSize: 32, margin: '0 0 6px' }}>🏆</p>
        <p style={{ fontSize: 15, fontWeight: 900, color: '#01E18E', margin: 0 }}>Copa do Mundo 2026</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Em andamento!</p>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center', padding: '14px 8px 10px' }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 12px' }}>
        ⏳ Faltam para a Copa 2026
      </p>

      {/* Countdown grid */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 6 }}>
        {[
          { v: days,  label: 'DIAS'  },
          { v: hours, label: 'HORAS' },
          { v: mins,  label: 'MIN'   },
          { v: secs,  label: 'SEG'   },
        ].map((item, i) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'rgba(1,225,142,0.1)', border: '1px solid rgba(1,225,142,0.3)',
                borderRadius: 8, padding: '6px 10px',
                fontSize: 22, fontWeight: 900, color: '#01E18E',
                fontVariantNumeric: 'tabular-nums', lineHeight: 1, minWidth: 44,
              }}>
                {item.label === 'DIAS' ? String(Math.max(0, item.v)) : fmt(item.v)}
              </div>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', margin: '4px 0 0', letterSpacing: '0.12em' }}>
                {item.label}
              </p>
            </div>
            {i < 3 && (
              <span style={{ fontSize: 18, color: 'rgba(1,225,142,0.4)', fontWeight: 900, marginTop: 4 }}>:</span>
            )}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: '10px 0 0' }}>
        Abertura · 11/06/2026
      </p>
    </div>
  )
}

// ─── Card: Jogo ao vivo ───────────────────────────────────────────────────────

function LiveMatchCard({ match }: { match: TvMatch }) {
  return (
    <div style={{ background: 'rgba(255,47,105,0.07)', border: '1px solid rgba(255,47,105,0.2)', borderRadius: 14, padding: '14px', marginBottom: 8 }}>
      {/* Badge + relógio */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff2f69', animation: 'dot-live 1s infinite', display: 'inline-block' }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#ff6b8a', letterSpacing: '0.1em' }}>AO VIVO</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 900, color: '#01E18E' }}>
          <LiveClock startDate={match.matchDate} elapsed={match.elapsed} />
        </span>
      </div>

      {/* Times + placar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Flag team={match.homeTeam} size={36} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'white', textAlign: 'center', lineHeight: 1.2 }}>{match.homeTeam}</span>
        </div>
        <div style={{ textAlign: 'center', minWidth: 80 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'white', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {match.homeScore ?? 0} <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }}>×</span> {match.awayScore ?? 0}
          </div>
          {match.groupName && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{match.groupName}</span>}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Flag team={match.awayTeam} size={36} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'white', textAlign: 'center', lineHeight: 1.2 }}>{match.awayTeam}</span>
        </div>
      </div>

      {match.venue && (
        <p style={{ margin: '10px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>📍 {match.venue}</p>
      )}
    </div>
  )
}

// ─── Card: Jogo de hoje ───────────────────────────────────────────────────────

function TodayMatchCard({ match }: { match: TvMatch }) {
  const upcoming = match.status === 'upcoming'
  const matchDate = new Date(match.matchDate)
  return (
    <div style={{ background: 'rgba(66,44,118,0.1)', border: '1px solid rgba(66,44,118,0.25)', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 50 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#01E18E' }}>{fmtTime(match.matchDate)}</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>BRASÍLIA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <Flag team={match.homeTeam} size={24} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'white', flex: 1 }}>{match.homeTeam}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)' }}>×</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'white', flex: 1, textAlign: 'right' }}>{match.awayTeam}</span>
          <Flag team={match.awayTeam} size={24} />
        </div>
      </div>
      {upcoming && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Começa em</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#01E18E' }}>
            <Countdown target={matchDate} />
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Card: Resultado ──────────────────────────────────────────────────────────

function ResultCard({ match }: { match: TvMatch }) {
  const homeWon = (match.homeScore ?? 0) > (match.awayScore ?? 0)
  const awayWon = (match.awayScore ?? 0) > (match.homeScore ?? 0)
  return (
    <div style={{ background: 'rgba(1,168,102,0.06)', border: '1px solid rgba(1,168,102,0.2)', borderRadius: 14, padding: '14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {match.groupName ?? match.phase} · {fmtDate(match.matchDate)}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#01a866', padding: '2px 7px', borderRadius: 6, background: 'rgba(1,168,102,0.12)' }}>
          ENCERRADO ✓
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, opacity: awayWon ? 0.5 : 1 }}>
          <Flag team={match.homeTeam} size={32} />
          <span style={{ fontSize: 11, fontWeight: homeWon ? 800 : 500, color: homeWon ? 'white' : 'rgba(255,255,255,0.6)', textAlign: 'center' }}>{match.homeTeam}</span>
        </div>
        <div style={{ textAlign: 'center', minWidth: 80 }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: 'white', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {match.homeScore} <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 18 }}>×</span> {match.awayScore}
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, opacity: homeWon ? 0.5 : 1 }}>
          <Flag team={match.awayTeam} size={32} />
          <span style={{ fontSize: 11, fontWeight: awayWon ? 800 : 500, color: awayWon ? 'white' : 'rgba(255,255,255,0.6)', textAlign: 'center' }}>{match.awayTeam}</span>
        </div>
      </div>
    </div>
  )
}
