'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TvData } from '@/lib/tv-data'
import { SlideWelcome }     from './slide-welcome'
import { SlideRanking }     from './slide-ranking'
import { SlideDepartments } from './slide-departments'
import { SlideMatches }     from './slide-matches'
import { SlideResults }     from './slide-results'

type SlideConfig = { id: string; duration: number; label: string }

const SLIDES: SlideConfig[] = [
  { id: 'welcome',     duration: 10000, label: '🏆 Bolão Copa 2026' },
  { id: 'ranking',     duration: 14000, label: '🥇 Ranking Individual' },
  { id: 'departments', duration: 12000, label: '🏢 Por Departamento' },
  { id: 'matches',     duration: 12000, label: '⚽ Jogos do Dia' },
  { id: 'results',     duration: 12000, label: '📊 Últimos Resultados' },
]

export function TvSlideshow({ data }: { data: TvData }) {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length)
    setProgress(0)
  }, [])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)
    setProgress(0)
  }, [])

  // Auto-advance + progress bar
  useEffect(() => {
    const duration = SLIDES[current].duration
    const interval = 100
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += interval
      setProgress((elapsed / duration) * 100)
      if (elapsed >= duration) {
        clearInterval(timer)
        next()
      }
    }, interval)

    return () => clearInterval(timer)
  }, [current, next])

  // Auto-reload page every 5 minutes to refresh data
  useEffect(() => {
    const reload = setTimeout(() => window.location.reload(), 5 * 60 * 1000)
    return () => clearTimeout(reload)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const slide = SLIDES[current]

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: '#06040f',
        overflow: 'hidden',
        cursor: 'none',
        userSelect: 'none',
      }}
      onClick={next}
    >
      {/* Background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/login2.png"
        alt=""
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.12, pointerEvents: 'none',
        }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center top, rgba(66,44,118,0.3) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Header bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        zIndex: 20,
      }}>
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/vendemmia-logo.png" alt="Logo" style={{ height: 48, objectFit: 'contain' }} />

        {/* Current slide name */}
        <span style={{
          fontSize: 18, fontWeight: 700, color: '#01E18E',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {slide.label}
        </span>

        {/* Clock */}
        <TvClock participants={data.totalUsers} />
      </div>

      {/* Slide content */}
      <div style={{ position: 'absolute', inset: 0, paddingTop: 80, paddingBottom: 60 }}>
        {slide.id === 'welcome'     && <SlideWelcome data={data} />}
        {slide.id === 'ranking'     && <SlideRanking entries={data.ranking} />}
        {slide.id === 'departments' && <SlideDepartments departments={data.departments} />}
        {slide.id === 'matches'     && <SlideMatches matches={data.todayMatches} />}
        {slide.id === 'results'     && <SlideResults matches={data.recentResults} />}
      </div>

      {/* Bottom bar: progress + dots */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '0 32px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
        background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
        zIndex: 20,
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: '#01E18E', borderRadius: 2,
            width: `${progress}%`, transition: 'width 0.1s linear',
          }} />
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              style={{
                width: i === current ? 24 : 8, height: 8,
                borderRadius: 4,
                background: i === current ? '#01E18E' : 'rgba(255,255,255,0.25)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function TvClock({ participants }: { participants: number }) {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const h = String(time.getHours()).padStart(2, '0')
  const m = String(time.getMinutes()).padStart(2, '0')

  return (
    <div style={{ textAlign: 'right' }}>
      <p style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {h}:{m}
      </p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
        {participants} participante{participants !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
