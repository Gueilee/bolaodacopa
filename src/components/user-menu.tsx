'use client'

import { logoutAction } from '@/app/actions/auth'
import type { SessionPayload } from '@/lib/session'

type Props = { user: SessionPayload; compact?: boolean }

export function UserMenu({ user, compact = false }: Props) {
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'w-full'}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-brand-purple/50 border border-brand-purple/60 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-brand-cream">{initials}</span>
      </div>

      {!compact && (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-white/40 text-xs truncate">{user.email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Sair"
              className="text-white/30 hover:text-brand-pink transition-colors text-xs"
            >
              ⏻
            </button>
          </form>
        </>
      )}
    </div>
  )
}
