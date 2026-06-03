'use client'

import { useState, useRef, useTransition } from 'react'
import { createPost } from '@/app/actions/social'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/user-avatar'

export function MuralCreatePost({ userName, userAvatar }: { userName: string; userAvatar?: string | null }) {
  const [content, setContent]     = useState('')
  const [preview, setPreview]     = useState<{ url: string; type: 'image' | 'video' } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [isPending, start]        = useTransition()
  const [focused, setFocused]     = useState(false)
  const fileRef                   = useRef<HTMLInputElement>(null)
  const router                    = useRouter()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res  = await fetch('/api/social/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setUploading(false); return }
      setPreview({ url: data.url, type: data.mediaType })
    } catch {
      setError('Erro ao fazer upload. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  function removeMedia() {
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() && !preview) { setError('Escreva algo ou adicione uma foto/vídeo.'); return }
    setError(null)
    const fd = new FormData()
    fd.append('content',   content.trim())
    fd.append('mediaUrl',  preview?.url  ?? '')
    fd.append('mediaType', preview?.type ?? 'text')
    start(async () => {
      const result = await createPost(fd)
      if (result.success) {
        setContent(''); setPreview(null); setFocused(false)
        if (fileRef.current) fileRef.current.value = ''
        router.refresh()
      } else {
        setError(result.error ?? 'Erro ao publicar.')
      }
    })
  }

  const isLoading = uploading || isPending
  const canPost   = (content.trim() || preview) && !isLoading

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      border: focused ? '1.5px solid rgba(66,44,118,0.35)' : '1px solid rgba(0,0,0,0.07)',
      boxShadow: focused
        ? '0 4px 24px rgba(66,44,118,0.12), 0 1px 4px rgba(0,0,0,0.05)'
        : '0 1px 4px rgba(0,0,0,0.05)',
      transition: 'all 0.2s',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 12px' }}>
        <UserAvatar name={userName} avatarUrl={userAvatar} size={44} bgColor="#422c76" textColor="white" />
        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => !content && !preview && setFocused(false)}
            placeholder="Compartilhe um momento, foto ou vídeo da torcida! 🏆 🌍"
            rows={focused ? 3 : 1}
            maxLength={500}
            disabled={isLoading}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 16px',
              borderRadius: 24,
              border: '1.5px solid #edeae6',
              background: '#f9f7f5', color: '#1a1625',
              fontSize: 14, resize: 'none', outline: 'none',
              fontFamily: 'inherit', lineHeight: 1.5,
              transition: 'all 0.2s',
            }}
            onFocusCapture={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#d4c8e8' }}
            onBlurCapture={(e)  => { e.target.style.background = '#f9f7f5'; e.target.style.borderColor = '#edeae6' }}
          />
        </form>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            borderRadius: 12, background: 'rgba(66,44,118,0.06)', border: '1px solid rgba(66,44,118,0.15)',
          }}>
            <svg style={{ width: 15, height: 15, animation: 'spin 1s linear infinite', flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#c4bfba" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#422c76" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 12, color: '#422c76', fontWeight: 600 }}>Fazendo upload da mídia…</span>
          </div>
        </div>
      )}

      {/* Preview de mídia */}
      {preview && !uploading && (
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #edeae6', position: 'relative' }}>
            <button onClick={removeMedia} type="button" style={{
              position: 'absolute', top: 8, right: 8, zIndex: 10,
              background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none',
              borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
              fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
            {preview.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.url} alt="Preview"
                style={{ maxHeight: 300, width: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <video src={preview.url} controls style={{ maxHeight: 300, width: '100%', display: 'block' }} />
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '0 20px 10px' }}>
          <p style={{ fontSize: 12, color: '#ff2f69', background: '#fff0f3', padding: '8px 12px', borderRadius: 10, margin: 0, border: '1px solid rgba(255,47,105,0.2)' }}>
            ⚠ {error}
          </p>
        </div>
      )}

      {/* Actions bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px 14px',
        borderTop: '1px solid #f5f2ef',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
            background: 'rgba(66,44,118,0.07)', color: '#422c76',
            fontSize: 13, fontWeight: 600, border: '1px solid rgba(66,44,118,0.15)',
            transition: 'all 0.15s',
          }}>
            📷 Foto/Vídeo
            <input ref={fileRef} type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              onChange={handleFile} disabled={isLoading} style={{ display: 'none' }} />
          </label>
          {content.length > 0 && (
            <span style={{ fontSize: 11, color: content.length > 450 ? '#ff2f69' : '#c4bfba' }}>
              {content.length}/500
            </span>
          )}
        </div>

        <button
          type="submit"
          onClick={handleSubmit as unknown as React.MouseEventHandler}
          disabled={!canPost}
          style={{
            padding: '8px 24px', borderRadius: 20, border: 'none',
            background: canPost
              ? 'linear-gradient(135deg,#422c76,#5a3e94)'
              : '#e8e4df',
            color: canPost ? '#fff' : '#aaa8b0',
            fontSize: 13, fontWeight: 700,
            cursor: canPost ? 'pointer' : 'not-allowed',
            boxShadow: canPost ? '0 2px 12px rgba(66,44,118,0.4)' : 'none',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {isPending ? (
            <>
              <svg style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Publicando…
            </>
          ) : '🚀 Publicar'}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
