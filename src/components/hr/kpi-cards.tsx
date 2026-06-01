import type { HrOverview } from '@/lib/hr-analytics'

type Props = { data: HrOverview }

export function HrKpiCards({ data }: Props) {
  const betPct = data.totalMatches > 0
    ? Math.round((data.avgPredictionsPerUser / data.totalMatches) * 100)
    : 0

  const cards = [
    {
      label:    'Colaboradores',
      value:    data.totalUsers,
      sub:      `${data.usersWithAnyBet} com ao menos 1 palpite`,
      color:    'text-brand-cream',
      icon:     '👥',
    },
    {
      label:    'Taxa de Participação',
      value:    `${data.participationRate}%`,
      sub:      `${data.lockedUsers} de ${data.totalUsers} finalizaram`,
      color:    data.participationRate >= 80
        ? 'text-brand-neon'
        : data.participationRate >= 50
        ? 'text-yellow-400'
        : 'text-brand-pink',
      icon:     '🎯',
    },
    {
      label:    'Palpites Registrados',
      value:    data.totalPredictions.toLocaleString('pt-BR'),
      sub:      `Média ${data.avgPredictionsPerUser} de ${data.totalMatches} jogos (${betPct}%)`,
      color:    'text-brand-cream',
      icon:     '⚽',
    },
    {
      label:    'Pontuação Média',
      value:    data.avgPoints.toLocaleString('pt-BR', { maximumFractionDigits: 1 }),
      sub:      `Máximo: ${data.maxPoints} pts`,
      color:    'text-brand-cream',
      icon:     '🏆',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{c.icon}</span>
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{c.label}</p>
          </div>
          <p className={`text-3xl font-black tabular-nums ${c.color}`}>{c.value}</p>
          <p className="text-white/30 text-xs mt-1.5">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
