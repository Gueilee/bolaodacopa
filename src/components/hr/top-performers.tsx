import type { TopPerformer } from '@/lib/hr-analytics'
import { positionBadge, initials } from '@/lib/utils'

type Props = { data: TopPerformer[] }

export function HrTopPerformers({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{color:'#8a8490'}}>
        Nenhum palpite pontuado ainda. Os top performers aparecerão aqui conforme os jogos forem encerrados.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((p) => (
        <div
          key={p.position}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            p.position <= 3 ? '' : ''
          }`}
          style={p.position <= 3 ? {background:'#f5f2ef', border:'1px solid #e8e4df'} : undefined}
        >
          {/* Posição */}
          <div className="w-8 shrink-0 text-center">
            {p.position <= 3 ? (
              <span className="text-lg">{positionBadge(p.position)}</span>
            ) : (
              <span className="text-xs" style={{color:'#8a8490'}}>{p.position}º</span>
            )}
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-brand-purple/40 border border-brand-purple/30 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold" style={{color:'#1a1625'}}>{initials(p.name)}</span>
          </div>

          {/* Nome + departamento */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{color:'#1a1625'}}>{p.name}</p>
            {p.department && (
              <p className="text-xs truncate" style={{color:'#8a8490'}}>{p.department}</p>
            )}
          </div>

          {/* Exatos */}
          {p.exactCount > 0 && (
            <div className="shrink-0 hidden sm:block">
              <span className="text-[11px] text-brand-neon bg-brand-neon/10 border border-brand-neon/20 rounded-md px-1.5 py-0.5">
                ⚡ {p.exactCount}
              </span>
            </div>
          )}

          {/* Pontos */}
          <div className="shrink-0 text-right">
            <p
              className={`font-bold tabular-nums ${p.position <= 3 ? 'text-base' : 'text-sm'}`}
              style={{color:'#1a1625'}}
            >
              {p.points}
            </p>
            <p className="text-[10px]" style={{color:'#8a8490'}}>pts</p>
          </div>
        </div>
      ))}
    </div>
  )
}
