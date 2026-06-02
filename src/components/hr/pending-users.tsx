'use client'

import { useState } from 'react'
import type { PendingUser } from '@/lib/hr-analytics'

type Props = { users: PendingUser[] }

export function HrPendingUsers({ users }: Props) {
  const [copied, setCopied] = useState(false)
  const [filter, setFilter] = useState<'all' | 'none' | 'partial'>('all')

  const filtered = users.filter((u) => {
    if (filter === 'none')    return !u.hasSomeBet
    if (filter === 'partial') return u.hasSomeBet
    return true
  })

  const allEmails = filtered.map((u) => u.email).join(', ')

  function copyEmails() {
    navigator.clipboard.writeText(allEmails).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <span className="text-3xl">🎉</span>
        <p className="text-brand-neon font-semibold">100% de participação!</p>
        <p className="text-sm" style={{color:'#8a8490'}}>Todos os colaboradores finalizaram seus palpites.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros + ação */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          {[
            { key: 'all',     label: `Todos (${users.length})`                         },
            { key: 'none',    label: `Sem palpites (${users.filter((u) => !u.hasSomeBet).length})`    },
            { key: 'partial', label: `Iniciaram (${users.filter((u) => u.hasSomeBet).length})`  },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === f.key
                  ? 'bg-brand-purple text-white'
                  : ''
              }`}
              style={filter !== f.key ? {background:'#f5f2ef', color:'#8a8490'} : undefined}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={copyEmails}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
          style={{background:'#f5f2ef', border:'1px solid #e8e4df', color:'#8a8490'}}
        >
          {copied ? (
            <><span className="text-brand-neon">✓</span> Copiado!</>
          ) : (
            <><span>📋</span> Copiar {filtered.length} e-mail{filtered.length !== 1 ? 's' : ''}</>
          )}
        </button>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p className="text-sm text-center py-6" style={{color:'#8a8490'}}>Nenhum resultado para este filtro.</p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{border:'1px solid #e8e4df'}}>
          {filtered.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors"
              style={{borderBottom:'1px solid #e8e4df'}}
            >
              {/* Status dot */}
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  user.hasSomeBet ? 'bg-yellow-400' : 'bg-brand-pink'
                }`}
                title={user.hasSomeBet ? 'Palpites iniciados mas não finalizados' : 'Sem nenhum palpite'}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{color:'#1a1625'}}>{user.name}</p>
                <p className="text-xs truncate" style={{color:'#8a8490'}}>{user.email}</p>
              </div>

              {/* Departamento */}
              {user.department && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-md shrink-0 hidden sm:inline"
                  style={{color:'#8a8490', background:'#f5f2ef'}}
                >
                  {user.department}
                </span>
              )}

              {/* Status */}
              <div className="shrink-0 text-right">
                {user.hasSomeBet ? (
                  <span className="text-[11px] text-yellow-400">
                    {user.betCount} palpites
                  </span>
                ) : (
                  <span className="text-[11px]" style={{color:'#8a8490'}}>sem palpites</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dica de lembrete */}
      <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-xl px-4 py-3">
        <p className="text-xs leading-relaxed" style={{color:'#8a8490'}}>
          <strong style={{color:'#1a1625'}}>Dica:</strong> Copie os e-mails acima e envie um lembrete via e-mail corporativo ou WhatsApp.
          A mensagem sugerida: <em style={{color:'#8a8490'}}>"Faltam X dias para a Copa! Acesse o bolão e finalize seus palpites antes da abertura em 11/Jun."</em>
        </p>
      </div>
    </div>
  )
}
