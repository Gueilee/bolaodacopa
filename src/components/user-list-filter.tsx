'use client'

import { useState, useMemo } from 'react'
import { UserAdminRow } from '@/components/user-admin-row'

type User = {
  id:                 string
  name:               string
  email:              string
  role:               'admin' | 'rh' | 'user'
  department:         string | null
  manager:            string | null
  isActive:           boolean
  totalPoints:        number
  isPredictionLocked: boolean
}

type Props = {
  users:       User[]
  departments: string[]
}

export function UserListFilter({ users, departments }: Props) {
  const [search, setSearch]   = useState('')
  const [dept,   setDept]     = useState('')
  const [role,   setRole]     = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(u => {
      const matchSearch = !q
        || u.name.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q)
        || (u.department ?? '').toLowerCase().includes(q)
        || (u.manager ?? '').toLowerCase().includes(q)
      const matchDept = !dept || u.department === dept
      const matchRole = !role || u.role === role
      return matchSearch && matchDept && matchRole
    })
  }, [users, search, dept, role])

  const hasFilter = search || dept || role

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Barra de filtros */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Busca */}
        <div style={{ flex: '1 1 220px', position: 'relative', minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#aaa8b0', pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail, departamento ou gestor…"
            className="input-field"
            style={{ paddingLeft: 38, fontSize: 13 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#aaa8b0', fontSize: 18, lineHeight: 1,
            }}>×</button>
          )}
        </div>

        {/* Filtro departamento */}
        <select
          value={dept}
          onChange={e => setDept(e.target.value)}
          className="input-field"
          style={{ flex: '0 1 220px', minWidth: 160, fontSize: 13, cursor: 'pointer' }}
        >
          <option value="">Todos os departamentos</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Filtro perfil */}
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="input-field"
          style={{ flex: '0 1 160px', minWidth: 130, fontSize: 13, cursor: 'pointer' }}
        >
          <option value="">Todos os perfis</option>
          <option value="user">Colaborador</option>
          <option value="rh">RH</option>
          <option value="admin">Admin</option>
        </select>

        {/* Limpar filtros */}
        {hasFilter && (
          <button
            onClick={() => { setSearch(''); setDept(''); setRole('') }}
            style={{
              padding: '10px 14px', borderRadius: 12, border: '1px solid #e0dbd5',
              background: '#fff', color: '#8a8490', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}
          >
            ✕ Limpar
          </button>
        )}
      </div>

      {/* Contagem */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#8a8490' }}>
          {hasFilter
            ? `${filtered.length} de ${users.length} colaboradores`
            : `${users.length} colaboradores · ordem alfabética`}
        </p>
        {filtered.length === 0 && hasFilter && (
          <p style={{ margin: 0, fontSize: 12, color: '#ff2f69' }}>Nenhum resultado encontrado.</p>
        )}
      </div>

      {/* Lista */}
      {filtered.length > 0 && (
        <div className="card overflow-hidden" style={{ borderBottom: 'none' }}>
          {filtered.map(u => (
            <UserAdminRow
              key={u.id}
              user={u}
              existingDepartments={departments}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && hasFilter && (
        <div className="card p-10" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>🔍</p>
          <p style={{ fontSize: 14, color: '#8a8490', margin: 0 }}>
            Nenhum colaborador encontrado para os filtros selecionados.
          </p>
        </div>
      )}
    </div>
  )
}
