'use client'

import { useState, useTransition } from 'react'
import { lockPredictions } from '@/app/actions/lock'

type Props = {
  filled:      number
  total:       number
  lockedAt?:   Date | null
  isLocked:    boolean
}

export function LockPredictionsButton({ filled, total, isLocked, lockedAt }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending,   startTransition] = useTransition()
  const [error,       setError]        = useState<string | null>(null)
  const [success,     setSuccess]      = useState(false)

  if (isLocked) {
    return (
      <div className="card p-5 border-brand-neon/20 bg-brand-neon/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-neon/20 flex items-center justify-center text-brand-neon text-lg">
            🔒
          </div>
          <div>
            <p className="text-brand-neon font-semibold">Palpites finalizados</p>
            <p className="text-sm" style={{ color: '#6b6672' }}>
              Seus palpites foram registrados e estão bloqueados para toda a Copa.
              {lockedAt && (
                <> · Finalizado em {new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  timeZone: 'America/Sao_Paulo',
                }).format(lockedAt)}</>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  function handleLock() {
    setError(null)
    startTransition(async () => {
      const result = await lockPredictions()
      if (result.success) {
        setSuccess(true)
        setShowConfirm(false)
      } else {
        setError(result.error ?? 'Erro ao finalizar.')
        setShowConfirm(false)
      }
    })
  }

  if (success) {
    return (
      <div className="card p-5 border-brand-neon/20 bg-brand-neon/5 animate-fade-in">
        <p className="text-brand-neon font-semibold">✓ Palpites finalizados com sucesso!</p>
        <p className="text-sm mt-1" style={{ color: '#6b6672' }}>
          Seus {filled} palpites estão bloqueados. Boa sorte na Copa!
        </p>
      </div>
    )
  }

  const unfilled = total - filled
  const percent  = total > 0 ? Math.round((filled / total) * 100) : 0

  return (
    <>
      <div className="card p-5 border-brand-pink/20 bg-brand-pink/5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-semibold mb-1" style={{ color: '#1a1625' }}>
              Finalize seus palpites antes dos 30 minutos de cada jogo começar
            </p>
            <p className="text-sm" style={{ color: '#6b6672' }}>
              {filled}/{total} jogos preenchidos ({percent}%)
              {unfilled > 0 && (
                <span className="text-brand-pink"> · {unfilled} sem palpite</span>
              )}
            </p>
            <p className="text-xs mt-2" style={{ color: '#8a8490' }}>
              ⚠ Após salvar, nenhum palpite poderá ser alterado.
            </p>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={isPending || filled === 0}
            className="btn-primary shrink-0 whitespace-nowrap"
          >
            Finalizar Palpites
          </button>
        </div>

        {error && (
          <p className="text-brand-pink text-sm mt-3">{error}</p>
        )}
      </div>

      {/* ── Confirmation modal ── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="card w-full max-w-md mx-4 p-7 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔒</div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#1a1625' }}>
                Confirmar Registro
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#6b6672' }}>
                Você está prestes a finalizar <strong style={{ color: '#1a1625' }}>{filled}</strong> palpites.
                {unfilled > 0 && (
                  <> Os <strong className="text-brand-pink">{unfilled} jogos restantes</strong> ficarão sem palpite.</>
                )}
              </p>
              <p className="text-brand-pink text-sm font-medium mt-3">
                Esta ação é irreversível — não será possível editar nenhum palpite após confirmar.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="btn-ghost flex-1"
              >
                Voltar e Editar
              </button>
              <button
                onClick={handleLock}
                disabled={isPending}
                className="btn-primary flex-1"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Finalizando...
                  </span>
                ) : (
                  'Sim, Finalizar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
