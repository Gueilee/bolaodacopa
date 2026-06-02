'use client'

import { useState, useTransition } from 'react'
import { sendInvite } from '@/app/actions/invite'

export function SingleInviteButton({ userId, name }: { userId: string; name: string }) {
  const [isPending, start] = useTransition()
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')

  function handleClick() {
    start(async () => {
      const r = await sendInvite(userId)
      setStatus(r.success ? 'sent' : 'error')
      if (r.success) setTimeout(() => setStatus('idle'), 4000)
    })
  }

  if (status === 'sent') {
    return <span className="text-[11px] font-semibold" style={{ color: '#01a866' }}>✓ Enviado!</span>
  }
  if (status === 'error') {
    return <span className="text-[11px] font-semibold" style={{ color: '#ff2f69' }}>✗ Erro</span>
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-[11px] font-semibold rounded-lg px-3 py-1.5 shrink-0 transition-colors"
      style={{ background: '#f0ede8', color: '#422c76', border: 'none', cursor: isPending ? 'wait' : 'pointer' }}
    >
      {isPending ? '…' : 'Convidar'}
    </button>
  )
}
