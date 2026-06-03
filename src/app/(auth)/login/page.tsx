'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/app/actions/auth'

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
        background: 'rgba(1,225,142,0.12)',
        border: '1.5px solid rgba(1,225,142,0.45)',
        borderRadius: 10,
        width: 52, height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: 22, color: '#01E18E',
        fontVariantNumeric: 'tabular-nums',
        boxShadow: '0 0 18px rgba(1,225,142,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  )
}

function InputField({ id, name, type, placeholder, label, autoComplete, disabled, icon, right }: {
  id: string; name: string; type: string; placeholder: string
  label: string; autoComplete?: string; disabled: boolean
  icon: string; right?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ color: '#01E18E', fontSize: 9 }}>▸</span> {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: focused ? '#01E18E' : 'rgba(255,255,255,0.22)',
          fontSize: 13, pointerEvents: 'none', transition: 'color 0.2s',
        }}>
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
            border: `1.5px solid ${focused ? 'rgba(1,225,142,0.55)' : 'rgba(255,255,255,0.1)'}`,
            background: focused ? 'rgba(1,225,142,0.05)' : 'rgba(255,255,255,0.04)',
            color: '#faf9f5', fontSize: 14,
            outline: 'none',
            boxShadow: focused
              ? '0 0 0 3px rgba(1,225,142,0.1), inset 0 0 0 1px rgba(1,225,142,0.08)'
              : 'none',
            transition: 'all 0.2s',
            opacity: disabled ? 0.5 : 1,
            letterSpacing: type === 'password' ? '0.15em' : 'normal',
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
      else router.push('/dashboard/regras')
    })
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

      {/* ── Imagem de fundo completa ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/login2.png"
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          zIndex: 0,
        }}
      />

      {/* ── Overlay escuro gradiente (mais escuro à esquerda para o card, transparente à direita) ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(105deg, rgba(3,1,15,0.92) 0%, rgba(3,1,15,0.82) 25%, rgba(3,1,15,0.18) 48%, rgba(0,0,0,0.04) 100%)',
      }} />

      {/* ── Halo de iluminação atrás do card ── */}
      <div style={{
        position: 'absolute', zIndex: 1,
        left: '-5%', top: '50%', transform: 'translateY(-50%)',
        width: '38%', height: '90%',
        background: 'radial-gradient(ellipse at 30% 50%, rgba(66,44,118,0.45) 0%, rgba(1,225,142,0.08) 45%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(2px)',
      }} />

      {/* ── Card de login (à esquerda, centralizado verticalmente) ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 400,
        marginLeft: 'clamp(20px, 6vw, 80px)',
        padding: '0 16px',
        boxSizing: 'border-box',
      }}>

        {/* COUNTDOWN */}
        <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 18, height: 1, background: 'rgba(1,225,142,0.4)' }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
              ⚽ Faltam para a Copa 2026
            </span>
            <div style={{ width: 18, height: 1, background: 'rgba(1,225,142,0.4)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Block value={cd.days}    label="Dias" />
            <span style={{ color: '#01E18E', fontWeight: 900, fontSize: 18, marginBottom: 16, opacity: 0.5 }}>:</span>
            <Block value={cd.hours}   label="Horas" />
            <span style={{ color: '#01E18E', fontWeight: 900, fontSize: 18, marginBottom: 16, opacity: 0.5 }}>:</span>
            <Block value={cd.minutes} label="Min" />
            <span style={{ color: '#01E18E', fontWeight: 900, fontSize: 18, marginBottom: 16, opacity: 0.5 }}>:</span>
            <Block value={cd.seconds} label="Seg" />
          </div>
        </div>

        {/* LOGIN CARD — glass + glow */}
        <div style={{
          borderRadius: 20,
          background: 'rgba(10,6,30,0.6)',
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          boxShadow: [
            '0 0 0 1px rgba(255,255,255,0.09) inset',
            '0 0 60px rgba(66,44,118,0.55)',
            '0 0 120px rgba(1,225,142,0.12)',
            '0 24px 64px rgba(0,0,0,0.6)',
          ].join(', '),
          overflow: 'hidden',
        }}>
          {/* Borda neon superior */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, #422c76 0%, #01E18E 50%, #ff2f69 100%)' }} />

          {/* Header */}
          <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'linear-gradient(135deg, #422c76, #2a1a4e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, boxShadow: '0 0 20px rgba(66,44,118,0.7)',
              flexShrink: 0,
            }}>
              ⚽
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#faf9f5', lineHeight: 1.2 }}>
                Entrar no Bolão
              </h2>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 2 }}>
                Use seu acesso corporativo
              </p>
            </div>
          </div>

          <div style={{ margin: '16px 24px 0', height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.08), transparent)' }} />

          {/* Form */}
          <div style={{ padding: '18px 24px 24px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InputField
                id="email" name="email" type="email"
                placeholder="nome@vendemmia.com.br"
                label="E-mail" autoComplete="email"
                disabled={isPending} icon="✉"
              />
              <InputField
                id="password" name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••" label="Senha"
                autoComplete="current-password" disabled={isPending} icon="🔑"
                right={
                  <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 16, padding: '4px', lineHeight: 1 }}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                }
              />

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderRadius: 10, padding: '11px 14px',
                  background: 'rgba(255,47,105,0.08)',
                  border: '1px solid rgba(255,47,105,0.25)',
                  color: '#ff6b8a', fontSize: 13,
                }}>
                  <span style={{ fontSize: 15 }}>⚠</span><span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={isPending}
                style={{
                  marginTop: 4, width: '100%', padding: '14px',
                  borderRadius: 12, border: 'none',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  background: isPending
                    ? 'rgba(66,44,118,0.4)'
                    : 'linear-gradient(135deg, #3d2870 0%, #5a3e94 50%, #422c76 100%)',
                  color: '#faf9f5', fontSize: 14, fontWeight: 800,
                  letterSpacing: '0.06em',
                  boxShadow: isPending ? 'none' : '0 4px 24px rgba(66,44,118,0.7), 0 0 0 1px rgba(255,255,255,0.06) inset',
                  opacity: isPending ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.2s',
                }}>
                {isPending ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Entrando...
                  </>
                ) : (
                  <>
                    <span>Entrar</span>
                    <span style={{
                      background: 'rgba(1,225,142,0.2)', border: '1px solid rgba(1,225,142,0.4)',
                      borderRadius: 7, padding: '2px 10px', color: '#01E18E', fontSize: 15, fontWeight: 900,
                    }}>→</span>
                  </>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: 'rgba(255,255,255,0.16)', letterSpacing: '0.04em' }}>
              🔒 Acesso exclusivo · Vendemmia Logística Integrada
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  )
}
