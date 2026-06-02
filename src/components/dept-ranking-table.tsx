'use client'

import { useState } from 'react'
import type { DeptRankEntry } from '@/lib/dept-ranking'

// ─── Modal de comparação ──────────────────────────────────────────────────────

function ComparePanel({
  a, b, onClose,
}: {
  a: DeptRankEntry
  b: DeptRankEntry
  onClose: () => void
}) {
  const stats = [
    {
      label:   'Posição',
      va:      `${a.position}º`,
      vb:      `${b.position}º`,
      winnerA:  a.position < b.position,
      winnerB:  b.position < a.position,
    },
    {
      label:   'Média de Pontos',
      va:      `${a.avgPoints.toFixed(1)} pts`,
      vb:      `${b.avgPoints.toFixed(1)} pts`,
      winnerA:  a.avgPoints > b.avgPoints,
      winnerB:  b.avgPoints > a.avgPoints,
    },
    {
      label:   'Total de Pontos',
      va:      `${a.totalPoints} pts`,
      vb:      `${b.totalPoints} pts`,
      winnerA:  a.totalPoints > b.totalPoints,
      winnerB:  b.totalPoints > a.totalPoints,
    },
    {
      label:   'Participação',
      va:      `${a.participationRate}%`,
      vb:      `${b.participationRate}%`,
      winnerA:  a.participationRate > b.participationRate,
      winnerB:  b.participationRate > a.participationRate,
    },
    {
      label:   'Membros',
      va:      String(a.totalMembers),
      vb:      String(b.totalMembers),
      winnerA:  false,
      winnerB:  false,
    },
    {
      label:   'Líder',
      va:      a.leader?.split(' ')[0] ?? '—',
      vb:      b.leader?.split(' ')[0] ?? '—',
      winnerA:  false,
      winnerB:  false,
    },
  ]

  const aWins = stats.filter(s => s.winnerA).length
  const bWins = stats.filter(s => s.winnerB).length

  function DeptInitial({ dept }: { dept: string }) {
    return (
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: '#422c76',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 18, color: 'white',
      }}>
        {dept.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 580, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#422c76,#2a1a4e)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#01E18E', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>⚖️ Comparação de Departamentos</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>Clique fora para fechar</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Cabeçalhos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', borderBottom: '1px solid #e8e4df' }}>
          {[{ entry: a, wins: aWins }, { entry: b, wins: bWins }].map(({ entry, wins }, i) => (
            <div key={entry.department} style={{ padding: '16px 20px', textAlign: i === 0 ? 'left' : 'right', gridColumn: i === 0 ? 1 : 3, background: wins > (i === 0 ? bWins : aWins) ? 'rgba(1,225,142,0.05)' : 'transparent' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: i === 0 ? 'flex-start' : 'flex-end', gap: 6 }}>
                <DeptInitial dept={entry.department} />
                <p style={{ fontSize: 13, fontWeight: 800, color: '#1a1625', margin: 0, lineHeight: 1.2 }}>{entry.department}</p>
                {wins > (i === 0 ? bWins : aWins) && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#01a866', background: 'rgba(1,168,102,0.1)', padding: '2px 8px', borderRadius: 10 }}>🏆 Na frente</span>
                )}
              </div>
            </div>
          ))}
          <div style={{ gridColumn: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#c4bfba' }}>VS</span>
          </div>
        </div>

        {/* Stats */}
        <div>
          {stats.map((s, i) => (
            <div key={s.label} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 1fr', alignItems: 'center', padding: '12px 20px', borderBottom: i < stats.length - 1 ? '1px solid #f5f2ef' : 'none' }}>
              <span style={{ fontSize: 15, fontWeight: s.winnerA ? 800 : 500, color: s.winnerA ? '#01a866' : '#6b6672', display: 'flex', alignItems: 'center', gap: 4 }}>
                {s.winnerA && <span style={{ fontSize: 12 }}>✓</span>}{s.va}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#aaa8b0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
              <span style={{ fontSize: 15, fontWeight: s.winnerB ? 800 : 500, color: s.winnerB ? '#01a866' : '#6b6672', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                {s.vb}{s.winnerB && <span style={{ fontSize: 12 }}>✓</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Placar final */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 1fr', padding: '14px 20px', background: '#f9f7f5', borderTop: '2px solid #e8e4df' }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: aWins > bWins ? '#01a866' : '#c4bfba' }}>{aWins}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#aaa8b0', textAlign: 'center', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>categorias</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: bWins > aWins ? '#01a866' : '#c4bfba', textAlign: 'right' }}>{bWins}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Chip de selecionado ──────────────────────────────────────────────────────

function CompareChip({ entry, onRemove }: { entry: DeptRankEntry; onRemove: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(66,44,118,0.1)', border: '1px solid rgba(66,44,118,0.25)', borderRadius: 20, padding: '4px 10px 4px 8px' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#422c76', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.department}
      </span>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a8490', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
    </div>
  )
}

// ─── Badge de participação ────────────────────────────────────────────────────

function ParticipationBadge({ rate }: { rate: number }) {
  const cfg =
    rate >= 80 ? { text: 'text-brand-neon',  bg: 'bg-brand-neon/10  border-brand-neon/20'  } :
    rate >= 50 ? { text: 'text-yellow-400',  bg: 'bg-yellow-400/10  border-yellow-400/20'  } :
                 { text: 'text-brand-pink',  bg: 'bg-brand-pink/10  border-brand-pink/20'  }

  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border inline-block tabular-nums ${cfg.text} ${cfg.bg}`}>
      {rate}%
    </span>
  )
}

// ─── Tabela principal ─────────────────────────────────────────────────────────

type Props = {
  entries:       DeptRankEntry[]
  userDept:      string | null
  startFromPos?: number
}

export function DeptRankingTable({ entries, userDept, startFromPos = 0 }: Props) {
  const [search, setSearch]         = useState('')
  const [compareMode, setCompare]   = useState(false)
  const [selected, setSelected]     = useState<DeptRankEntry[]>([])
  const [showCompare, setShowCompare] = useState(false)

  const allVisible = entries.slice(startFromPos)

  const filtered = allVisible.filter(d =>
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

  function exitCompareMode() {
    setCompare(false)
    setSelected([])
    setShowCompare(false)
  }

  if (allVisible.length === 0) return null

  const maxAvg = Math.max(...entries.map(e => e.avgPoints), 1)

  return (
    <>
      {/* ── Barra de ferramentas ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12, alignItems: 'center' }}>

        {/* Busca */}
        <div style={{ flex: '1 1 200px', position: 'relative', minWidth: 180 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#aaa8b0' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por departamento ou líder…"
            style={{
              width: '100%', height: 40, borderRadius: 12,
              border: '1.5px solid #e0dbd5', background: '#fff',
              padding: '0 36px 0 36px', fontSize: 13, color: '#1a1625',
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => { e.target.style.borderColor = '#422c76' }}
            onBlur={e  => { e.target.style.borderColor = '#e0dbd5' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa8b0', fontSize: 16 }}>×</button>
          )}
        </div>

        {/* Comparar */}
        <button
          onClick={() => compareMode ? exitCompareMode() : setCompare(true)}
          style={{
            height: 40, padding: '0 14px', borderRadius: 12,
            border: `1.5px solid ${compareMode ? '#422c76' : '#e0dbd5'}`,
            background: compareMode ? '#422c76' : '#fff',
            color: compareMode ? 'white' : '#6b6672',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
          }}
        >
          ⚖️ {compareMode ? 'Cancelar' : 'Comparar'}
        </button>
      </div>

      {/* ── Barra de comparação ── */}
      {compareMode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 14px', borderRadius: 12, background: selected.length === 2 ? 'rgba(66,44,118,0.06)' : '#fafaf8', border: '1.5px solid rgba(66,44,118,0.2)', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#8a8490', fontWeight: 600 }}>
            {selected.length === 0 && 'Clique em 2 departamentos para comparar'}
            {selected.length === 1 && 'Selecione mais 1 departamento'}
            {selected.length === 2 && 'Pronto para comparar!'}
          </span>
          {selected.map(e => (
            <CompareChip key={e.department} entry={e} onRemove={() => setSelected(prev => prev.filter(s => s.department !== e.department))} />
          ))}
          {selected.length === 2 && (
            <button onClick={() => setShowCompare(true)} style={{ marginLeft: 'auto', height: 34, padding: '0 16px', borderRadius: 10, background: '#422c76', color: 'white', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
              Ver comparação →
            </button>
          )}
        </div>
      )}

      {/* Contagem */}
      {search && (
        <p style={{ fontSize: 12, color: '#8a8490', marginBottom: 8 }}>
          {filtered.length === 0 ? 'Nenhum resultado.' : `${filtered.length} departamento${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* ── Tabela ── */}
      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: '#e8e4df' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-[10px] uppercase tracking-wider" style={{ borderColor: '#e8e4df', color: '#8a8490' }}>
              <th className="text-left px-5 py-3 w-10">#</th>
              <th className="text-left px-5 py-3">Departamento</th>
              <th className="text-right px-3 py-3 hidden sm:table-cell">Membros</th>
              <th className="text-center px-3 py-3">Participação</th>
              <th className="text-right px-5 py-3">Média de Pontos</th>
              <th className="text-right px-5 py-3 hidden lg:table-cell">Máximo</th>
              <th className="text-left  px-5 py-3 hidden md:table-cell">Líder</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((dept) => {
              const isMyDept   = dept.department === (userDept ?? 'Sem Departamento')
              const isSelected = selected.some(s => s.department === dept.department)
              const barWidth   = maxAvg > 0 ? (dept.avgPoints / maxAvg) * 100 : 0

              return (
                <tr
                  key={dept.department}
                  onClick={() => compareMode && toggleSelect(dept)}
                  className="group transition-colors border-t"
                  style={{
                    borderTopColor: '#f0ede8',
                    background:
                      isSelected ? 'rgba(66,44,118,0.10)' :
                      isMyDept   ? 'rgba(66,44,118,0.05)' :
                      'transparent',
                    borderLeft: isSelected || isMyDept ? '2px solid #422c76' : '2px solid transparent',
                    cursor: compareMode ? 'pointer' : 'default',
                    outline: isSelected ? '2px solid rgba(66,44,118,0.15)' : 'none',
                    outlineOffset: -2,
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Posição */}
                  <td className="px-5 py-4 text-xs font-bold" style={{ color: '#8a8490' }}>
                    {dept.position}º
                  </td>

                  {/* Departamento + barra */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-semibold" style={{ color: isSelected || isMyDept ? '#422c76' : '#3d3847' }}>
                        {dept.department}
                      </span>
                      {isMyDept && (
                        <span className="text-[10px] rounded px-1.5 py-0.5 font-semibold" style={{ color: '#422c76', background: 'rgba(66,44,118,0.12)', border: '1px solid rgba(66,44,118,0.25)' }}>
                          sua área
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[10px] font-bold" style={{ color: '#422c76' }}>✓</span>
                      )}
                    </div>
                    <div className="h-1 rounded-full overflow-hidden w-full max-w-[200px]" style={{ background: '#e8e4df' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${barWidth}%`, background: isSelected || isMyDept ? '#422c76' : '#c8c4c0' }} />
                    </div>
                  </td>

                  {/* Membros */}
                  <td className="px-3 py-4 text-right tabular-nums hidden sm:table-cell">
                    <span style={{ color: '#3d3847' }}>{dept.lockedMembers}</span>
                    <span style={{ color: '#8a8490' }}>/{dept.totalMembers}</span>
                  </td>

                  {/* Participação */}
                  <td className="px-3 py-4 text-center">
                    <ParticipationBadge rate={dept.participationRate} />
                  </td>

                  {/* Média de Pontos */}
                  <td className="px-5 py-4 text-right">
                    <span className="text-lg font-black tabular-nums" style={{ color: isSelected || isMyDept ? '#422c76' : '#3d3847' }}>
                      {dept.avgPoints.toFixed(1)}
                    </span>
                    <span className="text-xs ml-1" style={{ color: '#8a8490' }}>pts</span>
                  </td>

                  {/* Máximo */}
                  <td className="px-5 py-4 text-right tabular-nums hidden lg:table-cell" style={{ color: '#6b6672' }}>
                    {dept.maxPoints > 0 ? dept.maxPoints : '—'}
                  </td>

                  {/* Líder */}
                  <td className="px-5 py-4 text-xs hidden md:table-cell" style={{ color: '#6b6672' }}>
                    {dept.leader ? (
                      <div>
                        <p style={{ color: '#3d3847' }}>{dept.leader.split(' ')[0]}</p>
                        <p style={{ color: '#8a8490' }}>{dept.leaderPoints} pts</p>
                      </div>
                    ) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && search && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontSize: 28, margin: '0 0 8px' }}>🔍</p>
            <p style={{ color: '#8a8490', fontSize: 14 }}>Nenhum departamento encontrado para "<strong>{search}</strong>"</p>
          </div>
        )}

        {/* Nota */}
        <div className="px-5 py-3 border-t" style={{ borderColor: '#f0ede8' }}>
          <p className="text-[10px]" style={{ color: '#8a8490' }}>
            Classificação por <strong style={{ color: '#6b6672' }}>média de pontos de todos os membros</strong>
            {' '}— inclui colaboradores com 0 pts para estimular 100% de participação.
          </p>
        </div>
      </div>

      {compareMode && selected.length < 2 && (
        <p style={{ fontSize: 11, color: '#aaa8b0', textAlign: 'center', marginTop: 8 }}>
          Toque/clique em qualquer linha para selecionar até 2 departamentos
        </p>
      )}

      {/* Modal */}
      {showCompare && selected.length === 2 && (
        <ComparePanel a={selected[0]} b={selected[1]} onClose={() => setShowCompare(false)} />
      )}
    </>
  )
}
