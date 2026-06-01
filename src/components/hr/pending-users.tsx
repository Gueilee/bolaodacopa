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
        <p className="text-white/30 text-sm">Todos os colaboradores finalizaram seus palpites.</p>
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
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={copyEmails}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
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
        <p className="text-white/25 text-sm text-center py-6">Nenhum resultado para este filtro.</p>
      ) : (
        <div className="divide-y divide-white/5 rounded-2xl border border-white/8 overflow-hidden">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors"
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
                <p className="text-sm font-medium text-brand-cream truncate">{user.name}</p>
                <p className="text-xs text-white/35 truncate">{user.email}</p>
              </div>

              {/* Departamento */}
              {user.department && (
                <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-md shrink-0 hidden sm:inline">
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
                  <span className="text-[11px] text-white/25">sem palpites</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dica de lembrete */}
      <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-xl px-4 py-3">
        <p className="text-white/50 text-xs leading-relaxed">
          <strong className="text-white/70">Dica:</strong> Copie os e-mails acima e envie um lembrete via e-mail corporativo ou WhatsApp.
          A mensagem sugerida: <em className="text-white/60">"Faltam X dias para a Copa! Acesse o bolão e finalize seus palpites antes da abertura em 11/Jun."</em>
        </p>
      </div>
    </div>
  )
}
