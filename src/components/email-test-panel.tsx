'use client'

import { useState, useTransition } from 'react'
import { sendTestResultEmailAction } from '@/app/actions/notifications'

export function EmailTestPanel() {
  const [to,       setTo]       = useState('')
  const [pending,  startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  function handleSend() {
    if (!to.trim()) return
    setFeedback(null)
    startTransition(async () => {
      const r = await sendTestResultEmailAction(to.trim())
      setFeedback({
        ok:  r.success,
        msg: r.success
          ? `✓ E-mail de teste enviado para ${to}`
          : `✗ Erro: ${r.error}`,
      })
    })
  }

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#1a1625' }}>
          📧 Notificações por E-mail
        </h2>
        <p className="text-xs mt-1" style={{ color: '#8a8490' }}>
          Automático após cada jogo pontuado · usa o mesmo SMTP dos convites · 340 usuários com notificação ativa
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Canal',       value: 'SMTP Azure'  },
          { label: 'Destinatários', value: '340 ativos' },
          { label: 'Gatilho',     value: 'Sync automático' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: '#f5f2ef' }}>
            <p className="text-sm font-bold" style={{ color: '#1a1625' }}>{s.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#8a8490' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Teste */}
      <div style={{
        background: 'rgba(66,44,118,0.04)', border: '1px solid rgba(66,44,118,0.12)',
        borderRadius: 12, padding: '14px 16px',
      }}>
        <p className="text-xs font-semibold mb-2" style={{ color: '#422c76' }}>
          Enviar e-mail de teste (dados fictícios — Brasil 3×1 Argentina)
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="email"
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="email@vendemmia.com.br"
            disabled={pending}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13,
              border: '1px solid #e8e4df', outline: 'none', color: '#1a1625',
            }}
          />
          <button
            onClick={handleSend}
            disabled={pending || !to.trim()}
            className="btn-primary text-sm px-4 py-2 shrink-0"
          >
            {pending ? 'Enviando...' : 'Enviar Teste'}
          </button>
        </div>
        {feedback && (
          <p className={`text-xs mt-2 ${feedback.ok ? 'text-brand-neon' : 'text-brand-pink'}`}>
            {feedback.msg}
          </p>
        )}
      </div>
    </div>
  )
}
