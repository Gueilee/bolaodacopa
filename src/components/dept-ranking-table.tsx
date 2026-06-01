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
    <div className="overflow-x-auto rounded-2xl border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 text-white/30 text-[10px] uppercase tracking-wider">
            <th className="text-left px-5 py-3 w-10">#</th>
            <th className="text-left px-5 py-3">Departamento</th>
            <th className="text-right px-3 py-3 hidden sm:table-cell">Membros</th>
            <th className="text-center px-3 py-3">Participação</th>
            <th className="text-right px-5 py-3">Média de Pontos</th>
            <th className="text-right px-5 py-3 hidden lg:table-cell">Máximo</th>
            <th className="text-left  px-5 py-3 hidden md:table-cell">Líder</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {visible.map((dept) => {
            const isMyDept = dept.department === (userDept ?? 'Sem Departamento') && !userDept
              ? dept.department === 'Sem Departamento'
              : dept.department === userDept

            const barWidth = maxAvg > 0 ? (dept.avgPoints / maxAvg) * 100 : 0

            return (
              <tr
                key={dept.department}
                className={`
                  group transition-colors
                  ${isMyDept
                    ? 'bg-brand-purple/10 border-l-2 border-brand-purple'
                    : 'hover:bg-white/3'}
                `}
              >
                {/* Posição */}
                <td className="px-5 py-4 text-white/30 text-xs font-bold">
                  {dept.position}º
                </td>

                {/* Departamento + barra */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`font-semibold ${isMyDept ? 'text-brand-cream' : 'text-white/80'}`}>
                      {dept.department}
                    </span>
                    {isMyDept && (
                      <span className="text-[10px] text-brand-purple bg-brand-purple/20 border border-brand-purple/30 rounded px-1.5 py-0.5 font-semibold">
                        sua equipe
                      </span>
                    )}
                  </div>

                  {/* Barra de média relativa */}
                  <div className="h-1 rounded-full bg-white/8 overflow-hidden w-full max-w-[200px]">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isMyDept ? 'bg-brand-purple' : 'bg-white/25'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </td>

                {/* Membros */}
                <td className="px-3 py-4 text-right text-white/40 tabular-nums hidden sm:table-cell">
                  <span className="text-white/70">{dept.lockedMembers}</span>
                  <span className="text-white/25">/{dept.totalMembers}</span>
                </td>

                {/* Participação */}
                <td className="px-3 py-4 text-center">
                  <ParticipationBadge rate={dept.participationRate} />
                </td>

                {/* Média de Pontos — métrica principal */}
                <td className="px-5 py-4 text-right">
                  <span className={`text-lg font-black tabular-nums ${isMyDept ? 'text-brand-cream' : 'text-white/70'}`}>
                    {dept.avgPoints.toFixed(1)}
                  </span>
                  <span className="text-white/25 text-xs ml-1">pts</span>
                </td>

                {/* Máximo */}
                <td className="px-5 py-4 text-right text-white/40 tabular-nums hidden lg:table-cell">
                  {dept.maxPoints > 0 ? dept.maxPoints : '—'}
                </td>

                {/* Líder */}
                <td className="px-5 py-4 text-white/40 text-xs hidden md:table-cell">
                  {dept.leader ? (
                    <div>
                      <p className="text-white/60">{dept.leader.split(' ')[0]}</p>
                      <p className="text-white/25">{dept.leaderPoints} pts</p>
                    </div>
                  ) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Nota da métrica */}
      <div className="px-5 py-3 border-t border-white/5">
        <p className="text-white/20 text-[10px]">
          Classificação por <strong className="text-white/35">média de pontos de todos os membros</strong>
          {' '}— inclui colaboradores com 0 pts para estimular 100% de participação.
          Desempate: taxa de participação, depois maior pontuação individual.
        </p>
      </div>
    </div>
  )
}
