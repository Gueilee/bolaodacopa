'use client'

import { useState } from 'react'
import type { AccessedUser } from '@/lib/hr-analytics'

function fmtDate(d: Date) {
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

function fmtDateShort(d: Date) {
  return new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

const AVATAR_COLORS = [
  '#422c76', '#01a866', '#1e40af', '#b45309', '#065f46',
  '#1d4ed8', '#7c3aed', '#0891b2', '#166534', '#9a3412',
]

function getColor(name: string) {
  let hash = 0
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

type Props = {
  accessed:      AccessedUser[]
  totalEligible: number
}

export function HrAccessedUsers({ accessed, totalEligible }: Props) {
  const [query, setQuery] = useState('')

  const pending = totalEligible - accessed.length
  const pct     = totalEligible > 0 ? Math.round((accessed.length / totalEligible) * 100) : 0

  const filtered = query.trim()
    ? accessed.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        (u.department ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : accessed

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Resumo visual */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Cadastrados',   value: accessed.length, color: '#01a866', bg: 'rgba(1,168,102,0.08)',  border: 'rgba(1,168,102,0.2)'  },
          { label: 'Aguardando',    value: pending,          color: '#d97706', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.2)'  },
          { label: 'Adesão',        value: `${pct}%`,        color: '#422c76', bg: 'rgba(66,44,118,0.08)', border: 'rgba(66,44,118,0.2)'  },
          { label: 'Total elegível',value: totalEligible,    color: '#6b6672', bg: '#f5f2ef',              border: '#e8e4df'               },
        ].map(k => (
          <div key={k.label} style={{
            flex: 1, minWidth: 100, padding: '12px 16px', borderRadius: 12,
            background: k.bg, border: `1px solid ${k.border}`,
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1 }}>
              {k.value}
            </span>
            <span style={{ fontSize: 11, color: '#8a8490', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {k.label}
            </span>
          </div>
        ))}
      </div>

      {/* Barra de progresso */}
      <div>
        <div style={{ height: 8, borderRadius: 8, background: '#f0ede8', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 8,
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #422c76, #01E18E)',
            transition: 'width 0.4s ease',
          }} />
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#aaa8b0' }}>
          {accessed.length} de {totalEligible} colaboradores acessaram · {pending} ainda aguardando
        </p>
      </div>

      {/* Campo de busca */}
      {accessed.length > 0 && (
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
            fontSize: 15, color: '#c4bfba', pointerEvents: 'none',
          }}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nome, e-mail ou departamento…"
            style={{
              width: '100%', height: 40, borderRadius: 10,
              border: '1.5px solid #e0dbd5', background: '#fff', color: '#1a1625',
              paddingLeft: 38, paddingRight: query ? 36 : 14,
              fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e  => { e.target.style.borderColor = '#422c76' }}
            onBlur={e   => { e.target.style.borderColor = '#e0dbd5' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#aaa8b0',
            }}>×</button>
          )}
        </div>
      )}

      {query && (
        <p style={{ fontSize: 12, color: '#8a8490', margin: 0 }}>
          {filtered.length === 0 ? 'Nenhum resultado.' : `${filtered.length} de ${accessed.length}`}
        </p>
      )}

      {/* Lista */}
      {accessed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 0' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>⏳</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1625', margin: '0 0 4px' }}>
            Nenhum acesso ainda
          </p>
          <p style={{ fontSize: 12, color: '#8a8490', margin: 0 }}>
            Os colaboradores aparecerão aqui assim que criarem a senha.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Cabeçalho */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 160px 140px',
            padding: '8px 12px', borderRadius: '8px 8px 0 0',
            background: '#f5f2ef',
          }}>
            {['Colaborador', 'Departamento', 'Acesso em'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Linhas */}
          <div style={{ border: '1px solid #f0ede8', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
            {filtered.map((u, i) => {
              const color = getColor(u.name)
              return (
                <div key={u.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 160px 140px',
                  alignItems: 'center', padding: '10px 12px',
                  background: i % 2 === 0 ? '#fff' : '#faf9f7',
                  borderBottom: i < filtered.length - 1 ? '1px solid #f5f2ef' : 'none',
                }}>
                  {/* Nome */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                      background: color, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff',
                    }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a1625',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.name}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: '#aaa8b0',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Departamento */}
                  <span style={{ fontSize: 12, color: '#6b6672', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.department ?? '—'}
                  </span>

                  {/* Data */}
                  <div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: '#01a866',
                      background: 'rgba(1,168,102,0.08)', padding: '3px 8px',
                      borderRadius: 20, border: '1px solid rgba(1,168,102,0.18)',
                      whiteSpace: 'nowrap',
                    }}>
                      ✓ {fmtDate(u.firstAccessAt)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
