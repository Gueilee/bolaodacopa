'use client'

import { useState, useTransition } from 'react'
import { useRouter }               from 'next/navigation'
import { loginAction }             from '@/app/actions/auth'
import Image                       from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error,     setError]        = useState<string | null>(null)
  const [showPass,  setShowPass]     = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const fd       = new FormData(e.currentTarget)
    const email    = fd.get('email')    as string
    const password = fd.get('password') as string

    startTransition(async () => {
      const result = await loginAction(email, password)
      if (result?.error) setError(result.error)
      else               router.push('/dashboard')
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">

      {/* ── Fundo: imagem da Copa ─────────────────────────────────────── */}
      <Image
        src="/login.png"
        alt="Bolão Vendemmia Copa 2026"
        fill
        priority
        quality={95}
        className="object-cover object-center"
      />

      {/* ── Overlay em camadas para profundidade ──────────────────────── */}
      {/* Camada 1: escurece levemente tudo */}
      <div className="absolute inset-0 bg-black/50" />
      {/* Camada 2: vinheta nas bordas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 30%, rgba(0,0,0,0.65) 100%)',
        }}
      />
      {/* Camada 3: gradiente vertical — escurece o rodapé */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(15,13,23,0.55) 60%, rgba(15,13,23,0.92) 100%)',
        }}
      />

      {/* ── Card de login ─────────────────────────────────────────────── */}
      <div
        className="relative z-10 w-full max-w-[420px] mx-4 animate-slide-up"
        style={{ animationDuration: '0.5s' }}
      >
        {/* Borda superior gradiente (decorativa) */}
        <div
          className="h-px w-full rounded-t-3xl"
          style={{ background: 'linear-gradient(90deg, #422c76, #01E18E, #ff2f69, #422c76)' }}
        />

        {/* Corpo do card — glassmorphism */}
        <div
          className="rounded-b-3xl border border-t-0 border-white/12 px-8 py-9"
          style={{
            backdropFilter: 'blur(28px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
            background: 'rgba(10, 8, 20, 0.72)',
            boxShadow:
              '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
          }}
        >
          {/* ── Identidade no topo do card ── */}
          <div className="flex flex-col items-center gap-3 mb-8">
            {/* Logo Vendemmia — "W" estilizado */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #422c76 0%, #2a1a4e 100%)',
                boxShadow: '0 0 24px rgba(66,44,118,0.6)',
              }}
            >
              <svg viewBox="0 0 32 24" className="w-8 h-6" fill="none">
                <path
                  d="M2 4 L8 20 L14 10 L16 14 L18 10 L24 20 L30 4"
                  stroke="#01E18E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-white font-bold text-lg leading-tight tracking-wide">
                Bolão Vendemmia
              </p>
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em] mt-0.5"
                style={{ color: '#01E18E' }}
              >
                Copa do Mundo 2026
              </p>
            </div>
          </div>

          {/* ── Divisor ── */}
          <div className="h-px bg-white/8 mb-8" />

          {/* ── Formulário ── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* E-mail */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                E-mail
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isPending}
                  placeholder="nome@vendemmia.com.br"
                  className="w-full rounded-xl px-4 py-3.5 pr-10 text-sm transition-all duration-200 outline-none disabled:opacity-50"
                  style={{
                    background:   'rgba(255,255,255,0.06)',
                    border:       '1px solid rgba(255,255,255,0.12)',
                    color:        '#faf9f5',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid #422c76'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66,44,118,0.25)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 text-base pointer-events-none">
                  ✉
                </span>
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isPending}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3.5 pr-12 text-sm transition-all duration-200 outline-none disabled:opacity-50"
                  style={{
                    background:   'rgba(255,255,255,0.06)',
                    border:       '1px solid rgba(255,255,255,0.12)',
                    color:        '#faf9f5',
                    letterSpacing: showPass ? 'normal' : '0.15em',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '1px solid #422c76'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66,44,118,0.25)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors text-sm"
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div
                className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm animate-fade-in"
                style={{
                  background: 'rgba(255,47,105,0.12)',
                  border:     '1px solid rgba(255,47,105,0.35)',
                  color:      '#ff2f69',
                }}
              >
                <span className="text-base shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mt-2"
              style={{
                background:  isPending
                  ? 'rgba(66,44,118,0.6)'
                  : 'linear-gradient(135deg, #422c76 0%, #5a3e94 100%)',
                color:       '#faf9f5',
                boxShadow:   isPending ? 'none' : '0 4px 20px rgba(66,44,118,0.5)',
              }}
              onMouseEnter={(e) => {
                if (!isPending) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #5a3e94 0%, #6d4daa 100%)'
                  e.currentTarget.style.boxShadow  = '0 6px 28px rgba(66,44,118,0.7)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isPending) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #422c76 0%, #5a3e94 100%)'
                  e.currentTarget.style.boxShadow  = '0 4px 20px rgba(66,44,118,0.5)'
                }
              }}
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <span style={{ color: '#01E18E' }}>→</span>
                </>
              )}
            </button>

            {/* Esqueci minha senha */}
            <div className="text-center pt-1">
              <a
                href="/forgot-password"
                className="text-xs transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#01E18E' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
              >
                Esqueci minha senha
              </a>
            </div>
          </form>
        </div>

        {/* ── Rodapé abaixo do card ── */}
        <p
          className="text-center text-[11px] mt-5"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          Acesso exclusivo · Vendemmia Comércio Internacional
        </p>
      </div>

      {/* ── Badge "BOLÃO DA COPA" no rodapé (desktop) ── */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-3 z-10"
      >
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border:     '1px solid rgba(255,255,255,0.1)',
            color:      'rgba(255,255,255,0.35)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span style={{ color: '#01E18E' }}>⚽</span>
          <span>104 partidas · 48 seleções · 39 dias de Copa</span>
        </div>
      </div>
    </div>
  )
}
