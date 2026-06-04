'use client'

import { useState, useCallback, useEffect } from 'react'

type PlayerMode = 'hidden' | 'pip' | 'fullscreen'

const CHANNEL_ID  = 'UCgCKagVhzGnZcuP9bSMgMCg'
const CHANNEL_URL = 'https://www.youtube.com/@getv/live'

type LiveData = { videoId: string | null; title?: string }

type Props = { onModeChange?: (mode: PlayerMode) => void }

export function YoutubePlayer({ onModeChange }: Props) {
  const [mode,        setMode]        = useState<PlayerMode>('hidden')
  const [live,        setLive]        = useState<LiveData>({ videoId: null })
  const [isLive,      setIsLive]      = useState(false)
  const [tryEmbed,    setTryEmbed]    = useState(true)   // tenta embed, muda para false se bloqueado
  const [embedFailed, setEmbedFailed] = useState(false)

  useEffect(() => {
    async function fetchLive() {
      try {
        const res  = await fetch('/api/cazetv-live')
        const data = await res.json()
        setLive({ videoId: data.videoId })
        setIsLive(!!data.videoId)
      } catch { /* silencioso */ }
    }
    fetchLive()
    const t = setInterval(fetchLive, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [])

  const changeMode = useCallback((newMode: PlayerMode) => {
    setMode(newMode)
    onModeChange?.(newMode)
  }, [onModeChange])

  const openYoutube = () => {
    const url = live.videoId
      ? `https://www.youtube.com/watch?v=${live.videoId}`
      : CHANNEL_URL
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // ── Botão flutuante (hidden) ────────────────────────────────────────────────
  if (mode === 'hidden') {
    return (
      <>
        <style>{`
          @keyframes pulse-glow { 0%,100%{box-shadow:0 4px 20px rgba(255,0,0,0.45)} 50%{box-shadow:0 4px 32px rgba(255,0,0,0.9),0 0 0 4px rgba(255,0,0,0.15)} }
          @keyframes dot-blink  { 0%,100%{opacity:1} 50%{opacity:0.25} }
        `}</style>
        <button
          onClick={() => changeMode('pip')}
          style={{
            position: 'fixed', bottom: 80, right: 24, zIndex: 90,
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 20px', borderRadius: 16,
            background: 'linear-gradient(135deg, #cc0000 0%, #880000 100%)',
            border: '1px solid rgba(255,100,100,0.3)',
            cursor: 'pointer', color: 'white',
            animation: isLive ? 'pulse-glow 2s ease-in-out infinite' : 'none',
            boxShadow: '0 4px 20px rgba(255,0,0,0.45)',
          }}
        >
          <YtIcon size={22} />
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 900, letterSpacing: '0.05em' }}>GE TV</p>
            <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 5 }}>
              {isLive ? (
                <>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff5555', animation: 'dot-blink 1s infinite', display: 'inline-block', flexShrink: 0 }} />
                  AO VIVO agora
                </>
              ) : 'Abrir canal'}
            </p>
          </div>
        </button>
      </>
    )
  }

  // ── PiP Panel ───────────────────────────────────────────────────────────────
  if (mode === 'pip') {
    return (
      <div style={{
        position: 'fixed', bottom: 80, right: 24, zIndex: 90,
        width: 380, borderRadius: 18, overflow: 'hidden',
        background: 'linear-gradient(135deg, #0d0000 0%, #1a0505 100%)',
        border: '1px solid rgba(255,50,50,0.3)',
        boxShadow: '0 12px 56px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,80,80,0.15)',
        animation: 'slideUp 0.3s cubic-bezier(0.34,1.5,0.64,1)',
      }}>
        <style>{`
          @keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          @keyframes dot-blink{ 0%,100%{opacity:1} 50%{opacity:0.25} }
          @keyframes spin-slow { to{transform:rotate(360deg)} }
        `}</style>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(204,0,0,0.85)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isLive && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff6666', animation: 'dot-blink 1s infinite', display: 'inline-block' }} />}
            <span style={{ fontSize: 13, fontWeight: 900, color: 'white', letterSpacing: '0.07em' }}>
              GE TV {isLive ? '· AO VIVO' : '· Canal'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => changeMode('fullscreen')} style={{ ...pipBtn, display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px' }}>
              <ExpandIcon />
              <span style={{ fontSize: 11, fontWeight: 700 }}>Tela cheia</span>
            </button>
            <button onClick={() => changeMode('hidden')} style={{ ...pipBtn, opacity: 0.6 }}>✕</button>
          </div>
        </div>

        {/* Content — CTA panel */}
        <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>

          {/* Ícone animado */}
          <div style={{ position: 'relative' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,0,0,0.1)', border: '2px solid rgba(255,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <YtIcon size={36} />
            </div>
            {isLive && (
              <div style={{ position: 'absolute', top: -4, right: -4, padding: '2px 7px', borderRadius: 20, background: '#cc0000', border: '2px solid #0d0000' }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: 'white', letterSpacing: '0.1em' }}>LIVE</span>
              </div>
            )}
          </div>

          {/* Texto */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 900, color: 'white' }}>GE TV</p>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, maxWidth: 260 }}>
              {isLive
                ? '🔴 Transmissão ao vivo agora · O canal transmite jogos da Copa 2026'
                : 'Canal de esportes ao vivo · Jogos da Copa do Mundo 2026'}
            </p>
          </div>

          {/* Embed direto se disponível, launcher se bloqueado */}
          {tryEmbed && !embedFailed ? (
            <div style={{ width: '100%', position: 'relative', paddingBottom: '56.25%', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
              <iframe
                key={`${CHANNEL_ID}-pip`}
                src={`https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}&autoplay=1&mute=0&rel=0&modestbranding=1`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="GE TV"
                onError={() => setEmbedFailed(true)}
              />
              <button
                onClick={() => { setTryEmbed(false); setEmbedFailed(false) }}
                style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: 'rgba(255,255,255,0.5)', fontSize: 10, padding: '3px 8px', cursor: 'pointer' }}
                title="Embed bloqueado? Usar launcher"
              >
                Bloqueado?
              </button>
            </div>
          ) : (
            <button
              onClick={openYoutube}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 28px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: isLive ? 'linear-gradient(135deg, #ff0000, #cc0000)' : 'linear-gradient(135deg, #444, #222)',
                color: 'white', fontSize: 14, fontWeight: 800,
                boxShadow: isLive ? '0 4px 24px rgba(255,0,0,0.55)' : '0 4px 16px rgba(0,0,0,0.4)',
                letterSpacing: '0.03em', width: '100%', justifyContent: 'center',
              }}
            >
              <YtIcon size={18} />
              {isLive ? 'Assistir ao vivo' : 'Abrir no YouTube'}
            </button>
          )}

          <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
            {tryEmbed && !embedFailed ? 'Embed direto' : 'Abre em nova aba · youtube.com/@getv'}
          </p>
        </div>
      </div>
    )
  }

  // ── Fullscreen Panel ─────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'linear-gradient(135deg, #0a0000 0%, #1a0505 50%, #0a0000 100%)', animation: 'fadeFs 0.25s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
      <style>{`
        @keyframes fadeFs    { from{opacity:0} to{opacity:1} }
        @keyframes dot-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes float-up  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      {/* Decoração de fundo */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(204,0,0,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Conteúdo central */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, animation: 'float-up 3s ease-in-out infinite' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,0,0,0.12)', border: '3px solid rgba(255,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(255,0,0,0.25)' }}>
            <YtIcon size={60} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 42, fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>GE TV</p>
            <p style={{ margin: '6px 0 0', fontSize: 15, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Canal de Esportes ao Vivo
            </p>
          </div>
        </div>

        {/* Badge ao vivo */}
        {isLive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', borderRadius: 30, background: 'rgba(204,0,0,0.25)', border: '1px solid rgba(255,50,50,0.4)', backdropFilter: 'blur(8px)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5555', animation: 'dot-blink 1s infinite', display: 'inline-block' }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: '#ff8888', letterSpacing: '0.12em' }}>TRANSMISSÃO AO VIVO AGORA</span>
          </div>
        )}

        {/* Descrição */}
        <p style={{ margin: 0, fontSize: 17, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 480, lineHeight: 1.6 }}>
          {isLive
            ? 'A GE TV está transmitindo ao vivo agora.\nClique abaixo para assistir os jogos da Copa 2026.'
            : 'A Copa do Mundo 2026 será transmitida pela GE TV.\nAbra o YouTube para conferir os jogos.'}
        </p>

        {/* Botão principal */}
        <button
          onClick={openYoutube}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '18px 48px', borderRadius: 18, border: 'none', cursor: 'pointer',
            background: isLive
              ? 'linear-gradient(135deg, #ff0000, #cc0000)'
              : 'linear-gradient(135deg, #555, #333)',
            color: 'white', fontSize: 20, fontWeight: 900,
            boxShadow: isLive ? '0 8px 40px rgba(255,0,0,0.55)' : '0 8px 24px rgba(0,0,0,0.5)',
            letterSpacing: '0.04em',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
        >
          <YtIcon size={28} />
          {isLive ? '▶ Assistir ao vivo no YouTube' : '▶ Abrir GE TV no YouTube'}
        </button>

        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          Abre em nova aba · youtube.com/@getv
        </p>
      </div>

      {/* Controles topo */}
      <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', gap: 10, zIndex: 2 }}>
        <button onClick={() => changeMode('pip')} style={{ ...fsBtn, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CollapseIcon />
          <span>PiP</span>
        </button>
        <button onClick={() => changeMode('hidden')} style={{ ...fsBtn, opacity: 0.6 }}>✕ Fechar</button>
      </div>

      {/* Watermark Bolão */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, padding: '6px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.08em' }}>
          BOLÃO COPA 2026 · VENDEMMIA
        </span>
      </div>
    </div>
  )
}

// ─── Ícone YouTube ────────────────────────────────────────────────────────────

function YtIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.83.55 9.38.55 9.38.55s7.55 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
    </svg>
  )
}

function ExpandIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v2H5v5H3V3zm14 0h4v7h-2V5h-5V3h3zm3 14h-2v5h-5v2h7v-7zM3 17h2v5h5v2H3v-7z"/></svg>
}

function CollapseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M19 11h-8v6h8v-6zM21 3H3v18h18V3zm-2 16H5V5h14v14z"/></svg>
}

const pipBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 7, color: 'white', padding: '4px 8px', cursor: 'pointer', fontSize: 14,
}

const fsBtn: React.CSSProperties = {
  background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.18)',
  backdropFilter: 'blur(10px)', borderRadius: 10, color: 'white',
  padding: '9px 14px', cursor: 'pointer', fontSize: 14, fontWeight: 700,
}
