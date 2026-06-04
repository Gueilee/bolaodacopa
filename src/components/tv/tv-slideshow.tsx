'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { TvData } from '@/lib/tv-data'
import { YoutubePlayer }     from './youtube-player'
import { SlideWelcome }      from './slide-welcome'
import { SlideRanking }      from './slide-ranking'
import { SlideDepartments }  from './slide-departments'
import { SlideManagers }     from './slide-managers'
import { SlideMatches }      from './slide-matches'
import { SlideResults }      from './slide-results'
import { SlideMural }        from './slide-mural'
import { SlideGroups }       from './slide-groups'
import { SlideArtilheiros }  from './slide-artilheiros'

type SlideConfig = { id: string; duration: number; label: string }

const SLIDES: SlideConfig[] = [
  { id: 'cover',        duration: 8000,  label: '' },
  { id: 'welcome',      duration: 10000, label: '🏆 Bolão Copa 2026' },
  { id: 'ranking',      duration: 14000, label: '🥇 Ranking Individual' },
  { id: 'departments',  duration: 12000, label: '🏢 Por Departamento' },
  { id: 'managers',     duration: 12000, label: '👔 Por Gestor' },
  { id: 'matches',      duration: 14000, label: '⚽ Jogos do Dia' },
  { id: 'results',      duration: 14000, label: '📊 Últimos Resultados' },
  { id: 'groups',       duration: 18000, label: '🏆 Grupos' },
  { id: 'artilheiros',  duration: 16000, label: '⚽ Artilheiros' },
  { id: 'mural',        duration: 22000, label: '💬 Central da Torcida' },
]

export function TvSlideshow({ data }: { data: TvData }) {
  const [current,    setCurrent]    = useState(0)
  const [progress,   setProgress]   = useState(0)
  const [ytFullscreen, setYtFullscreen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      if (e.key === 'f' || e.key === 'F') toggleFullscreen()
      if (e.key === 'Escape') setShowControls(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next, prev])

  // Track fullscreen state
  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Show controls briefly on mouse move
  function handleMouseMove() {
    setShowControls(true)
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000)
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const slide = SLIDES[current]
  const isCover = slide.id === 'cover'

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: '#06040f',
        overflow: 'hidden',
        cursor: showControls ? 'default' : 'none',
        userSelect: 'none',
      }}
      onClick={next}
      onMouseMove={handleMouseMove}
    >
      {/* ── Cover slide ── */}
      {isCover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/login.png"
          alt="Bolão da Copa 2026"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* ── Regular slides ── */}
      {!isCover && (
        <>
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
            <img src="/logo2.png" alt="Logo" style={{ height: 90, objectFit: 'contain' }} />

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

          {/* Slide content — paddingTop calculado: logo 90px + padding 16px*2 = 122px mínimo */}
          <div style={{ position: 'absolute', inset: 0, paddingTop: 126, paddingBottom: 60 }}>
            {slide.id === 'welcome'      && <SlideWelcome data={data} />}
            {slide.id === 'ranking'      && <SlideRanking entries={data.ranking} />}
            {slide.id === 'departments'  && <SlideDepartments departments={data.departments} />}
            {slide.id === 'managers'     && <SlideManagers managers={data.managers} />}
            {slide.id === 'matches'      && <SlideMatches matches={data.todayMatches} />}
            {slide.id === 'results'      && <SlideResults matches={data.recentResults} />}
            {slide.id === 'groups'       && <SlideGroups groups={data.groups} />}
            {slide.id === 'artilheiros'  && <SlideArtilheiros scorers={data.topScorers} />}
            {slide.id === 'mural'        && <SlideMural posts={data.posts} />}
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

            {/* Dots (skip cover dot) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {SLIDES.filter(s => s.id !== 'cover').map((s, i) => {
                const realIndex = i + 1
                return (
                  <div
                    key={s.id}
                    style={{
                      width: realIndex === current ? 24 : 8, height: 8,
                      borderRadius: 4,
                      background: realIndex === current ? '#01E18E' : 'rgba(255,255,255,0.25)',
                      transition: 'all 0.3s',
                    }}
                  />
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Player CazéTV (PiP / Fullscreen) ── */}
      <YoutubePlayer onModeChange={(m) => setYtFullscreen(m === 'fullscreen')} />

      {/* ── Fullscreen button (aparece ao mover o mouse) ── */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleFullscreen() }}
        title={isFullscreen ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8,
          cursor: 'pointer',
          zIndex: 100,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s',
          pointerEvents: showControls ? 'auto' : 'none',
          color: 'white',
        }}
      >
        {isFullscreen ? (
          // Exit fullscreen icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
            <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
          </svg>
        ) : (
          // Enter fullscreen icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
            <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
          </svg>
        )}
      </button>
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
