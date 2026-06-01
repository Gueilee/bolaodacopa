import type { TimelineEntry } from '@/lib/hr-analytics'

type Props = { data: TimelineEntry[]; totalUsers: number }

export function HrLockTimeline({ data, totalUsers }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-white/25 text-sm text-center py-8">
        Nenhum colaborador finalizou os palpites ainda.
      </p>
    )
  }

  const maxCumulative = data[data.length - 1]?.cumulative ?? 1
  const maxNew        = Math.max(...data.map((d) => d.newLocks))

  function formatDay(dateStr: string) {
    if (!dateStr) return ''
    const [, month, day] = dateStr.split('-')
    return `${day}/${month}`
  }

  return (
    <div className="space-y-4">
      {/* Gráfico de barras CSS — novos registros por dia */}
      <div className="flex items-end gap-1.5 h-28">
        {data.map((entry) => {
          const height = maxNew > 0 ? Math.max(4, (entry.newLocks / maxNew) * 100) : 4
          return (
            <div
              key={entry.date}
              className="flex-1 flex flex-col items-center gap-1 group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1a1a2e] border border-white/15 rounded-lg px-2 py-1 text-[10px] text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {formatDay(entry.date)}: +{entry.newLocks} ({entry.cumulative} total)
              </div>

              {/* Barra */}
              <div
                className="w-full rounded-t-sm bg-brand-purple/70 hover:bg-brand-purple transition-colors"
                style={{ height: `${height}%` }}
              />

              {/* Label do dia */}
              <span className="text-[9px] text-white/30 truncate w-full text-center">
                {formatDay(entry.date)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Linha de progresso acumulado */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-white/30">
          <span>Adesão acumulada</span>
          <span>{maxCumulative} de {totalUsers} ({totalUsers > 0 ? Math.round((maxCumulative / totalUsers) * 100) : 0}%)</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-neon rounded-full transition-all duration-700"
            style={{ width: `${totalUsers > 0 ? (maxCumulative / totalUsers) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Primeiro registro',
            value: data[0]?.date ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(data[0].date + 'T12:00:00Z')) : '—',
          },
          {
            label: 'Maior adesão em 1 dia',
            value: `${maxNew} colaboradores`,
          },
          {
            label: 'Último registro',
            value: data[data.length - 1]?.date
              ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(data[data.length - 1].date + 'T12:00:00Z'))
              : '—',
          },
        ].map((s) => (
          <div key={s.label} className="bg-white/4 rounded-xl p-3 text-center">
            <p className="text-white font-semibold text-sm">{s.value}</p>
            <p className="text-white/30 text-[10px] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
