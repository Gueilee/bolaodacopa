'use client'

import { useState, useTransition } from 'react'
import { sendBulkInvites } from '@/app/actions/invite'

export function BulkInviteButton({ pendingCount }: { pendingCount: number }) {
  const [isPending, start] = useTransition()
  const [result, setResult] = useState<{ sent: number; failed: number; skipped: number; errors: string[] } | null>(null)
  const [confirm, setConfirm] = useState(false)

  function handleClick() {
    if (!confirm) { setConfirm(true); return }
    setConfirm(false)
    start(async () => {
      const r = await sendBulkInvites()
      setResult(r)
    })
  }

  if (result) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl p-4 border" style={{ background: '#f0fdf8', borderColor: '#a7f3d0' }}>
          <p className="font-bold text-sm mb-2" style={{ color: '#065f46' }}>Resultado do envio</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-xl font-black" style={{ color: '#01E18E' }}>{result.sent}</p><p className="text-xs" style={{ color: '#8a8490' }}>Enviados</p></div>
            <div><p className="text-xl font-black" style={{ color: '#f5a623' }}>{result.skipped}</p><p className="text-xs" style={{ color: '#8a8490' }}>Já enviados recente</p></div>
            <div><p className="text-xl font-black" style={{ color: '#ff2f69' }}>{result.failed}</p><p className="text-xs" style={{ color: '#8a8490' }}>Falhas</p></div>
          </div>
          {result.errors.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs cursor-pointer" style={{ color: '#ff2f69' }}>Ver erros ({result.errors.length})</summary>
              <ul className="mt-2 space-y-1">
                {result.errors.map((e, i) => <li key={i} className="text-xs" style={{ color: '#8a8490' }}>{e}</li>)}
              </ul>
            </details>
          )}
        </div>
        <button onClick={() => setResult(null)} className="text-xs" style={{ color: '#8a8490' }}>
          ← Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {confirm && (
        <div className="rounded-xl p-4 border" style={{ background: '#fff0f3', borderColor: '#ffd0da' }}>
          <p className="text-sm font-semibold" style={{ color: '#ff2f69' }}>
            Confirma o envio de {pendingCount} e-mails?
          </p>
          <p className="text-xs mt-1" style={{ color: '#8a8490' }}>
            Esta ação não pode ser desfeita. Cada colaborador receberá um e-mail com link único.
          </p>
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleClick}
          disabled={isPending}
          className="flex-1 rounded-xl font-bold text-sm py-3 transition-colors"
          style={{
            background: confirm ? '#ff2f69' : '#422c76',
            color: '#fff',
            border: 'none',
            cursor: isPending ? 'wait' : 'pointer',
          }}
        >
          {isPending
            ? '📤 Enviando… (aguarde)'
            : confirm
            ? `✉️ Confirmar — enviar ${pendingCount} e-mails`
            : `✉️ Enviar convites para ${pendingCount} colaboradores`}
        </button>
        {confirm && (
          <button
            onClick={() => setConfirm(false)}
            className="rounded-xl px-4 text-sm font-medium"
            style={{ background: '#f0ede8', color: '#6b6672', border: 'none', cursor: 'pointer' }}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  )
}
