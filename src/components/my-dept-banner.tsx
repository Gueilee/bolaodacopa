import type { MyDeptStatus } from '@/lib/dept-ranking'
import Link from 'next/link'

type Props = { status: MyDeptStatus }

export function MyDeptBanner({ status }: Props) {
  if (!status.department) {
    return (
      <div className="card p-4 border-dashed border-white/10">
        <div className="flex items-center justify-between">
          <p className="text-white/30 text-sm">
            Você ainda não está atribuído a nenhum departamento.
          </p>
          <Link
            href="/dashboard/departamentos"
            className="text-xs text-white/30 hover:text-brand-neon transition-colors shrink-0 ml-3"
          >
            Ver ranking →
          </Link>
        </div>
      </div>
    )
  }

  const pos = status.position
  const posLabel = pos !== null ? `${pos}º` : '—'
  const totalLabel = `de ${status.totalDepts}`

  const posColor =
    pos === 1 ? 'text-[#FFD700]' :
    pos === 2 ? 'text-white/80' :
    pos === 3 ? 'text-[#CD7F32]' :
    'text-brand-purple'

  const bgColor =
    pos === 1 ? 'border-[#FFD700]/20 bg-[#FFD700]/5' :
    pos === 2 ? 'border-white/12 bg-white/3' :
    pos === 3 ? 'border-[#CD7F32]/20 bg-[#CD7F32]/5' :
    'border-brand-purple/20 bg-brand-purple/5'

  const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : '🏢'

  return (
    <div className={`card p-4 ${bgColor} transition-colors`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0">{medal}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-black tabular-nums ${posColor}`}>{posLabel}</span>
              <span className="text-white/30 text-xs">{totalLabel} departamentos</span>
            </div>
            <p className="text-white/70 text-sm font-medium">{status.department}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          {/* Média de pontos */}
          <div className="text-right hidden sm:block">
            <p className={`text-lg font-bold tabular-nums ${posColor}`}>
              {status.avgPoints.toFixed(1)}
            </p>
            <p className="text-white/25 text-[10px]">pts médios</p>
          </div>

          {/* Participação */}
          <div className="text-right hidden sm:block">
            <p className="text-lg font-bold tabular-nums text-white/60">
              {status.participationRate}%
            </p>
            <p className="text-white/25 text-[10px]">participação</p>
          </div>

          <Link
            href="/dashboard/departamentos"
            className="text-xs text-white/40 hover:text-brand-neon transition-colors whitespace-nowrap"
          >
            Ver ranking →
          </Link>
        </div>
      </div>

      {/* Líder do departamento */}
      {status.leader && (
        <p className="text-white/25 text-[11px] mt-2.5 pt-2.5 border-t border-white/8">
          Líder da equipe: <span className="text-white/50 font-medium">{status.leader}</span>
          {' '}· {status.lockedMembers}/{status.totalMembers} com palpites finalizados
        </p>
      )}
    </div>
  )
}
