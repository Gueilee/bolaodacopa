'use client'

import { useState, useEffect } from 'react'
import type { TvPost } from '@/lib/tv-data'

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1)  return 'agora'
  if (m < 60) return `${m}min`
  if (h < 24) return `${h}h`
  return `${d}d`
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

// Cor única por usuário baseada no nome
function avatarColor(name: string): string {
  const colors = ['#422c76','#1a6aff','#01a866','#d97706','#dc2626','#7c3aed','#0891b2','#be185d']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

type Props = { posts: TvPost[] }

// ─── Card de post com imagem grande ──────────────────────────────────────────

function PostCardMedia({ post }: { post: TvPost }) {
  const [imgError, setImgError] = useState(false)
  const color = avatarColor(post.userName)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 20, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      height: '100%',
    }}>
      {/* Imagem */}
      {post.mediaUrl && post.mediaType === 'image' && !imgError && (
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.mediaUrl} alt=""
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Gradiente sobre a imagem */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
          {/* Info sobre a imagem */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: '#fff',
                border: '2px solid rgba(255,255,255,0.4)',
              }}>
                {post.userAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.userAvatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : getInitials(post.userName)}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>{post.userName.split(' ')[0]}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{timeAgo(post.createdAt)}</p>
              </div>
            </div>
            {post.content && (
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {post.content}
              </p>
            )}
            <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>❤️ {post.likesCount}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>💬 {post.commentsCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Post sem imagem ou com imagem quebrada */}
      {(!post.mediaUrl || post.mediaType !== 'image' || imgError) && (
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: '#fff',
              boxShadow: `0 0 16px ${color}88`,
            }}>
              {post.userAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.userAvatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : getInitials(post.userName)}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#fff' }}>{post.userName}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          {post.content && (
            <p style={{
              margin: 0, fontSize: 20, color: 'rgba(255,255,255,0.9)', lineHeight: 1.55,
              fontWeight: 500, flex: 1,
              display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              "{post.content}"
            </p>
          )}

          <div style={{ display: 'flex', gap: 16, marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20 }}>❤️</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#ff6b8a' }}>{post.likesCount}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20 }}>💬</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>{post.commentsCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Slide principal ──────────────────────────────────────────────────────────

export function SlideMural({ posts }: Props) {
  const [page, setPage]         = useState(0)
  const [visible, setVisible]   = useState(true)

  const PER_PAGE = 3
  const totalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE))

  // Auto-paginar a cada 7 segundos dentro do slide
  useEffect(() => {
    if (posts.length <= PER_PAGE) return
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setPage(p => (p + 1) % totalPages)
        setVisible(true)
      }, 400)
    }, 7000)
    return () => clearInterval(t)
  }, [posts.length, totalPages])

  const pagePosts = posts.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  const totalLikes    = posts.reduce((a, p) => a + p.likesCount, 0)
  const totalComments = posts.reduce((a, p) => a + p.commentsCount, 0)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 40px', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#01E18E', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            💬 Central da Torcida
          </p>
          <h2 style={{ margin: '4px 0 0', fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
            O TIME EM CAMPO
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
            Últimas publicações dos colaboradores
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, paddingBottom: 4 }}>
          {[
            { icon: '📝', value: posts.length, label: 'posts' },
            { icon: '❤️', value: totalLikes,    label: 'curtidas' },
            { icon: '💬', value: totalComments, label: 'comentários' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#01E18E', lineHeight: 1 }}>{s.value}</p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {s.icon} {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Linha separadora neon */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, #01E18E, rgba(66,44,118,0.5), transparent)', flexShrink: 0 }} />

      {posts.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <span style={{ fontSize: 64 }}>💬</span>
          <p style={{ fontSize: 24, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Nenhuma publicação ainda</p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.2)', margin: 0 }}>Seja o primeiro a compartilhar!</p>
        </div>
      ) : (
        <>
          {/* Grid de posts */}
          <div style={{
            flex: 1, minHeight: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}>
            {pagePosts.map(post => (
              <PostCardMedia key={post.id} post={post} />
            ))}
            {/* Espaços vazios se não tiver 3 posts */}
            {pagePosts.length < PER_PAGE && Array.from({ length: PER_PAGE - pagePosts.length }).map((_, i) => (
              <div key={`empty-${i}`} style={{
                borderRadius: 20, border: '1px dashed rgba(255,255,255,0.08)',
              }} />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingBottom: 4 }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <div key={i} style={{
                  width: i === page ? 28 : 8, height: 8, borderRadius: 4,
                  background: i === page ? '#01E18E' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.4s',
                }} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
