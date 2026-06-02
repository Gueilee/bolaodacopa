import type { DeptRankEntry } from '@/lib/dept-ranking'
import { initials } from '@/lib/utils'

type Props = { top3: DeptRankEntry[] }

// ─── Configurações visuais por posição ───────────────────────────────────────

const PODIUM_CONFIG = {
  1: {
    medal:       '🥇',
    height:      'h-40',
    labelHeight: 'h-10',
    bg:          'bg-gradient-to-b from-[#FFD700]/20 to-[#FFD700]/5',
    border:      'border-[#FFD700]/40',
    glow:        'shadow-[0_0_40px_rgba(255,215,0,0.2)]',
    pts:         'text-[#FFD700]',
    order:       'order-2',             // centro
    translate:   '',
    zIndex:      'z-10',
  },
  2: {
    medal:       '🥈',
    height:      'h-28',
    labelHeight: 'h-8',
    bg:          'bg-gradient-to-b from-white/10 to-white/3',
    border:      'border-white/20',
    glow:        '',
    pts:         'text-white/80',
    order:       'order-1',             // esquerda
    translate:   'translate-y-6',
    zIndex:      'z-0',
  },
  3: {
    medal:       '🥉',
    height:      'h-20',
    labelHeight: 'h-8',
    bg:          'bg-gradient-to-b from-[#CD7F32]/15 to-[#CD7F32]/5',
    border:      'border-[#CD7F32]/30',
    glow:        '',
    pts:         'text-[#CD7F32]',
    order:       'order-3',             // direita
    translate:   'translate-y-10',
    zIndex:      'z-0',
  },
} as const

// ─── Card de cada posição ─────────────────────────────────────────────────────

function PodiumCard({ entry }: { entry: DeptRankEntry }) {
  const cfg = PODIUM_CONFIG[entry.position as 1 | 2 | 3]

  return (
    <div className={`flex flex-col items-center gap-0 ${cfg.order} ${cfg.translate} ${cfg.zIndex}`}>

      {/* Badge de posição + departamento */}
      <div className="text-center mb-3 px-2">
        <div className="text-2xl mb-1">{cfg.medal}</div>
        <p className="font-bold text-sm leading-tight max-w-[110px] text-center" style={{ color: '#1a1625' }}>
          {entry.department}
        </p>
        {entry.leader && (
          <p className="text-[10px] mt-0.5 truncate max-w-[110px] text-center" style={{ color: '#8a8490' }}>
            Líder: {entry.leader.split(' ')[0]}
          </p>
        )}
      </div>

      {/* Bloco do pódio com pontuação — mantém fundo colorido, texto branco adequado */}
      <div
        className={`
          w-full min-w-[100px] max-w-[130px] rounded-t-2xl border
          flex flex-col items-center justify-start pt-4 px-3
          ${cfg.height} ${cfg.bg} ${cfg.border} ${cfg.glow}
        `}
      >
        <p className={`text-2xl font-black tabular-nums ${cfg.pts}`}>
          {entry.avgPoints.toFixed(1)}
        </p>
        <p className="text-[10px] text-white/50">pts médios</p>

        <div className="mt-2 text-center">
          <p className="text-[10px] text-white/50">
            {entry.lockedMembers}/{entry.totalMembers} membros
          </p>
          <p className="text-[10px] text-white/40">{entry.participationRate}% participação</p>
        </div>
      </div>

      {/* Base do pódio */}
      <div
        className={`
          w-full min-w-[100px] max-w-[130px] ${cfg.labelHeight} rounded-b-lg
          ${cfg.bg} ${cfg.border} border-t-0
          flex items-center justify-center
        `}
      >
        <span className="text-xs font-bold text-white/50">{entry.position}º</span>
      </div>
    </div>
  )
}

// ─── Pódio principal ──────────────────────────────────────────────────────────

export function DeptPodium({ top3 }: Props) {
  if (top3.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm" style={{ color: '#8a8490' }}>
          Nenhum departamento cadastrado ainda.
        </p>
        <p className="text-xs mt-1" style={{ color: '#8a8490' }}>
          Atribua departamentos aos colaboradores em Administração → Usuários.
        </p>
      </div>
    )
  }

  if (top3.length === 1) {
    return (
      <div className="flex justify-center">
        <PodiumCard entry={top3[0]} />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Linha de base */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: '#e8e4df' }} />

      {/* Pódio */}
      <div className="flex items-end justify-center gap-2 pb-0">
        {top3.map((entry) => (
          <PodiumCard key={entry.department} entry={entry} />
        ))}
      </div>
    </div>
  )
}
