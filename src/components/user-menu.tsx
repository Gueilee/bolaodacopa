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
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
        style={{ background: '#422c76', color: '#ffffff' }}
      >
        {initials}
      </div>

      {!compact && (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#1a1625' }}>{user.name}</p>
            <p className="text-xs truncate" style={{ color: '#8a8490' }}>{user.email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Sair"
              className="transition-colors text-sm px-2 py-1 rounded-lg"
              style={{ color: '#8a8490', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ff2f69'; e.currentTarget.style.background = '#fce8ee' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#8a8490'; e.currentTarget.style.background = 'transparent' }}
            >
              ⏻ Sair
            </button>
          </form>
        </>
      )}
    </div>
  )
}
