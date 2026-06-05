'use client'

import { useState } from 'react'

type User = {
  id:            string
  name:          string
  email:         string
  department:    string | null
  firstAccessAt: Date | null
}

function fmtDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

export function AccessedList({ users }: { users: User[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? users.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        (u.department ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : users

  if (users.length === 0) {
    return (
      <div className="card p-8" style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>⏳</span>
        <p style={{ fontWeight: 600, fontSize: 14, color: '#1a1625', margin: '0 0 4px' }}>
          Nenhum colaborador cadastrado ainda
        </p>
        <p style={{ fontSize: 12, color: '#8a8490', margin: 0 }}>
          Os colaboradores aparecerão aqui após acessarem o link de convite.
        </p>
      </div>
    )
  }

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
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 16, color: '#aaa8b0', lineHeight: 1,
            }}
          >×</button>
        )}
      </div>

      {query && (
        <p style={{ fontSize: 12, color: '#8a8490', margin: 0 }}>
          {filtered.length === 0
            ? 'Nenhum colaborador encontrado.'
            : `${filtered.length} de ${users.length} colaboradores`}
        </p>
      )}

      {/* Lista */}
      <div className="card overflow-hidden" style={{ padding: 0 }}>
        {/* Cabeçalho */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 160px 160px',
          padding: '10px 20px', borderBottom: '1px solid #f0ede8',
          background: '#faf9f7',
        }}>
          {['Colaborador', 'Departamento', 'Data de acesso'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#aaa8b0', fontSize: 13 }}>
            Nenhum resultado para &quot;{query}&quot;
          </div>
        ) : (
          filtered.map((u, i) => (
            <div key={u.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 160px 160px',
              alignItems: 'center', padding: '12px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid #f5f2ef' : 'none',
              background: i % 2 === 1 ? '#faf9f7' : '#fff',
            }}>
              {/* Nome + email */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #01a866, #01E18E)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fff',
                  }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a1625',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.name}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: '#8a8490',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Departamento */}
              <span style={{ fontSize: 12, color: '#6b6672',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {u.department ?? '—'}
              </span>

              {/* Data de acesso */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#01a866',
                  background: 'rgba(1,168,102,0.08)', padding: '3px 8px',
                  borderRadius: 20, border: '1px solid rgba(1,168,102,0.2)',
                  whiteSpace: 'nowrap',
                }}>
                  ✓ {fmtDate(u.firstAccessAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
