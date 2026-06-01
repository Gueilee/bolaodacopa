'use client'

import { initials, positionBadge } from '@/lib/utils'
import type { RankingEntry } from '@/lib/queries'

type Props = {
  entries:       RankingEntry[]
  currentUserId: string
}

export function RankingTable({ entries, currentUserId }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-center py-16" style={{ color: '#8a8490' }}>
        Nenhum participante ainda.
      </p>
    )
  }

  return (
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
          {entries.map((entry) => {
            const isCurrentUser = entry.id === currentUserId
            const isTop3        = entry.position <= 3

            return (
              <tr
                key={entry.id}
                style={{
                  borderBottom: '1px solid #f0ede8',
                  background: isCurrentUser ? 'rgba(66,44,118,0.06)' : 'transparent',
                  borderLeft: isCurrentUser ? '3px solid #422c76' : '3px solid transparent',
                  transition: 'background 0.15s',
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
                        background: isCurrentUser ? 'rgba(66,44,118,0.15)' : '#f0ede8',
                        border: `1px solid ${isCurrentUser ? 'rgba(66,44,118,0.3)' : '#e0dbd5'}`,
                        color: isCurrentUser ? '#422c76' : '#5a5564',
                      }}
                    >
                      {initials(entry.name)}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: isCurrentUser ? '#422c76' : '#1a1625' }}>
                        {entry.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-[10px] font-normal uppercase tracking-widest" style={{ color: '#9a86c4' }}>
                            você
                          </span>
                        )}
                      </p>
                      <p className="text-xs" style={{ color: '#aaa8b0' }}>{entry.email}</p>
                    </div>
                  </div>
                </td>

                {/* Points */}
                <td className="px-5 py-4 text-right">
                  <span className="font-bold text-base tabular-nums" style={{ color: isCurrentUser ? '#422c76' : isTop3 ? '#1a1625' : '#5a5564' }}>
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
    </div>
  )
}
