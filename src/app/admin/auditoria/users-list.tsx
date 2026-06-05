'use client'

import { useState } from 'react'
import type { AuditUser } from '@/lib/queries'

type Props = { users: AuditUser[] }

export function AuditUsersList({ users }: Props) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? users.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        (u.department ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : users

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Busca */}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 15, color: '#c4bfba', pointerEvents: 'none',
        }}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar colaborador por nome ou departamento…"
          style={{
            width: '100%', height: 42, borderRadius: 10,
            border: '1.5px solid #e0dbd5', background: '#fff', color: '#1a1625',
            paddingLeft: 42, paddingRight: query ? 38 : 14,
            fontSize: 13, outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e  => { e.target.style.borderColor = '#422c76' }}
          onBlur={e   => { e.target.style.borderColor = '#e0dbd5' }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 18, color: '#aaa8b0', lineHeight: 1,
            }}
          >×</button>
        )}
      </div>

      {/* Contagem */}
      {query && (
        <p style={{ fontSize: 12, color: '#8a8490', margin: 0 }}>
          {filtered.length === 0
            ? 'Nenhum colaborador encontrado.'
            : `${filtered.length} de ${users.length} colaboradores`}
        </p>
      )}

      {/* Tabela */}
      <div className="card overflow-hidden" style={{ padding: 0 }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0ede8', display: 'grid', gridTemplateColumns: '2fr 70px 60px 60px 60px 70px', gap: 8, background: '#faf9f7' }}>
          {['Colaborador', 'Pontos', 'Exatos', 'Vencedor', 'Erro', ''].map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#aaa8b0', fontSize: 13 }}>
            Nenhum resultado para &ldquo;{query}&rdquo;
          </div>
        ) : (
          filtered.map((u, idx) => (
            <div key={u.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 70px 60px 60px 60px 70px',
              gap: 8, padding: '11px 16px',
              borderBottom: idx < filtered.length - 1 ? '1px solid #f0ede8' : 'none',
              alignItems: 'center',
              background: idx % 2 === 0 ? '#fff' : '#faf9f7',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa8b0', minWidth: 24, textAlign: 'right' }}>
                  #{idx + 1}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1625' }}>{u.name}</div>
                  {u.department && (
                    <div style={{ fontSize: 11, color: '#aaa8b0' }}>{u.department}</div>
                  )}
                </div>
              </div>
              <span style={{ fontWeight: 900, fontSize: 16, color: '#422c76', fontVariantNumeric: 'tabular-nums' }}>
                {u.totalPoints}
              </span>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#065f46' }}>{u.exactCount}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1e40af' }}>{u.winnerCount}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#991b1b' }}>{u.missCount}</span>
              <a
                href={`/admin/auditoria?userId=${u.id}`}
                style={{
                  display: 'inline-block', padding: '5px 12px', borderRadius: 20,
                  fontSize: 11, fontWeight: 700, background: '#f0ede8', color: '#422c76',
                  textDecoration: 'none', textAlign: 'center',
                }}
              >
                Ver →
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
