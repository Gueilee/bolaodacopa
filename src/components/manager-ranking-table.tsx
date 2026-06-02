import type { ManagerRankingEntry } from '@/lib/queries'

type Props = {
  entries:       ManagerRankingEntry[]
  userManager?:  string | null
}

export function ManagerRankingTable({ entries, userManager }: Props) {
  if (entries.length === 0) return null

  const maxPts = Math.max(...entries.map(e => e.totalPoints), 1)

  return (
    <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: '#e8e4df' }}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-[10px] uppercase tracking-wider" style={{ borderColor: '#e8e4df', color: '#8a8490' }}>
            <th className="text-left px-5 py-3 w-10">#</th>
            <th className="text-left px-5 py-3">Gestor</th>
            <th className="text-right px-3 py-3 hidden sm:table-cell">Time</th>
            <th className="text-right px-5 py-3">Total pts</th>
            <th className="text-left px-5 py-3 hidden md:table-cell">Destaque</th>
          </tr>
        </thead>

        <tbody>
          {entries.map((e, idx) => {
            const isMyManager = userManager && e.manager === userManager
            const barWidth    = maxPts > 0 ? (e.totalPoints / maxPts) * 100 : 0
            const pos         = idx + 1

            return (
              <tr
                key={e.manager}
                className="border-t transition-colors"
                style={{
                  borderTopColor: '#f0ede8',
                  background: isMyManager ? 'rgba(66,44,118,0.05)' : undefined,
                  borderLeft: isMyManager ? '2px solid #422c76' : undefined,
                }}
              >
                {/* Posição */}
                <td className="px-5 py-4">
                  <span
                    className="text-sm font-black tabular-nums"
                    style={{
                      color: pos === 1 ? '#f5c518' : pos === 2 ? '#a0a0a0' : pos === 3 ? '#cd7f32' : '#8a8490',
                    }}
                  >
                    {pos}º
                  </span>
                </td>

                {/* Gestor + barra */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-sm" style={{ color: '#1a1625' }}>
                      {e.manager}
                    </span>
                    {isMyManager && (
                      <span className="text-[10px] rounded px-1.5 py-0.5 font-semibold"
                        style={{ color: '#422c76', background: 'rgba(66,44,118,0.12)', border: '1px solid rgba(66,44,118,0.25)' }}>
                        seu gestor
                      </span>
                    )}
                  </div>
                  <div className="h-1 rounded-full overflow-hidden max-w-[200px]" style={{ background: '#e8e4df' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${barWidth}%`, background: isMyManager ? '#422c76' : '#c8c4c0' }}
                    />
                  </div>
                </td>

                {/* Nº membros */}
                <td className="px-3 py-4 text-right tabular-nums hidden sm:table-cell" style={{ color: '#6b6672' }}>
                  {e.participants}
                </td>

                {/* Total pontos */}
                <td className="px-5 py-4 text-right">
                  <span className="text-lg font-black tabular-nums" style={{ color: '#1a1625' }}>
                    {e.totalPoints}
                  </span>
                  <span className="text-xs ml-1" style={{ color: '#8a8490' }}>pts</span>
                </td>

                {/* Destaque (líder do time) */}
                <td className="px-5 py-4 text-xs hidden md:table-cell" style={{ color: '#6b6672' }}>
                  {e.leader ? e.leader.split(' ')[0] : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="px-5 py-3 border-t" style={{ borderColor: '#f0ede8' }}>
        <p className="text-[10px]" style={{ color: '#8a8490' }}>
          Classificação por <strong style={{ color: '#6b6672' }}>soma dos pontos de todos os colaboradores do time</strong>.
          Destaque = colaborador com maior pontuação individual no time.
        </p>
      </div>
    </div>
  )
}
