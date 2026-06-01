import type { DeptStats } from '@/lib/hr-analytics'

type Props = { data: DeptStats[] }

function rateColor(pct: number): string {
  if (pct >= 80) return 'bg-brand-neon'
  if (pct >= 50) return 'bg-yellow-400'
  return 'bg-brand-pink'
}

function rateBadge(pct: number): string {
  if (pct >= 80) return 'text-brand-neon bg-brand-neon/10 border-brand-neon/20'
  if (pct >= 50) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
  return 'text-brand-pink bg-brand-pink/10 border-brand-pink/20'
}

export function HrDeptChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-white/25 text-sm text-center py-8">
        Nenhum departamento cadastrado ainda. Atribua departamentos aos colaboradores no painel de usuários.
      </p>
    )
  }

  const maxTotal = Math.max(...data.map((d) => d.total))

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
        <span>Departamento</span>
        <span className="text-right w-16">Colabs</span>
        <span className="text-right w-20 hidden sm:block">Finalizaram</span>
        <span className="text-right w-14">Taxa</span>
        <span className="text-right w-16 hidden md:block">Média pts</span>
      </div>

      {data.map((dept) => (
        <div
          key={dept.department}
          className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3 rounded-xl hover:bg-white/3 transition-colors"
        >
          {/* Nome + barra */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-medium text-brand-cream truncate">
                {dept.department}
              </span>
              {dept.leader && (
                <span className="text-[10px] text-white/30 hidden sm:inline truncate">
                  líder: {dept.leader.split(' ')[0]}
                </span>
              )}
            </div>
            {/* Barra proporcional ao total + barra interna de finalizados */}
            <div
              className="h-1.5 rounded-full bg-white/8 overflow-hidden"
              style={{ width: `${Math.max(20, (dept.total / maxTotal) * 100)}%` }}
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ${rateColor(dept.participationRate)}`}
                style={{ width: `${dept.participationRate}%` }}
              />
            </div>
          </div>

          {/* Total */}
          <span className="text-sm text-white/50 tabular-nums text-right w-16">
            {dept.total}
          </span>

          {/* Finalizados */}
          <span className="text-sm text-white/50 tabular-nums text-right w-20 hidden sm:block">
            {dept.locked}
          </span>

          {/* Taxa */}
          <span
            className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-md border text-right w-14 inline-flex items-center justify-center ${rateBadge(dept.participationRate)}`}
          >
            {dept.participationRate}%
          </span>

          {/* Média de pontos */}
          <span className="text-sm text-white/50 tabular-nums text-right w-16 hidden md:block">
            {dept.avgPoints > 0 ? dept.avgPoints.toFixed(0) : '—'}
          </span>
        </div>
      ))}

      {/* Legenda */}
      <div className="flex items-center gap-4 pt-3 px-4 text-[10px] text-white/25">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full bg-brand-neon inline-block" />
          ≥ 80% (ótimo)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full bg-yellow-400 inline-block" />
          50–79% (atenção)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full bg-brand-pink inline-block" />
          {'< 50% (crítico)'}
        </span>
      </div>
    </div>
  )
}
