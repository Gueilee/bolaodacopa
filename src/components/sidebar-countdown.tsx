'use client'

import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'

const TARGET = new Date('2026-06-11T20:00:00Z').getTime()

function calc() {
  const diff = Math.max(0, TARGET - Date.now())
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

export function SidebarCountdown() {
  const [t, setT] = useState(calc)

  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div style={{
      margin: '10px 12px',
      padding: '11px 14px',
      borderRadius: 12,
      background: 'rgba(1,225,142,0.07)',
      border: '1px solid rgba(1,225,142,0.18)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: 'rgba(1,225,142,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Zap size={14} color="#01E18E" strokeWidth={2.5} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', margin: 0,
          fontFamily: 'var(--font-barlow), sans-serif',
        }}>
          Copa 2026
        </p>
        <p style={{
          fontSize: 13, fontWeight: 400, color: '#01E18E', margin: 0,
          fontFamily: 'var(--font-anton), sans-serif',
          letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {t.days}d {pad(t.hours)}h {pad(t.minutes)}m {pad(t.seconds)}s
        </p>
      </div>
    </div>
  )
}
