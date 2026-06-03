'use client'

import { useState } from 'react'
import { SingleInviteButton } from './single-invite-button'

type User = {
  id:         string
  name:       string
  email:      string
  department: string | null
  manager:    string | null
}

export function PendingList({ users }: { users: User[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? users.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        (u.department ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : users

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Busca */}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 16, color: '#c4bfba', pointerEvents: 'none',
        }}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nome, e-mail ou departamento…"
          className="input-field"
          style={{ paddingLeft: 42, fontSize: 13 }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
              color: '#aaa8b0', lineHeight: 1,
            }}
          >×</button>
        )}
      </div>

      {/* Resultado da busca */}
      {query && (
        <p style={{ fontSize: 12, color: '#8a8490', margin: 0 }}>
          {filtered.length === 0
            ? 'Nenhum colaborador encontrado.'
            : `${filtered.length} de ${users.length} colaboradores`}
        </p>
      )}

      {/* Lista */}
      {filtered.length > 0 && (
        <div className="card overflow-hidden" style={{ borderColor: '#f0ede8' }}>
          {filtered.map((u, i) => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '13px 20px', gap: 12,
              borderBottom: i < filtered.length - 1 ? '1px solid #f5f2ef' : 'none',
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a1625',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8a8490',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.email}
                  {u.department ? ` · ${u.department}` : ''}
                </p>
              </div>
              <SingleInviteButton userId={u.id} name={u.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
