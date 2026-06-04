'use client'

import { useState } from 'react'
import type { DeptRankEntry } from '@/lib/dept-ranking'

// ─── Modal de comparação ──────────────────────────────────────────────────────

function ComparePanel({ a, b, onClose }: { a: DeptRankEntry; b: DeptRankEntry; onClose: () => void }) {
  const stats = [
    { label: 'Posição',        va: `${a.position}º`,                    vb: `${b.position}º`,                    winnerA: a.position < b.position,        winnerB: b.position < a.position },
    { label: 'Média de Pts',   va: `${a.avgPoints.toFixed(1)} pts`,      vb: `${b.avgPoints.toFixed(1)} pts`,      winnerA: a.avgPoints > b.avgPoints,        winnerB: b.avgPoints > a.avgPoints },
    { label: 'Total de Pts',   va: `${a.totalPoints} pts`,               vb: `${b.totalPoints} pts`,               winnerA: a.totalPoints > b.totalPoints,    winnerB: b.totalPoints > a.totalPoints },
    { label: 'Participação',   va: `${a.participationRate}%`,            vb: `${b.participationRate}%`,            winnerA: a.participationRate > b.participationRate, winnerB: b.participationRate > a.participationRate },
    { label: 'Membros',        va: String(a.totalMembers),               vb: String(b.totalMembers),               winnerA: false, winnerB: false },
    { label: 'Líder',          va: a.leader?.split(' ')[0] ?? '—',       vb: b.leader?.split(' ')[0] ?? '—',       winnerA: false, winnerB: false },
  ]
  const aWins = stats.filter(s => s.winnerA).length
  const bWins = stats.filter(s => s.winnerB).length

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 560, boxShadow: '0 32px 80px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg,#0d0920,#1a0d36)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#01E18E', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>⚖️ Comparação</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '3px 0 0' }}>Clique fora para fechar</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', borderBottom: '1px solid #e8e4df' }}>
          {[{ entry: a, wins: aWins, other: bWins }, { entry: b, wins: bWins, other: aWins }].map(({ entry, wins, other }, i) => (
            <div key={entry.department} style={{ padding: '16px 20px', textAlign: i === 0 ? 'left' : 'right', gridColumn: i === 0 ? 1 : 3, background: wins > other ? 'rgba(1,225,142,0.04)' : 'transparent' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: i === 0 ? 'flex-start' : 'flex-end', gap: 8 }}>
                <DeptAvatar dept={entry.department} size={44} />
                <p style={{ fontSize: 13, fontWeight: 800, color: '#1a1625', margin: 0, lineHeight: 1.3 }}>{entry.department}</p>
                {wins > other && <span style={{ fontSize: 10, fontWeight: 700, color: '#01a866', background: 'rgba(1,168,102,0.1)', padding: '2px 8px', borderRadius: 10 }}>🏆 Na frente</span>}
              </div>
            </div>
          ))}
          <div style={{ gridColumn: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#c4bfba' }}>VS</span>
          </div>
        </div>

        {stats.map((s, i) => (
          <div key={s.label} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 1fr', alignItems: 'center', padding: '12px 20px', borderBottom: i < stats.length - 1 ? '1px solid #f5f2ef' : 'none' }}>
            <span style={{ fontSize: 14, fontWeight: s.winnerA ? 800 : 500, color: s.winnerA ? '#01a866' : '#6b6672' }}>{s.winnerA && '✓ '}{s.va}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#aaa8b0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
            <span style={{ fontSize: 14, fontWeight: s.winnerB ? 800 : 500, color: s.winnerB ? '#01a866' : '#6b6672', textAlign: 'right' }}>{s.vb}{s.winnerB && ' ✓'}</span>
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 1fr', padding: '14px 20px', background: '#f9f7f5', borderTop: '2px solid #e8e4df' }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: aWins > bWins ? '#01a866' : '#c4bfba' }}>{aWins}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#aaa8b0', textAlign: 'center', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>categorias</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: bWins > aWins ? '#01a866' : '#c4bfba', textAlign: 'right' }}>{bWins}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Avatar com inicial do departamento ───────────────────────────────────────

function DeptAvatar({ dept, size = 40 }: { dept: string; size?: number }) {
  const colors = [
    ['#422c76','#5a3e94'], ['#1a6aff','#3b82f6'], ['#01a866','#10b981'],
    ['#d97706','#f59e0b'], ['#dc2626','#ef4444'], ['#7c3aed','#8b5cf6'],
    ['#0891b2','#06b6d4'], ['#be185d','#ec4899'],
  ]
  const idx = dept.charCodeAt(0) % colors.length
  const [from, to] = colors[idx]
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.28), flexShrink: 0,
      background: `linear-gradient(135deg, ${from}, ${to})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: Math.round(size * 0.4), color: '#fff',
      boxShadow: `0 2px 8px ${from}55`,
    }}>
      {dept.charAt(0).toUpperCase()}
    </div>
  )
}

// ─── Badge de participação ────────────────────────────────────────────────────

function ParticipationBadge({ rate }: { rate: number }) {
  const { bg, color, border } =
    rate >= 80 ? { bg: 'rgba(1,168,102,0.1)',   color: '#01a866', border: 'rgba(1,168,102,0.25)'   } :
    rate >= 50 ? { bg: 'rgba(245,158,11,0.1)',  color: '#d97706', border: 'rgba(245,158,11,0.25)'  } :
                 { bg: 'rgba(255,47,105,0.08)', color: '#ff2f69', border: 'rgba(255,47,105,0.2)'   }
  return (
    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 20, display: 'inline-block',
      background: bg, color, border: `1px solid ${border}`, letterSpacing: '0.03em' }}>
      {rate}%
    </span>
  )
}

// ─── Chip de selecionado ──────────────────────────────────────────────────────

function CompareChip({ entry, onRemove }: { entry: DeptRankEntry; onRemove: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(66,44,118,0.1)', border: '1px solid rgba(66,44,118,0.25)', borderRadius: 20, padding: '4px 10px 4px 8px' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#422c76', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.department}</span>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a8490', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
    </div>
  )
}

// ─── Medalha de posição ───────────────────────────────────────────────────────

function PosMedal({ pos }: { pos: number }) {
  if (pos === 1) return <span style={{ fontSize: 18 }}>🥇</span>
  if (pos === 2) return <span style={{ fontSize: 18 }}>🥈</span>
  if (pos === 3) return <span style={{ fontSize: 18 }}>🥉</span>
  return <span style={{ fontSize: 12, fontWeight: 700, color: '#aaa8b0', minWidth: 24, display: 'inline-block', textAlign: 'center' }}>{pos}º</span>
}

// ─── Tabela principal ─────────────────────────────────────────────────────────

type Props = { entries: DeptRankEntry[]; userDept: string | null; startFromPos?: number }

export function DeptRankingTable({ entries, userDept, startFromPos = 0 }: Props) {
  const [search, setSearch]           = useState('')
  const [compareMode, setCompare]     = useState(false)
  const [selected, setSelected]       = useState<DeptRankEntry[]>([])
  const [showCompare, setShowCompare] = useState(false)

  const allVisible = entries.slice(startFromPos)
  const filtered   = allVisible.filter(d =>
    d.department.toLowerCase().includes(search.toLowerCase()) ||
    (d.leader ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  function toggleSelect(entry: DeptRankEntry) {
    if (!compareMode) return
    setSelected(prev => {
      if (prev.find(e => e.department === entry.department)) return prev.filter(e => e.department !== entry.department)
      if (prev.length >= 2) return [prev[1], entry]
      return [...prev, entry]
    })
  }

  function exitCompareMode() { setCompare(false); setSelected([]); setShowCompare(false) }

  if (allVisible.length === 0) return null

  const maxAvg = Math.max(...entries.map(e => e.avgPoints), 1)

  return (
    <>
      {/* ── Barra de ferramentas ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12, alignItems: 'center' }}>
        <div style={{ flex: '1 1 200px', position: 'relative', minWidth: 180 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#aaa8b0' }}>🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por departamento ou líder…"
            style={{ width: '100%', height: 40, borderRadius: 12, border: '1.5px solid #e0dbd5', background: '#fff', padding: '0 36px 0 36px', fontSize: 13, color: '#1a1625', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = '#422c76' }}
            onBlur={e  => { e.target.style.borderColor = '#e0dbd5' }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa8b0', fontSize: 16 }}>×</button>}
        </div>
        <button onClick={() => compareMode ? exitCompareMode() : setCompare(true)} style={{
          height: 40, padding: '0 14px', borderRadius: 12,
          border: `1.5px solid ${compareMode ? '#422c76' : '#e0dbd5'}`,
          background: compareMode ? '#422c76' : '#fff',
          color: compareMode ? 'white' : '#6b6672',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        }}>
          ⚖️ {compareMode ? 'Cancelar' : 'Comparar'}
        </button>
      </div>

      {compareMode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 14px', borderRadius: 12, background: selected.length === 2 ? 'rgba(66,44,118,0.06)' : '#fafaf8', border: '1.5px solid rgba(66,44,118,0.2)', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#8a8490', fontWeight: 600 }}>
            {selected.length === 0 && 'Clique em 2 departamentos para comparar'}
            {selected.length === 1 && 'Selecione mais 1 departamento'}
            {selected.length === 2 && 'Pronto para comparar!'}
          </span>
          {selected.map(e => <CompareChip key={e.department} entry={e} onRemove={() => setSelected(prev => prev.filter(s => s.department !== e.department))} />)}
          {selected.length === 2 && (
            <button onClick={() => setShowCompare(true)} style={{ marginLeft: 'auto', height: 34, padding: '0 16px', borderRadius: 10, background: '#422c76', color: 'white', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
              Ver comparação →
            </button>
          )}
        </div>
      )}

      {search && (
        <p style={{ fontSize: 12, color: '#8a8490', marginBottom: 8 }}>
          {filtered.length === 0 ? 'Nenhum resultado.' : `${filtered.length} departamento${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* ── Cards de departamento ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr 80px 90px 110px 90px',
          padding: '10px 16px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #0d0920, #130a2a)',
          gap: 8,
        }}>
          {['#', 'DEPARTAMENTO', 'MEMBROS', 'PARTICIPAÇÃO', 'MÉDIA', 'LÍDER'].map((h, i) => (
            <span key={h} style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              textAlign: i >= 2 && i <= 4 ? 'center' : i === 0 ? 'center' : 'left',
            }}>{h}</span>
          ))}
        </div>

        {/* Linhas */}
        {filtered.map((dept) => {
          const isMyDept   = dept.department === (userDept ?? 'Sem Departamento')
          const isSelected = selected.some(s => s.department === dept.department)
          const barWidth   = maxAvg > 0 ? (dept.avgPoints / maxAvg) * 100 : 0

          return (
            <div
              key={dept.department}
              onClick={() => compareMode && toggleSelect(dept)}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 80px 90px 110px 90px',
                padding: '14px 16px',
                borderRadius: 16,
                background: isSelected
                  ? 'rgba(66,44,118,0.1)'
                  : isMyDept
                  ? 'rgba(1,225,142,0.05)'
                  : '#ffffff',
                border: isSelected
                  ? '2px solid rgba(66,44,118,0.4)'
                  : isMyDept
                  ? '2px solid rgba(1,225,142,0.25)'
                  : '1px solid rgba(0,0,0,0.06)',
                boxShadow: isMyDept
                  ? '0 2px 12px rgba(1,225,142,0.1)'
                  : '0 1px 4px rgba(0,0,0,0.04)',
                cursor: compareMode ? 'pointer' : 'default',
                transition: 'all 0.15s',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {/* Posição */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PosMedal pos={dept.position} />
              </div>

              {/* Departamento */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <DeptAvatar dept={dept.department} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isSelected || isMyDept ? '#422c76' : '#1a1625',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                      {dept.department}
                    </span>
                    {isMyDept && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#01a866', background: 'rgba(1,168,102,0.12)',
                        padding: '2px 6px', borderRadius: 8, border: '1px solid rgba(1,168,102,0.25)', flexShrink: 0 }}>
                        sua área
                      </span>
                    )}
                    {isSelected && <span style={{ fontSize: 11, color: '#422c76' }}>✓</span>}
                  </div>
                  {/* Barra de progresso */}
                  <div style={{ height: 4, borderRadius: 4, background: '#f0ede8', marginTop: 5, maxWidth: 160, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4, transition: 'width 0.7s ease',
                      width: `${barWidth}%`,
                      background: isMyDept
                        ? 'linear-gradient(90deg, #01a866, #01E18E)'
                        : isSelected
                        ? 'linear-gradient(90deg, #422c76, #5a3e94)'
                        : 'linear-gradient(90deg, #c8c4c0, #aaa8b0)',
                    }} />
                  </div>
                </div>
              </div>

              {/* Membros */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#3d3847' }}>{dept.lockedMembers}</span>
                <span style={{ fontSize: 12, color: '#aaa8b0' }}>/{dept.totalMembers}</span>
              </div>

              {/* Participação */}
              <div style={{ textAlign: 'center' }}>
                <ParticipationBadge rate={dept.participationRate} />
              </div>

              {/* Média de Pontos */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: isMyDept ? '#01a866' : isSelected ? '#422c76' : '#1a1625' }}>
                  {dept.avgPoints.toFixed(1)}
                </span>
                <span style={{ fontSize: 10, color: '#8a8490', marginLeft: 2 }}>pts</span>
              </div>

              {/* Líder */}
              <div>
                {dept.leader ? (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#3d3847', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>
                      {dept.leader.split(' ')[0]}
                    </p>
                    <p style={{ fontSize: 10, color: '#8a8490', margin: 0 }}>{dept.leaderPoints} pts</p>
                  </div>
                ) : <span style={{ color: '#c4bfba', fontSize: 12 }}>—</span>}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && search && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontSize: 28, margin: '0 0 8px' }}>🔍</p>
            <p style={{ color: '#8a8490', fontSize: 14 }}>Nenhum departamento para "<strong>{search}</strong>"</p>
          </div>
        )}
      </div>

      {/* Nota */}
      <p style={{ fontSize: 11, color: '#aaa8b0', marginTop: 8, textAlign: 'center' }}>
        Classificação por <strong style={{ color: '#8a8490' }}>média de pontos</strong> — inclui membros com 0 pts para estimular 100% de participação.
      </p>

      {compareMode && selected.length < 2 && (
        <p style={{ fontSize: 11, color: '#aaa8b0', textAlign: 'center', marginTop: 8 }}>
          Toque/clique em qualquer linha para selecionar até 2 departamentos
        </p>
      )}

      {showCompare && selected.length === 2 && (
        <ComparePanel a={selected[0]} b={selected[1]} onClose={() => setShowCompare(false)} />
      )}
    </>
  )
}
