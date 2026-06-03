'use client'

import { logoutAction } from '@/app/actions/auth'
import type { SessionPayload } from '@/lib/session'

type Props = { user: SessionPayload; compact?: boolean }

export function UserMenu({ user, compact = false }: Props) {
  const initials = user.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
  const roleLabel = user.role === 'admin' ? 'Admin' : user.role === 'rh' ? 'RH' : null

  if (compact) {
    return (
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'linear-gradient(135deg, #422c76, #5a3e94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800, color: '#fff',
        boxShadow: '0 0 12px rgba(66,44,118,0.6)',
        flexShrink: 0, cursor: 'pointer',
      }}>
        {initials}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #422c76, #5a3e94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800, color: '#fff',
        boxShadow: '0 0 16px rgba(66,44,118,0.5)',
        border: '1.5px solid rgba(255,255,255,0.12)',
      }}>
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.88)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name.split(' ')[0]}
          </p>
          {roleLabel && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 5,
              background: 'rgba(1,225,142,0.15)', color: '#01E18E',
              border: '1px solid rgba(1,225,142,0.25)', flexShrink: 0,
            }}>
              {roleLabel}
            </span>
          )}
        </div>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.email}
        </p>
      </div>

      {/* Logout */}
      <form action={logoutAction}>
        <button
          type="submit"
          title="Sair"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '5px 8px',
            color: 'rgba(255,255,255,0.35)',
            cursor: 'pointer', fontSize: 13, lineHeight: 1,
            transition: 'all 0.15s', flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,47,105,0.15)'
            e.currentTarget.style.borderColor = 'rgba(255,47,105,0.3)'
            e.currentTarget.style.color = '#ff2f69'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
          }}
        >
          ⏻
        </button>
      </form>
    </div>
  )
}
