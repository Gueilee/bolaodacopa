'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/user-avatar'

type Props = {
  name:       string
  avatarUrl:  string | null
}

export function AvatarUpload({ name, avatarUrl }: Props) {
  const [preview, setPreview]   = useState<string | null>(avatarUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)
  const inputRef                = useRef<HTMLInputElement>(null)
  const router                  = useRouter()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(false)

    // Preview local imediato
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res  = await fetch('/api/user/avatar', { method: 'POST', body: fd })

      let data: { url?: string; error?: string } = {}
      try { data = await res.json() } catch { /* resposta não é JSON */ }

      if (!res.ok) {
        setError(data.error ?? `Erro no servidor (${res.status}). Tente novamente.`)
        setPreview(avatarUrl)
        return
      }

      setPreview(data.url ?? null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch (err) {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
      setPreview(avatarUrl)
      console.error('[avatar upload]', err)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Foto grande + botão sobreposto */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Avatar 96px */}
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={name}
            style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e8e4df', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}
          />
        ) : (
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: '#422c76', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 32, border: '3px solid #e8e4df',
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          }}>
            {name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
          </div>
        )}

        {/* Botão câmera sobreposto */}
        <label
          style={{
            position: 'absolute', bottom: 2, right: 2,
            width: 28, height: 28, borderRadius: '50%',
            background: '#422c76', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            border: '2px solid white', fontSize: 13,
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            transition: 'background 0.15s',
          }}
          title="Alterar foto"
        >
          {uploading ? '⏳' : '📷'}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFile}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Texto de apoio */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1625', margin: 0 }}>{name}</p>
        <p style={{ fontSize: 11, color: '#aaa8b0', margin: '2px 0 0' }}>
          {uploading ? 'Enviando foto…' : 'Clique no 📷 para alterar a foto'}
        </p>
      </div>

      {/* Feedback */}
      {success && (
        <p style={{ fontSize: 12, color: '#01a866', fontWeight: 600 }}>✓ Foto atualizada com sucesso!</p>
      )}
      {error && (
        <p style={{ fontSize: 12, color: '#ff2f69', background: '#fff0f3', padding: '6px 12px', borderRadius: 8, border: '1px solid #ffd0da' }}>
          {error}
        </p>
      )}

      <p style={{ fontSize: 11, color: '#c4bfba', textAlign: 'center' }}>
        JPG, PNG, WebP ou GIF · máx. 5MB
      </p>
    </div>
  )
}
