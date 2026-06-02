'use client'

import { useState, useRef, useTransition } from 'react'
import { createPost } from '@/app/actions/social'
import { useRouter } from 'next/navigation'

export function MuralCreatePost({ userName }: { userName: string }) {
  const [content, setContent]     = useState('')
  const [preview, setPreview]     = useState<{ url: string; type: 'image' | 'video' } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [isPending, start]        = useTransition()
  const fileRef                   = useRef<HTMLInputElement>(null)
  const router                    = useRouter()

  const initials = userName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

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
    fd.append('mediaUrl',  preview?.url   ?? '')
    fd.append('mediaType', preview?.type  ?? 'text')

    start(async () => {
      const result = await createPost(fd)
      if (result.success) {
        setContent('')
        setPreview(null)
        if (fileRef.current) fileRef.current.value = ''
        router.refresh()
      } else {
        setError(result.error ?? 'Erro ao publicar.')
      }
    })
  }

  const isLoading = uploading || isPending

  return (
    <div className="card p-5" style={{ border: '2px solid #e8e4df' }}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white"
          style={{ background: '#422c76' }}>
          {initials}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          {/* Text area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Compartilhe um momento, foto ou vídeo da torcida! 🏆⚽"
            rows={3}
            maxLength={500}
            disabled={isLoading}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '12px 14px', borderRadius: 12,
              border: '1.5px solid #e0dbd5',
              background: '#fafaf8', color: '#1a1625',
              fontSize: 14, resize: 'none', outline: 'none',
              fontFamily: 'inherit', opacity: isLoading ? 0.6 : 1,
            }}
            onFocus={(e) => { e.target.style.border = '1.5px solid #422c76'; e.target.style.boxShadow = '0 0 0 3px rgba(66,44,118,0.1)' }}
            onBlur={(e) => { e.target.style.border = '1.5px solid #e0dbd5'; e.target.style.boxShadow = 'none' }}
          />

          {/* Upload progress */}
          {uploading && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 10,
              background: '#f5f2ef', border: '1px solid #e8e4df',
            }}>
              <svg style={{ width: 16, height: 16, flexShrink: 0, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#c4bfba" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#422c76" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: 12, color: '#6b6672', margin: 0 }}>Fazendo upload…</p>
            </div>
          )}

          {/* Media preview */}
          {preview && !uploading && (
            <div style={{ border: '1.5px solid #e0dbd5', borderRadius: 12, overflow: 'hidden', background: '#f9f7f5' }}>
              {/* Toolbar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', background: '#f0ede8', borderBottom: '1px solid #e8e4df',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#01a866', display: 'flex', alignItems: 'center', gap: 5 }}>
                  ✓ {preview.type === 'image' ? 'Imagem carregada' : 'Vídeo carregado'}
                </span>
                <button
                  type="button"
                  onClick={removeMedia}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 8,
                    background: 'rgba(255,47,105,0.08)', color: '#ff2f69',
                    border: '1px solid rgba(255,47,105,0.2)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  🗑 Remover
                </button>
              </div>

              {/* Media */}
              <div style={{ padding: 12 }}>
                {preview.type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview.url} alt="Preview"
                    style={{ maxHeight: 280, maxWidth: '100%', borderRadius: 8, objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <video src={preview.url} controls style={{ maxHeight: 280, maxWidth: '100%', borderRadius: 8, display: 'block' }} />
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p style={{ fontSize: 12, color: '#ff2f69', background: '#fce8ee', padding: '8px 12px', borderRadius: 8 }}>{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Photo button */}
              <label
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 20,
                  background: '#f0ede8', color: '#422c76',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: '1px solid #e0dbd5', transition: 'all 0.15s',
                }}
              >
                📷 Foto/Vídeo
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                  onChange={handleFile}
                  disabled={isLoading}
                  style={{ display: 'none' }}
                />
              </label>

              {content && (
                <span style={{ fontSize: 11, color: '#aaa8b0' }}>{content.length}/500</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || (!content.trim() && !preview)}
              style={{
                padding: '8px 22px', borderRadius: 20,
                background: (!content.trim() && !preview) || isLoading ? '#c4bfba' : '#422c76',
                color: 'white', border: 'none',
                fontSize: 13, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {isPending ? 'Publicando...' : '🚀 Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
