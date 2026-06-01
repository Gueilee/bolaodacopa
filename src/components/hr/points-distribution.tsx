import type { PointsBucket } from '@/lib/hr-analytics'

type Props = { data: PointsBucket[] }

export function HrPointsDistribution({ data }: Props) {
  const maxPct = Math.max(...data.map((b) => b.pct), 1)

  const bucketColor = (label: string) => {
    if (label === '0 pts')   return 'bg-white/20'
    if (label === '401+')    return 'bg-brand-neon'
    if (label === '201–400') return 'bg-brand-neon/70'
    if (label === '101–200') return 'bg-brand-purple'
    if (label === '51–100')  return 'bg-brand-purple/60'
    return 'bg-white/30'
  }

  return (
    <div className="space-y-3">
      {data.map((bucket) => (
        <div key={bucket.label} className="flex items-center gap-3">
          {/* Label */}
          <span className="text-xs text-white/50 w-16 shrink-0 text-right font-mono">
            {bucket.label}
          </span>

          {/* Barra */}
          <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden relative">
            <div
              className={`h-full rounded-lg transition-all duration-700 ${bucketColor(bucket.label)}`}
              style={{ width: `${maxPct > 0 ? (bucket.pct / maxPct) * 100 : 0}%` }}
            />
            {bucket.count > 0 && (
              <span className="absolute inset-0 flex items-center px-2 text-xs font-semibold text-white/80">
                {bucket.count} {bucket.count === 1 ? 'colaborador' : 'colaboradores'}
              </span>
            )}
          </div>

          {/* Pct */}
          <span className="text-xs text-white/40 w-10 shrink-0 tabular-nums">
            {bucket.pct}%
          </span>
        </div>
      ))}

      <p className="text-white/20 text-[10px] pt-2">
        A pontuação aumenta conforme os jogos são encerrados e os palpites pontuados pelo admin.
      </p>
    </div>
  )
}
