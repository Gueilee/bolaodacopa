'use client'

import { useState, useCallback, useEffect } from 'react'

type PlayerMode = 'hidden' | 'pip' | 'fullscreen'
type LiveInfo   = { videoId: string | null; channelId: string | null }

type Props = { onModeChange?: (mode: PlayerMode) => void }

export function YoutubePlayer({ onModeChange }: Props) {
  const [mode,     setMode]     = useState<PlayerMode>('hidden')
  const [muted,    setMuted]    = useState(true) // começa mutado para autoplay
  const [liveInfo, setLiveInfo] = useState<LiveInfo>({ videoId: null, channelId: null })
  const [isLive,   setIsLive]   = useState(false)

  // Busca video ID da CazéTV a cada 5 minutos
  useEffect(() => {
    async function fetchLive() {
      try {
        const res  = await fetch('/api/cazetv-live')
        const data = await res.json()
        setLiveInfo({ videoId: data.videoId, channelId: data.channelId })
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
    // Desmuta ao abrir manualmente
    if (newMode !== 'hidden') setMuted(false)
  }, [onModeChange])

  // Constrói URL do iframe
  const embedUrl = () => {
    const params = [`autoplay=1`, `mute=${muted ? 1 : 0}`, `rel=0`, `modestbranding=1`, `iv_load_policy=3`].join('&')
    if (liveInfo.videoId) {
      return `https://www.youtube.com/embed/${liveInfo.videoId}?${params}`
    }
    if (liveInfo.channelId) {
      return `https://www.youtube.com/embed/live_stream?channel=${liveInfo.channelId}&${params}`
    }
    // Fallback: embed da página ao vivo do canal
    return `https://www.youtube.com/embed?listType=user_uploads&list=CazeTV&${params}`
  }

  // ── Botão de entrada ───────────────────────────────────────────────────────
  if (mode === 'hidden') {
    return (
      <>
        <style>{`
          @keyframes pulse-entry { 0%,100%{box-shadow:0 4px 20px rgba(255,0,0,0.5),0 0 0 0 rgba(255,0,0,0.4)} 50%{box-shadow:0 4px 28px rgba(255,0,0,0.8),0 0 0 6px rgba(255,0,0,0)} }
          @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        `}</style>
        <button
          onClick={() => changeMode('pip')}
          style={{
            position: 'fixed', bottom: 80, right: 24, zIndex: 90,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 18px', borderRadius: 14,
            background: 'linear-gradient(135deg, #cc0000, #990000)',
            border: '1px solid rgba(255,100,100,0.35)',
            boxShadow: '0 4px 20px rgba(255,0,0,0.5)',
            cursor: 'pointer', color: 'white',
            animation: isLive ? 'pulse-entry 2s ease-in-out infinite' : 'none',
            transition: 'transform 0.15s',
          }}
        >
          <span style={{ fontSize: 22 }}>📺</span>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 900, letterSpacing: '0.06em' }}>CazéTV</p>
            <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {isLive ? (
                <>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4444', animation: 'pulse-dot 1s infinite', display: 'inline-block' }} />
                  AO VIVO agora
                </>
              ) : 'Abrir canal'}
            </p>
          </div>
        </button>
      </>
    )
  }

  // ── PiP Mode ───────────────────────────────────────────────────────────────
  if (mode === 'pip') {
    return (
      <div style={{
        position: 'fixed', bottom: 80, right: 24, zIndex: 90,
        width: 460, borderRadius: 16, overflow: 'hidden',
        background: '#0a0a0a',
        boxShadow: '0 12px 56px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,50,50,0.3)',
        animation: 'slideInPip 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <style>{`
          @keyframes slideInPip { from{opacity:0;transform:translateY(24px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
          @keyframes pulse-dot  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        `}</style>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'linear-gradient(90deg, #cc0000, #880000)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff6666', animation: 'pulse-dot 1s infinite', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 900, color: 'white', letterSpacing: '0.08em' }}>
              CazéTV {isLive ? '· AO VIVO' : '· Canal'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => setMuted(m => !m)} style={pipBtn} title={muted ? 'Ativar som' : 'Silenciar'}>
              {muted ? '🔇' : '🔊'}
            </button>
            <button onClick={() => changeMode('fullscreen')} style={{ ...pipBtn, display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px' }} title="Tela cheia">
              <ExpandIcon />
              <span style={{ fontSize: 11, fontWeight: 700 }}>Tela cheia</span>
            </button>
            <button onClick={() => changeMode('hidden')} style={{ ...pipBtn, opacity: 0.6, fontSize: 15 }}>✕</button>
          </div>
        </div>

        {/* Player 16:9 */}
        <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
          <iframe
            key={embedUrl()} // re-monta quando muted muda
            src={embedUrl()}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="CazéTV"
          />
        </div>

        {/* Bottom info */}
        <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>youtube.com/@CazeTV</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
            {isLive ? '🔴 Transmissão ao vivo' : '📼 Últimos vídeos'}
          </span>
        </div>
      </div>
    )
  }

  // ── Fullscreen Mode ────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000', animation: 'fadeFs 0.25s ease' }}>
      <style>{`
        @keyframes fadeFs  { from{opacity:0} to{opacity:1} }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <iframe
        key={`fs-${embedUrl()}`}
        src={embedUrl()}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="CazéTV"
      />

      {/* Top controls */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 24px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 24, background: 'rgba(204,0,0,0.9)', border: '1px solid rgba(255,100,100,0.3)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff6666', animation: 'pulse-dot 1s infinite', display: 'inline-block' }} />
          <span style={{ fontSize: 14, fontWeight: 900, color: 'white', letterSpacing: '0.08em' }}>
            CazéTV {isLive ? '· AO VIVO' : ''}
          </span>
        </div>

        {/* Controles */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setMuted(m => !m)} style={fsBtn}>{muted ? '🔇' : '🔊'}</button>
          <button onClick={() => changeMode('pip')} style={{ ...fsBtn, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CollapseIcon />
            <span style={{ fontSize: 13, fontWeight: 700 }}>PiP</span>
          </button>
          <button onClick={() => changeMode('hidden')} style={{ ...fsBtn, opacity: 0.6 }}>✕ Fechar</button>
        </div>
      </div>

      {/* Bolão watermark */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, padding: '5px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.06em' }}>
          BOLÃO COPA 2026 · VENDEMMIA
        </span>
      </div>
    </div>
  )
}

// ─── Ícones ───────────────────────────────────────────────────────────────────

function ExpandIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
      <path d="M3 3h7v2H5v5H3V3zm14 0h4v7h-2V5h-5V3h3zm3 14h-2v5h-5v2h7v-7zM3 17h2v5h5v2H3v-7z"/>
    </svg>
  )
}

function CollapseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
      <path d="M19 11h-8v6h8v-6zM21 3H3v18h18V3zm-2 16H5V5h14v14z"/>
    </svg>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const pipBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 7, color: 'white', padding: '4px 8px', cursor: 'pointer', fontSize: 14,
}

const fsBtn: React.CSSProperties = {
  background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.18)',
  backdropFilter: 'blur(10px)', borderRadius: 10, color: 'white',
  padding: '9px 14px', cursor: 'pointer', fontSize: 15, fontWeight: 700,
}
