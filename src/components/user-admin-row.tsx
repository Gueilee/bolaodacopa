'use client'

import { useState, useTransition } from 'react'
import { updateUserDepartment, toggleUserActive, updateUserRole } from '@/app/actions/users'
import { UserAvatar } from '@/components/user-avatar'

type User = {
  id:                 string
  name:               string
  email:              string
  role:               'admin' | 'rh' | 'user'
  department:         string | null
  avatarUrl:          string | null
  isActive:           boolean
  totalPoints:        number
  isPredictionLocked: boolean
}

type Props = { user: User; existingDepartments: string[] }

const ROLE_LABELS: Record<string, string> = {
  user:  'Colaborador',
  rh:    'RH',
  admin: 'Admin',
}

const ROLE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  user:  { bg: 'rgba(66,44,118,0.08)',  color: '#422c76', border: 'rgba(66,44,118,0.2)'  },
  rh:    { bg: 'rgba(1,168,102,0.08)',  color: '#01a866', border: 'rgba(1,168,102,0.2)'  },
  admin: { bg: 'rgba(255,47,105,0.08)', color: '#ff2f69', border: 'rgba(255,47,105,0.2)' },
}

export function UserAdminRow({ user, existingDepartments }: Props) {
  const [dept,        setDept]       = useState(user.department ?? '')
  const [editingDept, setEditingDept]= useState(false)
  const [currentRole, setCurrentRole]= useState(user.role)
  const [isPending,   startTransition] = useTransition()
  const [saved,       setSaved]      = useState(false)
  const [error,       setError]      = useState<string | null>(null)

  function saveDept() {
    startTransition(async () => {
      const result = await updateUserDepartment(user.id, dept || null)
      if (result.success) { setSaved(true); setTimeout(() => setSaved(false), 2000); setEditingDept(false) }
      else setError(result.error ?? 'Erro')
    })
  }

  function handleRoleChange(newRole: 'admin' | 'rh' | 'user') {
    if (newRole === currentRole) return
    setCurrentRole(newRole)
    startTransition(async () => {
      const result = await updateUserRole(user.id, newRole)
      if (!result.success) {
        setCurrentRole(user.role) // reverte se falhar
        setError(result.error ?? 'Erro ao alterar perfil')
      }
    })
  }

  function toggleActive() {
    startTransition(async () => {
      await toggleUserActive(user.id, !user.isActive)
    })
  }

  const roleStyle = ROLE_COLORS[currentRole] ?? ROLE_COLORS.user

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderBottom: '1px solid #f0ede8',
        background: !user.isActive ? 'rgba(0,0,0,0.02)' : '#fff',
        opacity: !user.isActive ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Avatar real */}
      <div style={{ flexShrink: 0 }}>
        <UserAvatar
          name={user.name}
          avatarUrl={user.avatarUrl}
          size={36}
          bgColor={currentRole === 'admin' ? '#ff2f69' : currentRole === 'rh' ? '#01a866' : '#422c76'}
          textColor="white"
        />
      </div>

      {/* Nome + email */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a1625',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
            {user.name}
          </p>
          {user.isPredictionLocked && (
            <span style={{ fontSize: 9, color: '#01a866', background: 'rgba(1,168,102,0.1)',
              border: '1px solid rgba(1,168,102,0.2)', borderRadius: 6, padding: '1px 5px' }}>
              🔒 finalizado
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 11, color: '#8a8490',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.email}
        </p>
      </div>

      {/* Seletor de Perfil */}
      <div style={{ flexShrink: 0 }}>
        <select
          value={currentRole}
          onChange={(e) => handleRoleChange(e.target.value as 'admin' | 'rh' | 'user')}
          disabled={isPending}
          style={{
            fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 8, cursor: 'pointer',
            background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}`,
            outline: 'none', appearance: 'auto',
          }}
        >
          <option value="user">Colaborador</option>
          <option value="rh">RH</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Departamento (editável) */}
      <div style={{ flexShrink: 0, minWidth: 110 }}>
        {editingDept ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              list={`dept-list-${user.id}`}
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              placeholder="Departamento"
              style={{
                fontSize: 11, padding: '4px 8px', borderRadius: 8, border: '1px solid #d4c8e8',
                background: '#fff', color: '#1a1625', outline: 'none', width: 100,
              }}
              onKeyDown={(e) => e.key === 'Enter' && saveDept()}
            />
            <datalist id={`dept-list-${user.id}`}>
              {existingDepartments.map((d) => <option key={d} value={d} />)}
            </datalist>
            <button onClick={saveDept} disabled={isPending}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#01a866' }}>
              {isPending ? '…' : '✓'}
            </button>
            <button onClick={() => { setEditingDept(false); setDept(user.department ?? '') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#aaa8b0' }}>
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingDept(true)}
            style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 8,
              border: '1px solid #e8e4df', background: '#faf9f7',
              color: '#6b6672', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              maxWidth: 120, overflow: 'hidden',
            }}
          >
            {saved ? (
              <span style={{ color: '#01a866' }}>✓ salvo</span>
            ) : (
              <>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.department ?? 'sem dept.'}
                </span>
                <span style={{ color: '#c4bfba', fontSize: 10, flexShrink: 0 }}>✏</span>
              </>
            )}
          </button>
        )}
        {error && <p style={{ fontSize: 10, color: '#ff2f69', margin: '2px 0 0' }}>{error}</p>}
      </div>

      {/* Pontos */}
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 40 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#1a1625' }}>{user.totalPoints}</p>
        <p style={{ margin: 0, fontSize: 9, color: '#aaa8b0' }}>pts</p>
      </div>

      {/* Ativar/desativar */}
      <button
        onClick={toggleActive}
        disabled={isPending}
        style={{
          flexShrink: 0, fontSize: 11, padding: '5px 10px', borderRadius: 8,
          border: `1px solid ${user.isActive ? '#e8e4df' : 'rgba(1,168,102,0.2)'}`,
          background: user.isActive ? '#faf9f7' : 'rgba(1,168,102,0.08)',
          color: user.isActive ? '#8a8490' : '#01a866',
          cursor: 'pointer', fontWeight: 600,
        }}
      >
        {user.isActive ? 'Ativo' : 'Inativo'}
      </button>
    </div>
  )
}
