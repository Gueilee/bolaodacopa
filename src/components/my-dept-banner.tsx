import type { MyDeptStatus } from '@/lib/dept-ranking'
import Link from 'next/link'
import { Trophy, Medal, Award, Building2 } from 'lucide-react'

type Props = { status: MyDeptStatus }

export function MyDeptBanner({ status }: Props) {
  if (!status.department) {
    return (
      <div className="card p-4 border-dashed" style={{ borderColor: '#e8e4df' }}>
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: '#8a8490' }}>
            Você ainda não está atribuído a nenhum departamento.
          </p>
          <Link
            href="/dashboard/departamentos"
            className="text-xs hover:text-brand-neon transition-colors shrink-0 ml-3"
            style={{ color: '#8a8490' }}
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
    pos === 2 ? 'text-[#a0a0a0]' :
    pos === 3 ? 'text-[#CD7F32]' :
    'text-brand-purple'

  const bgStyle =
    pos === 1 ? { borderColor: 'rgba(255,215,0,0.2)', background: 'rgba(255,215,0,0.04)' } :
    pos === 2 ? { borderColor: '#e8e4df', background: '#faf9f7' } :
    pos === 3 ? { borderColor: 'rgba(205,127,50,0.2)', background: 'rgba(205,127,50,0.04)' } :
    { borderColor: 'rgba(111,63,251,0.2)', background: 'rgba(111,63,251,0.03)' }

  const MedalIcon = pos === 1 ? Trophy : pos === 2 ? Medal : pos === 3 ? Award : Building2
  const iconColor = pos === 1 ? '#D97706' : pos === 2 ? '#64748B' : pos === 3 ? '#A0522D' : '#422c76'

  return (
    <div className="card p-4 transition-colors" style={bgStyle}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: `${iconColor}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MedalIcon size={20} color={iconColor} strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-black tabular-nums ${posColor}`}>{posLabel}</span>
              <span className="text-xs" style={{ color: '#8a8490' }}>{totalLabel} departamentos</span>
            </div>
            <p className="text-sm font-medium" style={{ color: '#1a1625' }}>{status.department}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          {/* Média de pontos */}
          <div className="text-right hidden sm:block">
            <p className={`text-lg font-bold tabular-nums ${posColor}`}>
              {status.avgPoints.toFixed(1)}
            </p>
            <p className="text-[10px]" style={{ color: '#8a8490' }}>pts médios</p>
          </div>

          {/* Participação */}
          <div className="text-right hidden sm:block">
            <p className="text-lg font-bold tabular-nums" style={{ color: '#6b6672' }}>
              {status.participationRate}%
            </p>
            <p className="text-[10px]" style={{ color: '#8a8490' }}>participação</p>
          </div>

          <Link
            href="/dashboard/departamentos"
            className="text-xs hover:text-brand-neon transition-colors whitespace-nowrap"
            style={{ color: '#8a8490' }}
          >
            Ver ranking →
          </Link>
        </div>
      </div>

      {/* Líder do departamento */}
      {status.leader && (
        <p className="text-[11px] mt-2.5 pt-2.5 border-t" style={{ color: '#8a8490', borderColor: '#e8e4df' }}>
          Líder da equipe: <span className="font-medium" style={{ color: '#6b6672' }}>{status.leader}</span>
          {' '}· {status.lockedMembers}/{status.totalMembers} com palpites finalizados
        </p>
      )}
    </div>
  )
}
