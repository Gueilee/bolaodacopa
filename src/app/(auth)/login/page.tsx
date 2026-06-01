'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/app/actions/auth'
import Image from 'next/image'

// Copa 2026 — primeiro jogo: 11 Jun 2026 20:00 UTC
const CUP_DATE = new Date('2026-06-11T20:00:00Z')

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function calc() {
      const diff = CUP_DATE.getTime() - Date.now()
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  return timeLeft
}

function CountBlock({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        background: 'rgba(1,225,142,0.12)',
        border: '1px solid rgba(1,225,142,0.3)',
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 56,
        textAlign: 'center',
        fontWeight: 800,
        fontSize: 26,
        color: '#01E18E',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        boxShadow: '0 0 16px rgba(1,225,142,0.15)',
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  )
}

function InputField({
  id, name, type, placeholder, label, autoComplete, disabled,
  icon, rightSlot,
}: {
  id: string; name: string; type: string; placeholder: string; label: string
  autoComplete?: string; disabled: boolean; icon: string; rightSlot?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: 15, pointerEvents: 'none', zIndex: 1 }}>
          {icon}
        </span>
        <input
          id={id} name={name} type={type} placeholder={placeholder}
          autoComplete={autoComplete} required disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '13px 44px 13px 40px',
            borderRadius: 12,
            border: `1.5px solid ${focused ? '#422c76' : 'rgba(255,255,255,0.12)'}`,
            background: 'rgba(255,255,255,0.05)',
            color: '#faf9f5',
            fontSize: 14,
            outline: 'none',
            boxShadow: focused ? '0 0 0 3px rgba(66,44,118,0.3)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            opacity: disabled ? 0.5 : 1,
          }}
        />
        {rightSlot && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
            {rightSlot}
          </span>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const countdown = useCountdown()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await loginAction(fd.get('email') as string, fd.get('password') as string)
      if (result?.error) setError(result.error)
      else router.push('/dashboard')
    })
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#0f0d17' }}>

      {/* Background */}
      <Image src="/login.png" alt="" fill priority quality={90} style={{ objectFit: 'cover', objectPosition: 'center' }} />

      {/* Overlays */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(0,0,0,0.7) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 0%, rgba(15,13,23,0.7) 70%, rgba(15,13,23,0.95) 100%)' }} />

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420, margin: '16px auto', padding: '0 16px', boxSizing: 'border-box' }}>

        {/* Countdown */}
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
            ⚽ Faltam para a Copa do Mundo 2026
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <CountBlock value={countdown.days}    label="Dias" />
            <span style={{ color: '#01E18E', fontWeight: 800, fontSize: 20, marginBottom: 18 }}>:</span>
            <CountBlock value={countdown.hours}   label="Horas" />
            <span style={{ color: '#01E18E', fontWeight: 800, fontSize: 20, marginBottom: 18 }}>:</span>
            <CountBlock value={countdown.minutes} label="Min" />
            <span style={{ color: '#01E18E', fontWeight: 800, fontSize: 20, marginBottom: 18 }}>:</span>
            <CountBlock value={countdown.seconds} label="Seg" />
          </div>
        </div>

        {/* Login card */}
        <div style={{
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06) inset',
        }}>
          {/* Gradient top border */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, #422c76, #01E18E, #ff2f69, #422c76)' }} />

          {/* Card body */}
          <div style={{
            padding: '32px 28px 28px',
            backdropFilter: 'blur(32px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
            background: 'rgba(8,6,18,0.78)',
          }}>

            {/* Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <Image
                src="/logo.png"
                alt="Bolão Vendemmia Copa 2026"
                width={240}
                height={80}
                style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(1,225,142,0.25))' }}
                priority
              />
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 24 }} />

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* E-mail */}
              <InputField
                id="email" name="email" type="email"
                placeholder="nome@vendemmia.com.br"
                label="E-mail" autoComplete="email"
                disabled={isPending} icon="✉"
              />

              {/* Senha */}
              <InputField
                id="password" name="password" type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                label="Senha" autoComplete="current-password"
                disabled={isPending} icon="🔑"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    tabIndex={-1}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 16, padding: 4, lineHeight: 1 }}
                  >
                    {showPass ? '🙈' : '👁'}
                  </button>
                }
              />

              {/* Error */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderRadius: 10, padding: '12px 14px',
                  background: 'rgba(255,47,105,0.1)',
                  border: '1px solid rgba(255,47,105,0.3)',
                  color: '#ff2f69', fontSize: 13,
                }}>
                  <span>⚠</span><span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                style={{
                  marginTop: 4,
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #422c76 0%, #5a3e94 100%)',
                  color: '#faf9f5',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  boxShadow: '0 4px 24px rgba(66,44,118,0.5)',
                  opacity: isPending ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'opacity 0.2s',
                }}
              >
                {isPending ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Entrando...
                  </>
                ) : (
                  <>Entrar <span style={{ color: '#01E18E' }}>→</span></>
                )}
              </button>
            </form>

            {/* Footer link */}
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>
              Acesso exclusivo · Vendemmia Comércio Internacional
            </p>
          </div>
        </div>
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
