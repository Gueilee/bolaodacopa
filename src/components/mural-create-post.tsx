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

          {/* Media preview */}
          {preview && (
            <div className="relative inline-block">
              {preview.type === 'image' ? (
                <img src={preview.url} alt="Preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 10, objectFit: 'cover' }} />
              ) : (
                <video src={preview.url} controls style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 10 }} />
              )}
              <button
                type="button"
                onClick={removeMedia}
                style={{
                  position: 'absolute', top: -8, right: -8,
                  width: 24, height: 24, borderRadius: '50%',
                  background: '#ff2f69', color: 'white',
                  border: 'none', cursor: 'pointer', fontSize: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold',
                }}
              >×</button>
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <p style={{ fontSize: 12, color: '#8a8490' }}>⏳ Fazendo upload...</p>
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
