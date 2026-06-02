'use client'

import { useState, useTransition, useMemo } from 'react'
import { getUserHistory } from '@/app/actions/user-history'
import type { UserHistory, HistoryEntry } from '@/app/actions/user-history'
import { getFlagUrl } from '@/lib/flags'
import { phaseOrder } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Flag({ team, size = 24 }: { team: string; size?: number }) {
  const url = getFlagUrl(team, size <= 24 ? 20 : 40)
  if (!url) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={team} style={{ width: size, height: Math.round(size * 0.67), objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
}

function PointsPill({ pts, isScored }: { pts: number; isScored: boolean }) {
  if (!isScored) return <span style={{ fontSize: 10, color: '#c4bfba', fontWeight: 600 }}>—</span>
  if (pts === 10) return (
    <span style={{ fontSize: 11, fontWeight: 800, color: '#01a866', background: 'rgba(1,168,102,0.12)', padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>⚡ 10</span>
  )
  if (pts === 7) return (
    <span style={{ fontSize: 11, fontWeight: 800, color: '#d4a017', background: 'rgba(212,160,23,0.12)', padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>🎯 7</span>
  )
  if (pts === 5) return (
    <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', background: 'rgba(37,99,235,0.10)', padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>✓ 5</span>
  )
  return <span style={{ fontSize: 11, fontWeight: 600, color: '#c4bfba' }}>✗ 0</span>
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })
}

function isPlaceholder(name: string) {
  return /Grupo|Venc\.|Perd\.|TBD|\?/.test(name)
}

// ─── Linha de partida ─────────────────────────────────────────────────────────

function MatchRow({ entry }: { entry: HistoryEntry }) {
  const hasPred    = entry.predHome !== null && entry.predAway !== null
  const hasResult  = entry.actualHome !== null && entry.actualAway !== null
  const isFinished = entry.status === 'finished'

  // Cor de fundo por resultado
  const rowBg =
    !hasPred && isFinished ? 'rgba(255,47,105,0.04)' :
    entry.isScored && entry.points === 10 ? 'rgba(1,168,102,0.04)' :
    entry.isScored && entry.points >= 5   ? 'rgba(37,99,235,0.04)' :
    entry.isScored                         ? 'rgba(0,0,0,0.02)' :
    'transparent'

  const homeFlag = !isPlaceholder(entry.homeTeam)
  const awayFlag = !isPlaceholder(entry.awayTeam)

  return (
    <tr style={{ borderBottom: '1px solid #f5f2ef', background: rowBg }}>
      {/* Data */}
      <td style={{ padding: '10px 8px 10px 16px', fontSize: 11, color: '#aaa8b0', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
        {formatDate(entry.matchDate)}
        {entry.groupName && (
          <div style={{ fontSize: 9, color: '#c4bfba', marginTop: 2 }}>{entry.groupName.replace('Grupo ', 'G.')}</div>
        )}
      </td>

      {/* Times */}
      <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {homeFlag && <Flag team={entry.homeTeam} size={20} />}
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1625', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.homeTeam}
          </span>
          <span style={{ fontSize: 11, color: '#c4bfba', margin: '0 2px' }}>×</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1625', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.awayTeam}
          </span>
          {awayFlag && <Flag team={entry.awayTeam} size={20} />}
        </div>
      </td>

      {/* Palpite */}
      <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
        {hasPred ? (
          <span style={{
            fontSize: 14, fontWeight: 800, color: '#422c76',
            background: 'rgba(66,44,118,0.08)', padding: '3px 10px', borderRadius: 8,
            fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
          }}>
            {entry.predHome} × {entry.predAway}
          </span>
        ) : (
          <span style={{ fontSize: 11, color: '#c4bfba' }}>sem palpite</span>
        )}
      </td>

      {/* Resultado real */}
      <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
        {hasResult ? (
          <span style={{
            fontSize: 14, fontWeight: 800,
            color: entry.isScored && entry.points === 10 ? '#01a866' : '#1a1625',
            fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
          }}>
            {entry.actualHome} × {entry.actualAway}
          </span>
        ) : entry.status === 'live' ? (
          <span style={{ fontSize: 10, color: '#ff2f69', fontWeight: 700 }}>🔴 AO VIVO</span>
        ) : (
          <span style={{ fontSize: 11, color: '#c4bfba' }}>—</span>
        )}
      </td>

      {/* Pontos */}
      <td style={{ padding: '10px 16px 10px 8px', textAlign: 'right', verticalAlign: 'middle' }}>
        <PointsPill pts={entry.points} isScored={entry.isScored} />
      </td>
    </tr>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

type Props = {
  userId:   string
  name:     string
  position: number
  onClose:  () => void
}

export function UserHistoryModal({ userId, name, position, onClose }: Props) {
  const [history, setHistory]     = useState<UserHistory | null>(null)
  const [isPending, start]        = useTransition()
  const [loaded, setLoaded]       = useState(false)
  const [filterPhase, setFilter]  = useState<string>('all')

  // Busca ao montar
  useState(() => {
    start(async () => {
      const data = await getUserHistory(userId, position)
      setHistory(data)
      setLoaded(true)
    })
  })

  // Agrupa por fase
  const phases = useMemo(() => {
    if (!history) return []
    const map = new Map<string, HistoryEntry[]>()
    for (const e of history.entries) {
      if (!map.has(e.phase)) map.set(e.phase, [])
      map.get(e.phase)!.push(e)
    }
    return [...map.entries()].sort(
      ([a], [b]) =>
        (phaseOrder[a as keyof typeof phaseOrder] ?? 99) -
        (phaseOrder[b as keyof typeof phaseOrder] ?? 99),
    )
  }, [history])

  const visiblePhases = filterPhase === 'all'
    ? phases
    : phases.filter(([phase]) => phase === filterPhase)

  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', width: '100%', maxWidth: 760,
          maxHeight: '92vh', display: 'flex', flexDirection: 'column',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 64px rgba(0,0,0,0.25)',
        }}
      >
        {/* ── Header ── */}
        <div style={{ background: 'linear-gradient(135deg,#422c76,#2a1a4e)', padding: '20px 24px', borderRadius: '24px 24px 0 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'white' }}>
                {initials}
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 900, color: 'white', margin: 0 }}>{name}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>
                  {history?.department ?? '—'} · {position}º lugar
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#01E18E', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {history?.totalPoints ?? 0}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>pontos</p>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          </div>

          {/* Stats summary */}
          {history && (
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Palpites',     value: `${history.filledCount}/${history.totalMatches}` },
                { label: '⚡ Exatos',    value: history.exactCount },
                { label: '🎯 Saldo',     value: history.winnerCount },
                { label: '✓ Acertos',   value: history.filledCount - history.exactCount - history.winnerCount > 0 ? '—' : history.winnerCount },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 14px' }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Filtro de fases ── */}
        {history && phases.length > 0 && (
          <div style={{ display: 'flex', gap: 6, padding: '12px 16px', borderBottom: '1px solid #f0ede8', overflowX: 'auto', flexShrink: 0 }}>
            <button
              onClick={() => setFilter('all')}
              style={{ height: 30, padding: '0 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', background: filterPhase === 'all' ? '#422c76' : '#f0ede8', color: filterPhase === 'all' ? 'white' : '#6b6672' }}
            >
              Todas as fases
            </button>
            {phases.map(([phase, entries]) => {
              const pts = entries.reduce((s, e) => s + e.points, 0)
              return (
                <button
                  key={phase}
                  onClick={() => setFilter(phase)}
                  style={{ height: 30, padding: '0 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', background: filterPhase === phase ? '#422c76' : '#f0ede8', color: filterPhase === phase ? 'white' : '#6b6672' }}
                >
                  {entries[0].phaseLabel}
                  {pts > 0 && <span style={{ marginLeft: 5, opacity: 0.7 }}>· {pts}pts</span>}
                </button>
              )
            })}
          </div>
        )}

        {/* ── Legenda ── */}
        <div style={{ display: 'flex', gap: 16, padding: '8px 16px', borderBottom: '1px solid #f5f2ef', flexShrink: 0, flexWrap: 'wrap' }}>
          {[
            { color: 'rgba(1,168,102,0.12)', text: '#01a866', label: '⚡ Placar exato (10pts)' },
            { color: 'rgba(212,160,23,0.12)', text: '#d4a017', label: '🎯 Venc. + saldo (7pts)' },
            { color: 'rgba(37,99,235,0.10)',  text: '#2563eb', label: '✓ Vencedor (5pts)' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color, border: `1px solid ${l.text}40` }} />
              <span style={{ fontSize: 10, color: '#8a8490' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* ── Conteúdo ── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isPending && !loaded && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12 }}>
              <svg style={{ width: 32, height: 32, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#e8e4df" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#422c76" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: 14, color: '#8a8490' }}>Carregando histórico…</p>
            </div>
          )}

          {loaded && history && visiblePhases.map(([phase, entries]) => {
            const phasePoints = entries.reduce((s, e) => s + e.points, 0)
            const phaseFilled = entries.filter(e => e.predHome !== null).length

            return (
              <div key={phase}>
                {/* Cabeçalho da fase */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 6px', background: '#faf9f7', borderBottom: '1px solid #f0ede8', position: 'sticky', top: 0, zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#422c76', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {entries[0].phaseLabel}
                    </span>
                    <span style={{ fontSize: 11, color: '#8a8490' }}>
                      {phaseFilled}/{entries.length} palpites
                    </span>
                  </div>
                  {phasePoints > 0 && (
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#422c76' }}>
                      +{phasePoints} pts
                    </span>
                  )}
                </div>

                {/* Tabela */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f0ede8' }}>
                      <th style={{ padding: '6px 8px 6px 16px', fontSize: 9, fontWeight: 700, color: '#aaa8b0', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em', width: 56 }}>Data</th>
                      <th style={{ padding: '6px 8px', fontSize: 9, fontWeight: 700, color: '#aaa8b0', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Partida</th>
                      <th style={{ padding: '6px 8px', fontSize: 9, fontWeight: 700, color: '#aaa8b0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em', width: 90 }}>Palpite</th>
                      <th style={{ padding: '6px 8px', fontSize: 9, fontWeight: 700, color: '#aaa8b0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em', width: 90 }}>Resultado</th>
                      <th style={{ padding: '6px 16px 6px 8px', fontSize: 9, fontWeight: 700, color: '#aaa8b0', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.08em', width: 60 }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(e => <MatchRow key={e.matchId} entry={e} />)}
                  </tbody>
                </table>
              </div>
            )
          })}

          {loaded && !history && (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <p style={{ fontSize: 32 }}>😕</p>
              <p style={{ color: '#8a8490' }}>Não foi possível carregar o histórico.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
