'use client'

import { useState, useEffect } from 'react'
import type { TvData } from '@/lib/tv-data'
import { Crown } from 'lucide-react'

const CUP_DATE = new Date('2026-06-11T20:00:00Z')

function pad(n: number) { return String(n).padStart(2, '0') }

export function SlideWelcome({ data }: { data: TvData }) {
  const [cd, setCd] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function calc() {
      const diff = CUP_DATE.getTime() - Date.now()
      if (diff <= 0) { setCd({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      setCd({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [])

  const leader = data.ranking[0]

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 48,
      padding: '0 40px', textAlign: 'center',
    }}>
      {/* Main title */}
      <div>
        <h1 style={{
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: 'clamp(60px, 10vw, 96px)', color: 'white',
          lineHeight: .92, letterSpacing: '0.02em', margin: 0,
          textShadow: '0 0 60px rgba(1,225,142,0.4)',
        }}>
          BOLÃO
        </h1>
        <h1 style={{
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: 'clamp(60px, 10vw, 96px)', margin: 0, lineHeight: .92,
          background: 'linear-gradient(135deg, #01E18E 0%, #00b872 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '0.02em',
        }}>
          COPA 2026
        </h1>
        <p style={{
          fontFamily: 'var(--font-barlow), sans-serif',
          fontSize: 20, fontWeight: 600,
          color: 'rgba(255,255,255,0.4)', marginTop: 14,
          letterSpacing: '0.22em', textTransform: 'uppercase',
        }}>
          Vendemmia Logística Integrada
        </p>
      </div>

      {/* Countdown */}
      <div>
        <p style={{
          fontFamily: 'var(--font-barlow), sans-serif',
          fontSize: 12, fontWeight: 700,
          color: 'rgba(255,255,255,0.35)', letterSpacing: '0.28em',
          textTransform: 'uppercase', marginBottom: 20,
        }}>
          Faltam para a Copa do Mundo 2026
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
          {[
            { value: cd.days,    label: 'DIAS' },
            { value: cd.hours,   label: 'HORAS' },
            { value: cd.minutes, label: 'MIN' },
            { value: cd.seconds, label: 'SEG' },
          ].map((item, i) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  background: 'rgba(1,225,142,0.12)',
                  border: '2px solid rgba(1,225,142,0.4)',
                  borderRadius: 16, padding: '16px 24px',
                  fontFamily: 'var(--font-anton), sans-serif',
                  fontSize: 56, color: '#01E18E',
                  fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                  minWidth: 110,
                  boxShadow: '0 0 30px rgba(1,225,142,0.15)',
                }}>
                  {pad(item.value)}
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8, letterSpacing: '0.2em' }}>
                  {item.label}
                </p>
              </div>
              {i < 3 && (
                <span style={{ fontSize: 40, color: 'rgba(1,225,142,0.5)', fontWeight: 900, marginBottom: 28 }}>:</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leader chip */}
      {leader && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 50, padding: '12px 28px',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Crown size={22} color="#F59E0B" strokeWidth={1.75} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>LÍDER DO BOLÃO</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>
              {leader.name}
              <span style={{ color: '#01E18E', marginLeft: 12, fontSize: 16 }}>{leader.totalPoints} pts</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
