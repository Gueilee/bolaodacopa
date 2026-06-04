'use client'

import { useState, useCallback } from 'react'

// ─── CONFIGURAÇÃO ─────────────────────────────────────────────────────────────
// Channel ID do canal YouTube
// Para obter: acesse youtube.com/@CazeTV → F12 → Console → digite:
//   ytInitialData.header.c4TabbedHeaderRenderer.channelId
// Ou procure "channelId" no código fonte (Ctrl+U) da página do canal
const CAZETV_CHANNEL_ID = 'UCsQlBfqRQivsTRLmBGR-lFw' // ← substitua se necessário

// Modos do player
type PlayerMode = 'hidden' | 'pip' | 'fullscreen'

type Props = {
  onModeChange?: (mode: PlayerMode) => void
}

export function YoutubePlayer({ onModeChange }: Props) {
  const [mode, setMode] = useState<PlayerMode>('hidden')
  const [muted,  setMuted]  = useState(false)

  const changeMode = useCallback((newMode: PlayerMode) => {
    setMode(newMode)
    onModeChange?.(newMode)
  }, [onModeChange])

  const embedUrl = [
    `https://www.youtube.com/embed/live_stream`,
    `?channel=${CAZETV_CHANNEL_ID}`,
    `&autoplay=1`,
    `&mute=${muted ? 1 : 0}`,
    `&rel=0`,
    `&modestbranding=1`,
    `&iv_load_policy=3`,
  ].join('')

  // ── Botão de entrada (quando hidden) ────────────────────────────────────────
  if (mode === 'hidden') {
    return (
      <button
        onClick={() => changeMode('pip')}
        style={{
          position: 'fixed', bottom: 80, right: 24, zIndex: 90,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 20px', borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(255,0,0,0.85), rgba(180,0,0,0.95))',
          border: '1px solid rgba(255,80,80,0.4)',
          boxShadow: '0 4px 24px rgba(255,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
          cursor: 'pointer', color: 'white',
          animation: 'pulse-red 2s ease-in-out infinite',
        }}
        title="Abrir CazéTV ao vivo"
      >
        <span style={{ fontSize: 22 }}>📺</span>
        <div style={{ textAlign: 'left' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 900, letterSpacing: '0.05em' }}>CazéTV</p>
          <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4444', animation: 'pulse-red 1s infinite', flexShrink: 0, display: 'inline-block' }} />
            Ao vivo
          </p>
        </div>
        <style>{`
          @keyframes pulse-red { 0%,100%{box-shadow:0 4px 24px rgba(255,0,0,0.4)} 50%{box-shadow:0 4px 36px rgba(255,0,0,0.8)} }
        `}</style>
      </button>
    )
  }

  // ── PiP Mode ─────────────────────────────────────────────────────────────────
  if (mode === 'pip') {
    return (
      <div style={{
        position: 'fixed', bottom: 80, right: 24, zIndex: 90,
        width: 480, borderRadius: 18, overflow: 'hidden',
        background: '#000',
        boxShadow: '0 8px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.12)',
        animation: 'slideIn 0.3s ease',
      }}>
        <style>{`
          @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          @keyframes pulse-live { 0%,100%{opacity:1} 50%{opacity:0.4} }
        `}</style>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 14px',
          background: 'linear-gradient(90deg, rgba(255,0,0,0.9), rgba(140,0,0,0.9))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4444', animation: 'pulse-live 1s infinite', display: 'inline-block' }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: '0.05em' }}>CazéTV · AO VIVO</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {/* Mute toggle */}
            <button onClick={() => setMuted(m => !m)} style={{ ...btnStyle, fontSize: 16 }} title={muted ? 'Ativar som' : 'Silenciar'}>
              {muted ? '🔇' : '🔊'}
            </button>
            {/* Fullscreen */}
            <button onClick={() => changeMode('fullscreen')} style={{ ...btnStyle, fontSize: 14, padding: '4px 10px', gap: 5, display: 'flex', alignItems: 'center' }} title="Tela cheia">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v2H5v5H3V3zm14 0h4v7h-2V5h-5V3h3zm3 14h-2v5h-5v2h7v-7zM3 17h2v5h5v2H3v-7z"/></svg>
              <span style={{ fontSize: 11, fontWeight: 700 }}>Tela cheia</span>
            </button>
            {/* Close */}
            <button onClick={() => changeMode('hidden')} style={{ ...btnStyle, fontSize: 16, opacity: 0.7 }} title="Fechar">✕</button>
          </div>
        </div>

        {/* YouTube iframe */}
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="CazéTV ao vivo"
          />
        </div>

        {/* Bottom bar */}
        <div style={{
          padding: '8px 14px', background: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
            📺 youtube.com/@CazeTV
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
            Clique em ⛶ para tela cheia
          </span>
        </div>
      </div>
    )
  }

  // ── Fullscreen Mode ───────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#000',
      animation: 'fadeIn 0.25s ease',
    }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse-live { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* YouTube fullscreen */}
      <iframe
        src={embedUrl}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="CazéTV ao vivo"
      />

      {/* Controls overlay — aparece no hover */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '16px 24px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        pointerEvents: 'none',
      }}>
        {/* Badge ao vivo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 20,
            background: 'rgba(255,0,0,0.85)', border: '1px solid rgba(255,100,100,0.4)',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4444', animation: 'pulse-live 1s infinite', display: 'inline-block' }} />
            <span style={{ fontSize: 14, fontWeight: 900, color: 'white', letterSpacing: '0.08em' }}>CazéTV · AO VIVO</span>
          </div>
        </div>

        {/* Controles direita */}
        <div style={{ display: 'flex', gap: 10, pointerEvents: 'auto' }}>
          <button onClick={() => setMuted(m => !m)} style={{ ...fullBtnStyle }} title={muted ? 'Ativar som' : 'Silenciar'}>
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={() => changeMode('pip')}
            style={{ ...fullBtnStyle, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
            title="Minimizar para PiP"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19 11h-8v6h8v-6zM21 3H3v18h18V3zm-2 16H5V5h14v14z"/></svg>
            <span style={{ fontSize: 13, fontWeight: 800 }}>Minimizar</span>
          </button>
          <button
            onClick={() => changeMode('hidden')}
            style={{ ...fullBtnStyle, opacity: 0.7 }}
            title="Fechar CazéTV"
          >
            ✕ Fechar
          </button>
        </div>
      </div>

      {/* Bolão watermark */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20,
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: '6px 12px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>BOLÃO COPA 2026 · Vendemmia</span>
      </div>
    </div>
  )
}

// ─── Estilos de botão reutilizáveis ───────────────────────────────────────────

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 8,
  color: 'white',
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: 14,
  transition: 'all 0.15s',
}

const fullBtnStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.2)',
  backdropFilter: 'blur(8px)',
  borderRadius: 10,
  color: 'white',
  padding: '10px 14px',
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 700,
  transition: 'all 0.15s',
}
