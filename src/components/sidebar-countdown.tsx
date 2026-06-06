'use client'

import { useEffect, useState } from 'react'

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

function Block({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        background: 'rgba(1,225,142,0.12)',
        border: '1.5px solid rgba(1,225,142,0.4)',
        borderRadius: 8,
        width: 42, height: 42,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: 17, color: '#01E18E',
        fontVariantNumeric: 'tabular-nums',
        boxShadow: '0 0 12px rgba(1,225,142,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
        fontFamily: 'var(--font-barlow), sans-serif',
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <span style={{
        fontSize: 7, fontWeight: 700, letterSpacing: '0.16em',
        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  )
}

export function SidebarCountdown() {
  const [t, setT] = useState(calc)

  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      margin: '10px 12px',
      padding: '12px 14px',
      borderRadius: 14,
      background: 'rgba(1,225,142,0.05)',
      border: '1px solid rgba(1,225,142,0.15)',
    }}>
      <p style={{
        fontSize: 8, fontWeight: 700, letterSpacing: '0.16em',
        color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
        margin: '0 0 10px', textAlign: 'center',
        fontFamily: 'var(--font-barlow), sans-serif',
      }}>
        ⚡ Copa 2026
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
        <Block value={t.days}    label="dias" />
        <Block value={t.hours}   label="horas" />
        <Block value={t.minutes} label="min" />
        <Block value={t.seconds} label="seg" />
      </div>
    </div>
  )
}
