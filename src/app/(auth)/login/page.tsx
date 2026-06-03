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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(145deg, rgba(1,225,142,0.15), rgba(1,225,142,0.05))',
        border: '1.5px solid rgba(1,225,142,0.4)',
        borderRadius: 12,
        width: 58, height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: 24, color: '#01E18E',
        fontVariantNumeric: 'tabular-nums',
        boxShadow: '0 0 20px rgba(1,225,142,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label htmlFor={id} style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ color: '#01E18E', fontSize: 10 }}>▸</span> {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)',
          color: focused ? '#01E18E' : 'rgba(255,255,255,0.25)',
          fontSize: 14, pointerEvents: 'none', transition: 'color 0.25s',
        }}>
          {icon}
        </span>
        <input
          id={id} name={name} type={type} placeholder={placeholder}
          autoComplete={autoComplete} required disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '14px 46px 14px 44px',
            borderRadius: 14,
            border: `1.5px solid ${focused ? 'rgba(1,225,142,0.6)' : 'rgba(255,255,255,0.08)'}`,
            background: focused
              ? 'rgba(1,225,142,0.04)'
              : 'rgba(255,255,255,0.03)',
            color: '#faf9f5', fontSize: 14,
            outline: 'none',
            boxShadow: focused
              ? '0 0 0 4px rgba(1,225,142,0.08), inset 0 0 0 1px rgba(1,225,142,0.1)'
              : 'inset 0 1px 0 rgba(255,255,255,0.03)',
            transition: 'all 0.25s',
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
      else router.push('/dashboard')
    })
  }

  return (
    <div style={{
      position: 'relative', minHeight: '100vh', display: 'flex', overflow: 'hidden',
      background: 'linear-gradient(135deg, #04020c 0%, #130836 45%, #091a0f 100%)',
    }}>

      {/* Luzes ambiente — sem depender de arquivo externo */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Brilho roxo grande à esquerda */}
        <div style={{ position: 'absolute', top: '-10%', left: '-15%', width: '70%', height: '80%',
          background: 'radial-gradient(ellipse, rgba(90,44,148,0.55) 0%, transparent 65%)' }} />
        {/* Brilho neon verde embaixo */}
        <div style={{ position: 'absolute', bottom: '-5%', left: '5%', width: '45%', height: '55%',
          background: 'radial-gradient(ellipse, rgba(1,225,142,0.18) 0%, transparent 65%)' }} />
        {/* Brilho roxo claro no centro-direita */}
        <div style={{ position: 'absolute', top: '25%', right: '10%', width: '50%', height: '50%',
          background: 'radial-gradient(ellipse, rgba(66,44,118,0.35) 0%, transparent 60%)' }} />
        {/* Partículas decorativas — linhas diagonais sutis */}
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 60px)',
        }} />
        {/* Brilho rosa copa */}
        <div style={{ position: 'absolute', top: '50%', right: '5%', width: '30%', height: '40%',
          background: 'radial-gradient(ellipse, rgba(255,47,105,0.1) 0%, transparent 70%)' }} />
      </div>

      {/* ── LEFT PANEL ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 460,
        padding: '48px 40px',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>

        {/* COUNTDOWN — centralizado */}
        <div style={{ marginBottom: 28, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 20, height: 1, background: 'rgba(1,225,142,0.35)' }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
              ⚽ Faltam para a Copa 2026
            </span>
            <div style={{ width: 20, height: 1, background: 'rgba(1,225,142,0.35)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Block value={cd.days}    label="Dias" />
            <span style={{ color: '#01E18E', fontWeight: 900, fontSize: 20, marginBottom: 20, opacity: 0.6 }}>:</span>
            <Block value={cd.hours}   label="Horas" />
            <span style={{ color: '#01E18E', fontWeight: 900, fontSize: 20, marginBottom: 20, opacity: 0.6 }}>:</span>
            <Block value={cd.minutes} label="Min" />
            <span style={{ color: '#01E18E', fontWeight: 900, fontSize: 20, marginBottom: 20, opacity: 0.6 }}>:</span>
            <Block value={cd.seconds} label="Seg" />
          </div>
        </div>

        {/* LOGIN CARD */}
        <div style={{
          width: '100%',
          borderRadius: 22,
          background: 'rgba(18,12,40,0.55)',
          backdropFilter: 'blur(44px) saturate(1.9) brightness(1.15)',
          WebkitBackdropFilter: 'blur(44px) saturate(1.9) brightness(1.15)',
          boxShadow: '0 20px 70px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset, 0 0 40px rgba(66,44,118,0.15)',
          overflow: 'hidden',
        }}>
          {/* Neon top border */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, #422c76 0%, #01E18E 50%, #ff2f69 100%)' }} />

          {/* Card header */}
          <div style={{ padding: '22px 26px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #422c76, #2a1a4e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 0 16px rgba(66,44,118,0.5)',
              flexShrink: 0,
            }}>
              ⚽
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#faf9f5', lineHeight: 1.2 }}>
                Entrar no Bolão
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                Use seu acesso corporativo
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ margin: '18px 26px 0', height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.08), transparent)' }} />

          {/* Form */}
          <div style={{ padding: '20px 26px 26px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 17, padding: '4px', lineHeight: 1, transition: 'color 0.2s' }}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                }
              />

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderRadius: 12, padding: '12px 15px',
                  background: 'rgba(255,47,105,0.08)',
                  border: '1px solid rgba(255,47,105,0.25)',
                  color: '#ff6b8a', fontSize: 13,
                }}>
                  <span style={{ fontSize: 16 }}>⚠</span><span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={isPending}
                style={{
                  marginTop: 6, width: '100%', padding: '15px',
                  borderRadius: 14, border: 'none',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  background: isPending
                    ? 'rgba(66,44,118,0.5)'
                    : 'linear-gradient(135deg, #3d2870 0%, #5a3e94 50%, #422c76 100%)',
                  color: '#faf9f5', fontSize: 15, fontWeight: 800,
                  letterSpacing: '0.06em',
                  boxShadow: isPending ? 'none' : '0 4px 24px rgba(66,44,118,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset',
                  opacity: isPending ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}>
                {isPending ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite', width: 17, height: 17 }} viewBox="0 0 24 24" fill="none">
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
                      borderRadius: 8, padding: '2px 10px', color: '#01E18E', fontSize: 16, fontWeight: 900,
                    }}>→</span>
                  </>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>
              🔒 Acesso exclusivo · Vendemmia Logística Integrada
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.22); }
      `}</style>
    </div>
  )
}
