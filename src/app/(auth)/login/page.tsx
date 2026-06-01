'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/app/actions/auth'
import Image from 'next/image'

const CUP_DATE = new Date('2026-06-11T20:00:00Z')

function useCountdown() {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    function calc() {
      const diff = CUP_DATE.getTime() - Date.now()
      if (diff <= 0) return setT({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setT({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

function Block({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div style={{
        background: 'rgba(1,225,142,0.1)',
        border: '1.5px solid rgba(1,225,142,0.35)',
        borderRadius: 10,
        width: 52, height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 22, color: '#01E18E',
        fontVariantNumeric: 'tabular-nums',
        boxShadow: '0 0 20px rgba(1,225,142,0.12)',
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  )
}

function InputRow({ id, name, type, placeholder, label, autoComplete, disabled, icon, right }: {
  id: string; name: string; type: string; placeholder: string
  label: string; autoComplete?: string; disabled: boolean
  icon: string; right?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label htmlFor={id} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? 'rgba(1,225,142,0.7)' : 'rgba(255,255,255,0.3)', fontSize: 14, pointerEvents: 'none', transition: 'color 0.2s' }}>
          {icon}
        </span>
        <input
          id={id} name={name} type={type} placeholder={placeholder}
          autoComplete={autoComplete} required disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '13px 44px 13px 42px',
            borderRadius: 12,
            border: `1.5px solid ${focused ? 'rgba(1,225,142,0.5)' : 'rgba(255,255,255,0.1)'}`,
            background: focused ? 'rgba(1,225,142,0.04)' : 'rgba(255,255,255,0.04)',
            color: '#faf9f5', fontSize: 14,
            outline: 'none',
            boxShadow: focused ? '0 0 0 3px rgba(1,225,142,0.1), inset 0 0 0 1px rgba(1,225,142,0.1)' : 'none',
            transition: 'all 0.2s',
            opacity: disabled ? 0.5 : 1,
          }}
        />
        {right && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
            {right}
          </span>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [isPending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const cd = useCountdown()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const r = await loginAction(fd.get('email') as string, fd.get('password') as string)
      if (r?.error) setError(r.error)
      else router.push('/dashboard')
    })
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', overflow: 'hidden', background: '#0a0814' }}>

      {/* ── Background image (full bleed) ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Image src="/login.png" alt="" fill priority quality={95} style={{ objectFit: 'cover', objectPosition: 'center right' }} />
        {/* light vignette only on left to let right breathe */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,5,20,0.96) 0%, rgba(8,5,20,0.82) 38%, rgba(8,5,20,0.35) 65%, rgba(8,5,20,0.0) 100%)' }} />
        {/* subtle top/bottom darkening */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,5,20,0.5) 0%, transparent 30%, transparent 70%, rgba(8,5,20,0.6) 100%)' }} />
      </div>

      {/* ── Left panel ── */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', maxWidth: 480, padding: '40px 48px', boxSizing: 'border-box', minHeight: '100vh' }}>

        {/* Subtle left-panel glow */}
        <div style={{ position: 'absolute', top: '30%', left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(66,44,118,0.18)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(1,225,142,0.07)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <Image
            src="/logo.png"
            alt="Bolão Vendemmia Copa 2026"
            width={260} height={87}
            style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 24px rgba(1,225,142,0.2))', maxWidth: '100%' }}
            priority
          />
        </div>

        {/* Countdown */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', marginBottom: 12 }}>
            ⚽ Faltam para a Copa 2026
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Block value={cd.days}    label="Dias" />
            <span style={{ color: '#01E18E', fontWeight: 900, fontSize: 18, paddingBottom: 18 }}>:</span>
            <Block value={cd.hours}   label="Horas" />
            <span style={{ color: '#01E18E', fontWeight: 900, fontSize: 18, paddingBottom: 18 }}>:</span>
            <Block value={cd.minutes} label="Min" />
            <span style={{ color: '#01E18E', fontWeight: 900, fontSize: 18, paddingBottom: 18 }}>:</span>
            <Block value={cd.seconds} label="Seg" />
          </div>
        </div>

        {/* Card */}
        <div style={{
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07) inset, 0 0 60px rgba(66,44,118,0.15)',
        }}>
          {/* Top accent */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, #422c76, #01E18E 50%, #ff2f69)' }} />

          <div style={{
            padding: '28px 28px 24px',
            backdropFilter: 'blur(40px) saturate(1.6) brightness(1.1)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.6) brightness(1.1)',
            background: 'rgba(12,9,28,0.65)',
          }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#faf9f5' }}>
              Entrar no Bolão
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
              Use seu e-mail corporativo Vendemmia
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InputRow id="email" name="email" type="email" placeholder="nome@vendemmia.com.br"
                label="E-mail" autoComplete="email" disabled={isPending} icon="✉" />

              <InputRow id="password" name="password" type={showPass ? 'text' : 'password'}
                placeholder="••••••••" label="Senha" autoComplete="current-password"
                disabled={isPending} icon="🔑"
                right={
                  <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 16, padding: '4px 2px', lineHeight: 1 }}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                }
              />

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, padding: '11px 14px', background: 'rgba(255,47,105,0.1)', border: '1px solid rgba(255,47,105,0.3)', color: '#ff6b8a', fontSize: 13 }}>
                  <span>⚠</span><span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={isPending}
                style={{
                  marginTop: 4, width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #422c76 0%, #5a3e94 100%)',
                  color: '#faf9f5', fontSize: 15, fontWeight: 700, letterSpacing: '0.04em',
                  boxShadow: '0 4px 20px rgba(66,44,118,0.55)',
                  opacity: isPending ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.2s, transform 0.1s',
                }}>
                {isPending
                  ? <><svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24" fill="none"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Entrando...</>
                  : <>Entrar <span style={{ color: '#01E18E', fontSize: 18 }}>→</span></>
                }
              </button>
            </form>
          </div>
        </div>

        <p style={{ marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          Acesso exclusivo · Vendemmia Comércio Internacional
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
