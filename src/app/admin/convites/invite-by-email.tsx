'use client'

import { useState, useTransition } from 'react'
import { sendInviteByEmail } from '@/app/actions/invite'

export function InviteByEmail() {
  const [email, setEmail]           = useState('')
  const [isPending, startTransition] = useTransition()
  const [result, setResult]         = useState<{ ok: boolean; msg: string } | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setResult(null)
    startTransition(async () => {
      const r = await sendInviteByEmail(email.trim())
      setResult({ ok: r.success, msg: r.success ? `Convite enviado para ${email}!` : (r.error ?? 'Erro ao enviar.') })
      if (r.success) setEmail('')
    })
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '20px 24px',
      border: '2px solid rgba(66,44,118,0.2)',
      boxShadow: '0 4px 20px rgba(66,44,118,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>🎯</span>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1a1625' }}>
            Enviar convite para qualquer e-mail
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#8a8490' }}>
            Funciona para qualquer conta cadastrada no sistema, independente do perfil
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setResult(null) }}
          placeholder="nome@vendemmia.com.br"
          required
          disabled={isPending}
          className="input-field"
          style={{ flex: 1, minWidth: 240, fontSize: 13 }}
        />
        <button
          type="submit"
          disabled={isPending || !email.trim()}
          style={{
            padding: '11px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: isPending || !email.trim()
              ? '#e8e4df'
              : 'linear-gradient(135deg, #422c76, #5a3e94)',
            color: isPending || !email.trim() ? '#aaa8b0' : '#fff',
            fontSize: 13, fontWeight: 700, flexShrink: 0,
            boxShadow: isPending || !email.trim() ? 'none' : '0 2px 10px rgba(66,44,118,0.35)',
            transition: 'all 0.15s',
          }}
        >
          {isPending ? 'Enviando…' : '✉️ Enviar convite'}
        </button>
      </form>

      {result && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: result.ok ? 'rgba(1,168,102,0.08)' : 'rgba(255,47,105,0.08)',
          color: result.ok ? '#01a866' : '#ff2f69',
          border: `1px solid ${result.ok ? 'rgba(1,168,102,0.2)' : 'rgba(255,47,105,0.2)'}`,
        }}>
          {result.ok ? '✓ ' : '✗ '}{result.msg}
        </div>
      )}
    </div>
  )
}
