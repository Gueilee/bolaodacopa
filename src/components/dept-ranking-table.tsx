import type { DeptRankEntry } from '@/lib/dept-ranking'

type Props = {
  entries:        DeptRankEntry[]
  userDept:       string | null  // departamento do usuário logado
  startFromPos?:  number         // pula as primeiras N (ex: 3 já no pódio)
}

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

export function DeptRankingTable({ entries, userDept, startFromPos = 0 }: Props) {
  const visible = entries.slice(startFromPos)

  if (visible.length === 0) return null

  const maxAvg = Math.max(...entries.map((e) => e.avgPoints), 1)

  return (
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
          {visible.map((dept) => {
            const isMyDept = dept.department === (userDept ?? 'Sem Departamento') && !userDept
              ? dept.department === 'Sem Departamento'
              : dept.department === userDept

            const barWidth = maxAvg > 0 ? (dept.avgPoints / maxAvg) * 100 : 0

            return (
              <tr
                key={dept.department}
                className={`
                  group transition-colors border-t
                  ${isMyDept
                    ? 'border-l-2 border-brand-purple'
                    : ''}
                `}
                style={{
                  borderTopColor: '#f0ede8',
                  background: isMyDept ? 'rgba(var(--brand-purple-rgb, 111,63,251),0.05)' : undefined,
                }}
              >
                {/* Posição */}
                <td className="px-5 py-4 text-xs font-bold" style={{ color: '#8a8490' }}>
                  {dept.position}º
                </td>

                {/* Departamento + barra */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold" style={{ color: isMyDept ? '#1a1625' : '#3d3847' }}>
                      {dept.department}
                    </span>
                    {isMyDept && (
                      <span className="text-[10px] text-brand-purple bg-brand-purple/20 border border-brand-purple/30 rounded px-1.5 py-0.5 font-semibold">
                        sua equipe
                      </span>
                    )}
                  </div>

                  {/* Barra de média relativa */}
                  <div className="h-1 rounded-full overflow-hidden w-full max-w-[200px]" style={{ background: '#e8e4df' }}>
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isMyDept ? 'bg-brand-purple' : ''}`}
                      style={{ width: `${barWidth}%`, background: isMyDept ? undefined : '#c8c4c0' }}
                    />
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

                {/* Média de Pontos — métrica principal */}
                <td className="px-5 py-4 text-right">
                  <span className="text-lg font-black tabular-nums" style={{ color: isMyDept ? '#1a1625' : '#3d3847' }}>
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

      {/* Nota da métrica */}
      <div className="px-5 py-3 border-t" style={{ borderColor: '#f0ede8' }}>
        <p className="text-[10px]" style={{ color: '#8a8490' }}>
          Classificação por <strong style={{ color: '#6b6672' }}>média de pontos de todos os membros</strong>
          {' '}— inclui colaboradores com 0 pts para estimular 100% de participação.
          Desempate: taxa de participação, depois maior pontuação individual.
        </p>
      </div>
    </div>
  )
}
