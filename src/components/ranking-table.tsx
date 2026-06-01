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
      <p className="text-center text-white/30 py-16">
        Nenhum participante ainda.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
            <th className="text-left px-5 py-3 w-14">#</th>
            <th className="text-left px-5 py-3">Participante</th>
            <th className="text-right px-5 py-3">Pontos</th>
            <th className="text-right px-5 py-3 hidden sm:table-cell">Palpites</th>
            <th className="text-right px-5 py-3 hidden md:table-cell">Placares Exatos</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {entries.map((entry) => {
            const isCurrentUser = entry.id === currentUserId
            const isTop3        = entry.position <= 3

            return (
              <tr
                key={entry.id}
                className={`
                  transition-colors
                  ${isCurrentUser
                    ? 'bg-brand-neon/8 border-l-2 border-brand-neon'
                    : 'hover:bg-white/3'}
                `}
              >
                {/* Position */}
                <td className="px-5 py-4 font-bold">
                  {isTop3 ? (
                    <span className="text-lg">{positionBadge(entry.position)}</span>
                  ) : (
                    <span className="text-white/30 text-xs">{entry.position}º</span>
                  )}
                </td>

                {/* Name */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        text-xs font-bold shrink-0
                        ${isCurrentUser
                          ? 'bg-brand-neon/20 border border-brand-neon/40 text-brand-neon'
                          : 'bg-brand-purple/30 border border-brand-purple/40 text-brand-cream'}
                      `}
                    >
                      {initials(entry.name)}
                    </div>
                    <div>
                      <p className={`font-medium ${isCurrentUser ? 'text-brand-neon' : 'text-brand-cream'}`}>
                        {entry.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-[10px] font-normal text-brand-neon/60 uppercase tracking-widest">
                            você
                          </span>
                        )}
                      </p>
                      <p className="text-white/30 text-xs">{entry.email}</p>
                    </div>
                  </div>
                </td>

                {/* Points */}
                <td className="px-5 py-4 text-right">
                  <span
                    className={`
                      inline-flex items-center justify-end font-bold text-base tabular-nums
                      ${isCurrentUser ? 'text-brand-neon' : isTop3 ? 'text-white' : 'text-white/70'}
                    `}
                  >
                    {entry.totalPoints}
                    <span className="text-white/25 text-xs ml-1 font-normal">pts</span>
                  </span>
                </td>

                {/* Prediction count */}
                <td className="px-5 py-4 text-right hidden sm:table-cell text-white/50">
                  {entry.predictionCount}
                </td>

                {/* Exact scores */}
                <td className="px-5 py-4 text-right hidden md:table-cell">
                  {entry.exactCount > 0 ? (
                    <span className="points-badge">⚡ {entry.exactCount}</span>
                  ) : (
                    <span className="text-white/25">—</span>
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
