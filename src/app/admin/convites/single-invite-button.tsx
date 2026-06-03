'use client'

import { useState, useTransition } from 'react'
import { sendInvite } from '@/app/actions/invite'

export function SingleInviteButton({ userId, name }: { userId: string; name: string }) {
  const [isPending, start] = useTransition()
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleClick() {
    start(async () => {
      const r = await sendInvite(userId)
      if (r.success) {
        setStatus('sent')
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('error')
        setErrorMsg(r.error ?? 'Erro ao enviar.')
        setTimeout(() => setStatus('idle'), 4000)
      }
    })
  }

  if (status === 'sent') {
    return (
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20, flexShrink: 0,
        background: 'rgba(1,168,102,0.1)', color: '#01a866',
        border: '1px solid rgba(1,168,102,0.25)',
      }}>
        ✓ E-mail enviado!
      </span>
    )
  }

  if (status === 'error') {
    return (
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20, flexShrink: 0,
        background: 'rgba(255,47,105,0.08)', color: '#ff2f69',
        border: '1px solid rgba(255,47,105,0.2)',
        maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }} title={errorMsg}>
        ✗ {errorMsg}
      </span>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      style={{
        fontSize: 12, fontWeight: 700, padding: '7px 16px', borderRadius: 20,
        flexShrink: 0, border: 'none', cursor: isPending ? 'wait' : 'pointer',
        background: isPending ? '#f0ede8' : 'linear-gradient(135deg, #422c76, #5a3e94)',
        color: isPending ? '#aaa8b0' : '#fff',
        boxShadow: isPending ? 'none' : '0 2px 8px rgba(66,44,118,0.3)',
        transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', gap: 6,
      }}
    >
      {isPending ? (
        <>
          <svg style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.15)" strokeWidth="3"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#8a8490" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          Enviando…
        </>
      ) : '✉️ Convidar'}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  )
}
