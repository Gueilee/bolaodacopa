'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { phaseLabels } from '@/lib/utils'

type Props = {
  phases: string[]
  active: string | null
}

export function PhaseFilter({ phases, active }: Props) {
  if (phases.length <= 1) return null

  return (
    <div className="flex gap-2 flex-wrap">
      <Link
        href="/dashboard/jogos"
        className={`
          text-xs px-3 py-1.5 rounded-lg font-medium transition-all
          ${!active
            ? 'bg-brand-purple text-white'
            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}
        `}
      >
        Todos
      </Link>
      {phases.map((phase) => (
        <Link
          key={phase}
          href={`/dashboard/jogos?fase=${phase}`}
          className={`
            text-xs px-3 py-1.5 rounded-lg font-medium transition-all
            ${active === phase
              ? 'bg-brand-purple text-white'
              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}
          `}
        >
          {phaseLabels[phase] ?? phase}
        </Link>
      ))}
    </div>
  )
}
