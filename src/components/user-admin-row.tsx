'use client'

import { useState, useTransition } from 'react'
import { updateUserDepartment, toggleUserActive } from '@/app/actions/users'
import { initials } from '@/lib/utils'

type User = {
  id:                 string
  name:               string
  email:              string
  role:               'admin' | 'rh' | 'user'
  department:         string | null
  isActive:           boolean
  totalPoints:        number
  isPredictionLocked: boolean
}

type Props = { user: User; existingDepartments: string[] }

export function UserAdminRow({ user, existingDepartments }: Props) {
  const [dept,       setDept]       = useState(user.department ?? '')
  const [editingDept,setEditingDept]= useState(false)
  const [isPending,  startTransition] = useTransition()
  const [saved,      setSaved]      = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  function saveDept() {
    startTransition(async () => {
      const result = await updateUserDepartment(user.id, dept || null)
      if (result.success) { setSaved(true); setTimeout(() => setSaved(false), 2000); setEditingDept(false) }
      else setError(result.error ?? 'Erro')
    })
  }

  function toggleActive() {
    startTransition(async () => {
      await toggleUserActive(user.id, !user.isActive)
    })
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${!user.isActive ? 'opacity-40' : ''}`}
      style={{borderBottom:'1px solid #e8e4df'}}
    >

      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
        ${user.role === 'admin' ? 'bg-brand-pink/20 border border-brand-pink/30 text-brand-pink' : 'bg-brand-purple/30 border border-brand-purple/40'}`}
        style={user.role !== 'admin' ? {color:'#1a1625'} : undefined}>
        {initials(user.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate" style={{color:'#1a1625'}}>{user.name}</p>
          {user.role === 'admin' && (
            <span className="text-[9px] text-brand-pink bg-brand-pink/10 border border-brand-pink/20 rounded px-1.5 py-0.5 font-semibold shrink-0">
              ADMIN
            </span>
          )}
          {user.isPredictionLocked && (
            <span className="text-[9px] text-brand-neon bg-brand-neon/10 border border-brand-neon/20 rounded px-1.5 py-0.5 shrink-0">
              🔒
            </span>
          )}
        </div>
        <p className="text-xs truncate" style={{color:'#8a8490'}}>{user.email}</p>
      </div>

      {/* Departamento (editável) */}
      <div className="shrink-0 hidden sm:block">
        {editingDept ? (
          <div className="flex items-center gap-2">
            <input
              list={`dept-list-${user.id}`}
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              placeholder="Departamento"
              className="text-xs rounded-lg px-2 py-1.5 w-32 focus:outline-none focus:border-brand-purple"
              style={{background:'#f5f2ef', border:'1px solid #e8e4df', color:'#1a1625'}}
              onKeyDown={(e) => e.key === 'Enter' && saveDept()}
            />
            <datalist id={`dept-list-${user.id}`}>
              {existingDepartments.map((d) => <option key={d} value={d} />)}
            </datalist>
            <button
              onClick={saveDept}
              disabled={isPending}
              className="text-[11px] text-brand-neon hover:text-brand-neon/80 transition-colors"
            >
              {isPending ? '...' : '✓'}
            </button>
            <button
              onClick={() => { setEditingDept(false); setDept(user.department ?? '') }}
              className="text-[11px] transition-colors"
              style={{color:'#8a8490'}}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingDept(true)}
            className="text-xs rounded-lg px-3 py-1.5 transition-all group flex items-center gap-1.5"
            style={{color:'#8a8490', border:'1px solid #e8e4df'}}
          >
            {saved ? (
              <span className="text-brand-neon">✓ salvo</span>
            ) : (
              <>
                <span className="truncate max-w-[100px]">{user.department ?? 'sem dept.'}</span>
                <span className="transition-colors text-[10px]" style={{color:'#8a8490'}}>✏</span>
              </>
            )}
          </button>
        )}
        {error && <p className="text-brand-pink text-[10px] mt-1">{error}</p>}
      </div>

      {/* Pontos */}
      <div className="text-right shrink-0 w-16 hidden md:block">
        <p className="text-sm font-bold tabular-nums" style={{color:'#8a8490'}}>{user.totalPoints}</p>
        <p className="text-[10px]" style={{color:'#8a8490'}}>pts</p>
      </div>

      {/* Ativar/desativar */}
      <button
        onClick={toggleActive}
        disabled={isPending}
        title={user.isActive ? 'Desativar' : 'Reativar'}
        className={`shrink-0 text-xs px-2 py-1 rounded-lg border transition-colors ${
          user.isActive
            ? 'hover:text-brand-pink hover:border-brand-pink/30'
            : 'text-brand-neon/60 border-brand-neon/20 hover:text-brand-neon'
        }`}
        style={user.isActive ? {color:'#8a8490', border:'1px solid #e8e4df'} : undefined}
      >
        {user.isActive ? 'Ativo' : 'Inativo'}
      </button>
    </div>
  )
}
