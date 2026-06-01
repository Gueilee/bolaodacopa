'use client'

import { useState, useTransition } from 'react'
import { savePhoneAction } from '@/app/actions/notifications'

type Props = {
  currentPhone:  string
  currentOptIn:  boolean
}

export function WhatsAppOptInForm({ currentPhone, currentOptIn }: Props) {
  const [phone,   setPhone]   = useState(currentPhone)
  const [optIn,   setOptIn]   = useState(currentOptIn)
  const [isPending, startTransition] = useTransition()
  const [feedback,  setFeedback]     = useState<{ ok: boolean; msg: string } | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)

    startTransition(async () => {
      const result = await savePhoneAction(phone, optIn)
      setFeedback({
        ok:  result.success,
        msg: result.success
          ? optIn && phone
            ? '✓ WhatsApp ativado! Você receberá notificações.'
            : '✓ Preferências salvas.'
          : result.error ?? 'Erro ao salvar.',
      })
    })
  }

  const hasPhone = phone.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Notificações WhatsApp
        </h2>
        {currentOptIn && currentPhone && (
          <span className="text-[11px] text-brand-neon bg-brand-neon/10 border border-brand-neon/20 rounded-md px-2 py-0.5">
            ✓ Ativo
          </span>
        )}
      </div>

      {/* Número */}
      <div className="space-y-1.5">
        <label className="block text-sm text-white/60 font-medium">
          Número de WhatsApp
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(11) 9 9999-9999"
          disabled={isPending}
          className="input-field"
        />
        <p className="text-white/25 text-xs">
          Use o número com DDD. Apenas dígitos e os caracteres () -  são aceitos.
        </p>
      </div>

      {/* Opt-in toggle */}
      <div className="flex items-center justify-between p-4 bg-white/4 rounded-xl border border-white/8">
        <div>
          <p className="text-sm font-medium text-brand-cream">Ativar notificações</p>
          <p className="text-white/35 text-xs mt-0.5">
            Receba lembretes de palpites e resultados dos jogos
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOptIn(!optIn)}
          disabled={isPending || !hasPhone}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple
            ${optIn && hasPhone ? 'bg-brand-neon' : 'bg-white/15'}
            disabled:opacity-40
          `}
          aria-checked={optIn}
          role="switch"
        >
          <span
            className={`
              inline-block h-4 w-4 rounded-full bg-white shadow-sm
              transform transition-transform
              ${optIn && hasPhone ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* O que você vai receber */}
      {optIn && hasPhone && (
        <div className="bg-brand-neon/5 border border-brand-neon/15 rounded-xl p-4 space-y-2 animate-fade-in">
          <p className="text-brand-neon text-xs font-semibold uppercase tracking-wider mb-2">
            Você vai receber:
          </p>
          {[
            '📅 Lembrete diário quando não finalizar os palpites',
            '⚽ Resultado + pontuação após cada jogo que você apostou',
            '📊 Sua posição no ranking após cada atualização',
          ].map((item) => (
            <p key={item} className="text-white/50 text-xs">{item}</p>
          ))}
        </div>
      )}

      {/* Preview da mensagem */}
      <details className="group">
        <summary className="text-xs text-white/30 hover:text-white/60 cursor-pointer select-none transition-colors">
          Ver exemplo de mensagem ▾
        </summary>
        <div className="mt-3 bg-[#128c7e]/10 border border-[#128c7e]/20 rounded-xl p-4">
          <p className="text-[11px] text-white/50 mb-2 font-medium">Prévia — lembrete de palpites:</p>
          <pre className="text-xs text-white/60 whitespace-pre-wrap font-sans leading-relaxed">
{`⚽ *Bolão Copa 2026 | Vendemmia*

Olá! Faltam *3 dias* para a Copa começar.

Você registrou *85 de 104 palpites* (82%).

🔒 Finalize agora — após confirmar, nenhum palpite pode ser alterado:
https://bolao.vendemmia.com.br/dashboard/palpites

_Acesso exclusivo Vendemmia_`}
          </pre>
        </div>
      </details>

      {/* Feedback */}
      {feedback && (
        <p className={`text-sm ${feedback.ok ? 'text-brand-neon' : 'text-brand-pink'}`}>
          {feedback.msg}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full"
      >
        {isPending ? 'Salvando...' : 'Salvar Preferências'}
      </button>
    </form>
  )
}
