'use client'

import { useState, useRef, useCallback } from 'react'
import { initials, positionBadge } from '@/lib/utils'
import type { RankingEntry } from '@/lib/queries'
import { UserHistoryModal } from '@/components/user-history-modal'

// ─── Comparação ───────────────────────────────────────────────────────────────

function ComparePanel({
  a, b, onClose,
}: {
  a: RankingEntry
  b: RankingEntry
  onClose: () => void
}) {
  const stats = [
    {
      label:  'Posição',
      va:     `${a.position}º`,
      vb:     `${b.position}º`,
      winnerA: a.position < b.position,
      winnerB: b.position < a.position,
    },
    {
      label:   'Pontos',
      va:      `${a.totalPoints} pts`,
      vb:      `${b.totalPoints} pts`,
      winnerA: a.totalPoints > b.totalPoints,
      winnerB: b.totalPoints > a.totalPoints,
    },
    {
      label:   'Placares exatos ⚡',
      va:      String(a.exactCount),
      vb:      String(b.exactCount),
      winnerA: a.exactCount > b.exactCount,
      winnerB: b.exactCount > a.exactCount,
    },
    {
      label:   'Palpites feitos',
      va:      String(a.predictionCount),
      vb:      String(b.predictionCount),
      winnerA: a.predictionCount > b.predictionCount,
      winnerB: b.predictionCount > a.predictionCount,
    },
    {
      label:   'Departamento',
      va:      a.department ?? '—',
      vb:      b.department ?? '—',
      winnerA: false,
      winnerB: false,
    },
  ]

  const aWins = stats.filter(s => s.winnerA).length
  const bWins = stats.filter(s => s.winnerB).length

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 24, width: '100%', maxWidth: 560,
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#422c76,#2a1a4e)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#01E18E', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
              ⚖️ Comparação
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
              Clique fora para fechar
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
            width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Cabeçalhos de cada pessoa */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', borderBottom: '1px solid #e8e4df' }}>
          {[{ entry: a, wins: aWins }, { entry: b, wins: bWins }].map(({ entry, wins }, i) => (
            <div key={entry.id} style={{
              padding: '16px 20px',
              textAlign: i === 0 ? 'left' : 'right',
              gridColumn: i === 0 ? 1 : 3,
              background: wins > (i === 0 ? bWins : aWins) ? 'rgba(1,225,142,0.05)' : 'transparent',
            }}>
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: i === 0 ? 'flex-start' : 'flex-end', gap: 4,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#422c76', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14,
                }}>
                  {initials(entry.name)}
                </div>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#1a1625', margin: 0, lineHeight: 1.2 }}>
                  {entry.name.split(' ')[0]}
                </p>
                <p style={{ fontSize: 11, color: '#8a8490', margin: 0 }}>
                  {entry.name.split(' ').slice(1).join(' ')}
                </p>
                {wins > (i === 0 ? bWins : aWins) && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#01a866',
                    background: 'rgba(1,168,102,0.1)', padding: '2px 8px', borderRadius: 10,
                  }}>
                    🏆 Na frente
                  </span>
                )}
              </div>
            </div>
          ))}
          {/* VS center */}
          <div style={{
            gridColumn: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#c4bfba' }}>VS</span>
          </div>
        </div>

        {/* Stats */}
        <div>
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 1fr',
                alignItems: 'center',
                padding: '12px 20px',
                borderBottom: i < stats.length - 1 ? '1px solid #f5f2ef' : 'none',
              }}
            >
              {/* Valor A */}
              <span style={{
                fontSize: 15, fontWeight: s.winnerA ? 800 : 500,
                color: s.winnerA ? '#01a866' : '#6b6672',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {s.winnerA && <span style={{ fontSize: 12 }}>✓</span>}
                {s.va}
              </span>

              {/* Label central */}
              <span style={{
                fontSize: 10, fontWeight: 600, color: '#aaa8b0',
                textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {s.label}
              </span>

              {/* Valor B */}
              <span style={{
                fontSize: 15, fontWeight: s.winnerB ? 800 : 500,
                color: s.winnerB ? '#01a866' : '#6b6672',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4,
              }}>
                {s.vb}
                {s.winnerB && <span style={{ fontSize: 12 }}>✓</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Placar final */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 120px 1fr',
          padding: '14px 20px', background: '#f9f7f5',
          borderTop: '2px solid #e8e4df',
        }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: aWins > bWins ? '#01a866' : '#c4bfba' }}>
            {aWins}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#aaa8b0', textAlign: 'center', alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            categorias
          </span>
          <span style={{ fontSize: 28, fontWeight: 900, color: bWins > aWins ? '#01a866' : '#c4bfba', textAlign: 'right' }}>
            {bWins}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Chip de selecionado para comparação ─────────────────────────────────────

function CompareChip({ entry, onRemove }: { entry: RankingEntry; onRemove: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'rgba(66,44,118,0.1)', border: '1px solid rgba(66,44,118,0.25)',
      borderRadius: 20, padding: '4px 10px 4px 6px',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: '#422c76',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0,
      }}>
        {initials(entry.name)}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#422c76', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.name.split(' ')[0]}
      </span>
      <button onClick={onRemove} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#8a8490', fontSize: 14, lineHeight: 1, padding: 0,
      }}>×</button>
    </div>
  )
}

// ─── Tabela principal ─────────────────────────────────────────────────────────

type Props = {
  entries:       RankingEntry[]
  currentUserId: string
}

export function RankingTable({ entries, currentUserId }: Props) {
  const [search, setSearch]         = useState('')
  const [compareMode, setCompare]   = useState(false)
  const [selected, setSelected]     = useState<RankingEntry[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [flashId, setFlashId]       = useState<string | null>(null)
  const [historyUser, setHistoryUser] = useState<{ id: string; name: string; position: number } | null>(null)
  const myRowRef                    = useRef<HTMLTableRowElement>(null)

  const filtered = entries.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.department ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  // Scroll para minha posição
  const goToMe = useCallback(() => {
    myRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setFlashId(currentUserId)
    setTimeout(() => setFlashId(null), 2000)
  }, [currentUserId])

  // Selecionar/deselecionar para comparar
  function toggleSelect(entry: RankingEntry) {
    if (!compareMode) return
    setSelected((prev) => {
      if (prev.find((e) => e.id === entry.id)) return prev.filter((e) => e.id !== entry.id)
      if (prev.length >= 2) return [prev[1], entry]
      return [...prev, entry]
    })
  }

  function openCompare() {
    if (selected.length === 2) setShowCompare(true)
  }

  function exitCompareMode() {
    setCompare(false)
    setSelected([])
    setShowCompare(false)
  }

  const myEntry = entries.find((e) => e.id === currentUserId)

  if (entries.length === 0) {
    return <p className="text-center py-16" style={{ color: '#8a8490' }}>Nenhum participante ainda.</p>
  }

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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou departamento…"
            style={{
              width: '100%', height: 40, borderRadius: 12,
              border: '1.5px solid #e0dbd5', background: '#fff',
              padding: '0 36px 0 36px', fontSize: 13, color: '#1a1625',
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#422c76' }}
            onBlur={(e)  => { e.target.style.borderColor = '#e0dbd5' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#aaa8b0', fontSize: 16,
              }}
            >×</button>
          )}
        </div>

        {/* Minha posição */}
        {myEntry && (
          <button
            onClick={goToMe}
            style={{
              height: 40, padding: '0 14px', borderRadius: 12,
              border: '1.5px solid rgba(66,44,118,0.3)',
              background: 'rgba(66,44,118,0.06)', color: '#422c76',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            📍 {myEntry.position}º lugar
          </button>
        )}

        {/* Comparar */}
        <button
          onClick={() => compareMode ? exitCompareMode() : setCompare(true)}
          style={{
            height: 40, padding: '0 14px', borderRadius: 12,
            border: `1.5px solid ${compareMode ? '#422c76' : '#e0dbd5'}`,
            background: compareMode ? '#422c76' : '#fff',
            color: compareMode ? 'white' : '#6b6672',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            whiteSpace: 'nowrap',
          }}
        >
          ⚖️ {compareMode ? 'Cancelar' : 'Comparar'}
        </button>
      </div>

      {/* ── Barra de comparação ── */}
      {compareMode && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          padding: '10px 14px', borderRadius: 12,
          background: selected.length === 2 ? 'rgba(66,44,118,0.06)' : '#fafaf8',
          border: '1.5px solid rgba(66,44,118,0.2)',
          marginBottom: 12,
        }}>
          <span style={{ fontSize: 12, color: '#8a8490', fontWeight: 600 }}>
            {selected.length === 0 && 'Clique em 2 pessoas para comparar'}
            {selected.length === 1 && 'Selecione mais 1 pessoa'}
            {selected.length === 2 && 'Pronto para comparar!'}
          </span>

          {selected.map((e) => (
            <CompareChip
              key={e.id}
              entry={e}
              onRemove={() => setSelected((prev) => prev.filter((s) => s.id !== e.id))}
            />
          ))}

          {selected.length === 2 && (
            <button
              onClick={openCompare}
              style={{
                marginLeft: 'auto', height: 34, padding: '0 16px', borderRadius: 10,
                background: '#422c76', color: 'white', border: 'none',
                fontSize: 12, fontWeight: 800, cursor: 'pointer',
              }}
            >
              Ver comparação →
            </button>
          )}
        </div>
      )}

      {/* ── Contagem de resultados ── */}
      {search && (
        <p style={{ fontSize: 12, color: '#8a8490', marginBottom: 8 }}>
          {filtered.length === 0
            ? 'Nenhum resultado encontrado.'
            : `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* ── Tabela ── */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #e8e4df' }}>
              <th className="text-left px-5 py-3 w-14 text-xs font-semibold uppercase tracking-wider" style={{ color: '#8a8490' }}>#</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#8a8490' }}>Participante</th>
              <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#8a8490' }}>Pontos</th>
              <th className="text-right px-5 py-3 hidden sm:table-cell text-xs font-semibold uppercase tracking-wider" style={{ color: '#8a8490' }}>Palpites</th>
              <th className="text-right px-5 py-3 hidden md:table-cell text-xs font-semibold uppercase tracking-wider" style={{ color: '#8a8490' }}>Exatos</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((entry) => {
              const isMe       = entry.id === currentUserId
              const isTop3     = entry.position <= 3
              const isFlashing = entry.id === flashId
              const isSelected = selected.some((s) => s.id === entry.id)

              return (
                <tr
                  key={entry.id}
                  ref={isMe ? myRowRef : undefined}
                  onClick={() => compareMode && toggleSelect(entry)}
                  style={{
                    borderBottom: '1px solid #f0ede8',
                    background:
                      isFlashing  ? 'rgba(1,225,142,0.12)' :
                      isSelected  ? 'rgba(66,44,118,0.10)' :
                      isMe        ? 'rgba(66,44,118,0.06)' :
                      'transparent',
                    borderLeft: isSelected
                      ? '3px solid #422c76'
                      : isMe
                      ? '3px solid #422c76'
                      : '3px solid transparent',
                    cursor: compareMode ? 'pointer' : 'default',
                    transition: 'background 0.3s',
                    outline: isSelected ? '2px solid rgba(66,44,118,0.2)' : 'none',
                    outlineOffset: -2,
                  }}
                >
                  {/* Position */}
                  <td className="px-5 py-4 font-bold">
                    {isTop3 ? (
                      <span className="text-lg">{positionBadge(entry.position)}</span>
                    ) : (
                      <span className="text-xs font-semibold" style={{ color: '#aaa8b0' }}>{entry.position}º</span>
                    )}
                  </td>

                  {/* Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: isSelected ? '#422c76' : isMe ? 'rgba(66,44,118,0.15)' : '#f0ede8',
                          border: `1px solid ${isSelected || isMe ? 'rgba(66,44,118,0.3)' : '#e0dbd5'}`,
                          color: isSelected ? 'white' : isMe ? '#422c76' : '#5a5564',
                        }}
                      >
                        {initials(entry.name)}
                      </div>
                      <div>
                        {/* Nome clicável para abrir auditoria (só fora do modo comparação) */}
                        <button
                          onClick={(e) => {
                            if (compareMode) return
                            e.stopPropagation()
                            setHistoryUser({ id: entry.id, name: entry.name, position: entry.position })
                          }}
                          style={{
                            background: 'none', border: 'none', padding: 0, cursor: compareMode ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left',
                          }}
                          title={compareMode ? '' : `Ver histórico de ${entry.name}`}
                        >
                          <span className="font-semibold" style={{
                            color: isSelected || isMe ? '#422c76' : '#1a1625',
                            textDecoration: compareMode ? 'none' : undefined,
                          }}>
                            {entry.name}
                          </span>
                          {!compareMode && (
                            <span style={{ fontSize: 10, color: '#c4bfba', opacity: 0 }} className="group-hover:opacity-100 transition-opacity">📋</span>
                          )}
                          {isMe && (
                            <span className="text-[10px] font-normal uppercase tracking-widest" style={{ color: '#9a86c4' }}>você</span>
                          )}
                          {isSelected && !isMe && (
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#422c76' }}>✓</span>
                          )}
                        </button>
                        <p className="text-xs" style={{ color: '#aaa8b0' }}>{entry.department ?? entry.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Points */}
                  <td className="px-5 py-4 text-right">
                    <span className="font-bold text-base tabular-nums" style={{ color: isMe || isSelected ? '#422c76' : isTop3 ? '#1a1625' : '#5a5564' }}>
                      {entry.totalPoints}
                      <span className="text-xs ml-1 font-normal" style={{ color: '#aaa8b0' }}>pts</span>
                    </span>
                  </td>

                  {/* Prediction count */}
                  <td className="px-5 py-4 text-right hidden sm:table-cell" style={{ color: '#8a8490' }}>
                    {entry.predictionCount}
                  </td>

                  {/* Exact scores */}
                  <td className="px-5 py-4 text-right hidden md:table-cell">
                    {entry.exactCount > 0 ? (
                      <span className="points-badge">⚡ {entry.exactCount}</span>
                    ) : (
                      <span style={{ color: '#c4bfba' }}>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && search && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontSize: 32, margin: '0 0 8px' }}>🔍</p>
            <p style={{ color: '#8a8490', fontSize: 14 }}>Nenhum participante encontrado para "<strong>{search}</strong>"</p>
          </div>
        )}
      </div>

      {/* Dica comparação no modo ativo */}
      {compareMode && selected.length < 2 && (
        <p style={{ fontSize: 11, color: '#aaa8b0', textAlign: 'center', marginTop: 8 }}>
          Toque/clique em qualquer linha para selecionar até 2 pessoas
        </p>
      )}

      {/* ── Modal de comparação ── */}
      {showCompare && selected.length === 2 && (
        <ComparePanel
          a={selected[0]}
          b={selected[1]}
          onClose={() => setShowCompare(false)}
        />
      )}

      {/* ── Modal de histórico / auditoria ── */}
      {historyUser && (
        <UserHistoryModal
          userId={historyUser.id}
          name={historyUser.name}
          position={historyUser.position}
          onClose={() => setHistoryUser(null)}
        />
      )}
    </>
  )
}
