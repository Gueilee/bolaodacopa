'use client'

import { useState, useTransition, useRef } from 'react'
import { toggleLike, deletePost, getPostComments, createComment, deleteComment, getPostLikes } from '@/app/actions/social'
import { useRouter } from 'next/navigation'
import type { PostWithUser, CommentItem, LikeItem } from '@/app/actions/social'
import { UserAvatar } from '@/components/user-avatar'

function MediaImage({ src }: { src: string }) {
  const [broken,    setBroken]    = useState(false)
  const [lightbox,  setLightbox]  = useState(false)

  if (broken) return null
  return (
    <>
      {/* ── Thumbnail clicável ── */}
      <div
        onClick={() => setLightbox(true)}
        style={{ borderRadius: 16, overflow: 'hidden', background: '#0a0616', cursor: 'zoom-in' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src} alt="Post"
          onError={() => setBroken(true)}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            padding: 16,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src} alt="Post ampliado"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '100%', maxHeight: '100%',
              width: 'auto', height: 'auto',
              borderRadius: 12,
              boxShadow: '0 8px 64px rgba(0,0,0,0.8)',
              cursor: 'default',
            }}
          />
          <button
            onClick={() => setLightbox(false)}
            style={{
              position: 'fixed', top: 20, right: 20,
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'white', fontSize: 20, lineHeight: '1',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1)  return 'agora mesmo'
  if (m < 60) return `${m}min atrás`
  if (h < 24) return `${h}h atrás`
  return `${d}d atrás`
}

type Props = { post: PostWithUser; currentUserId: string; isAdmin: boolean }

export function MuralPostCard({ post, currentUserId, isAdmin }: Props) {
  const [liked, setLiked]                     = useState(post.likedByMe)
  const [likesCount, setLikesCount]           = useState(post.likesCount)
  const [commentsCount, setCommentsCount]     = useState(post.commentsCount)
  const [showComments, setShowComments]       = useState(false)
  const [comments, setComments]               = useState<CommentItem[]>([])
  const [commentsLoaded, setLoaded]           = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [showLikes, setShowLikes]             = useState(false)
  const [likes, setLikes]                     = useState<LikeItem[]>([])
  const [likesLoaded, setLikesLoaded]         = useState(false)
  const [loadingLikes, setLoadingLikes]       = useState(false)
  const [newComment, setNewComment]           = useState('')
  const [confirmDelete, setConfirm]           = useState(false)
  const [isPending, start]                    = useTransition()
  const [submitting, setSubmitting]           = useState(false)
  const inputRef                              = useRef<HTMLInputElement>(null)
  const router                                = useRouter()

  function handleLike() {
    if (isPending) return
    setLiked(v => !v)
    setLikesCount(v => liked ? v - 1 : v + 1)
    start(async () => { await toggleLike(post.id) })
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return }
    await deletePost(post.id)
    router.refresh()
  }

  async function toggleLikes() {
    if (!showLikes && !likesLoaded) {
      setLoadingLikes(true)
      const data = await getPostLikes(post.id)
      setLikes(data)
      setLikesLoaded(true)
      setLoadingLikes(false)
    }
    setShowLikes(v => !v)
  }

  async function toggleComments() {
    if (!showComments && !commentsLoaded) {
      setLoadingComments(true)
      const data = await getPostComments(post.id)
      setComments(data)
      setLoaded(true)
      setLoadingComments(false)
    }
    setShowComments(v => !v)
    if (!showComments) setTimeout(() => inputRef.current?.focus(), 100)
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || submitting) return
    setSubmitting(true)
    const res = await createComment(post.id, newComment)
    if (res.success && res.comment) {
      setComments(prev => [...prev, res.comment!])
      setCommentsCount(v => v + 1)
      setNewComment('')
    }
    setSubmitting(false)
  }

  async function handleDeleteComment(commentId: string) {
    const res = await deleteComment(commentId)
    if (res.success) {
      setComments(prev => prev.filter(c => c.id !== commentId))
      setCommentsCount(v => Math.max(0, v - 1))
    }
  }

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 20,
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}>

      {/* ── Header ── */}
      <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <UserAvatar name={post.userName} avatarUrl={post.userAvatar} size={44}
          bgColor={post.userRole === 'admin' ? '#422c76' : '#5a3e94'} textColor="white" />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1625' }}>{post.userName}</span>
            {post.userRole === 'admin' && (
              <span style={{
                fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 20,
                background: 'linear-gradient(135deg, #422c76, #5a3e94)', color: 'white',
                letterSpacing: '0.05em',
              }}>
                ADMIN
              </span>
            )}
          </div>
          <span style={{ fontSize: 12, color: '#aaa8b0' }}>{timeAgo(post.createdAt)}</span>
        </div>

        {isAdmin && (
          <button onClick={handleDelete} style={{
            fontSize: 12, padding: '5px 12px', borderRadius: 20,
            background: confirmDelete ? 'linear-gradient(135deg,#ff2f69,#ff6b8a)' : 'rgba(0,0,0,0.04)',
            color: confirmDelete ? 'white' : '#c4bfba',
            border: 'none', cursor: 'pointer', transition: 'all 0.15s', fontWeight: 600,
            boxShadow: confirmDelete ? '0 2px 8px rgba(255,47,105,0.35)' : 'none',
          }}>
            {confirmDelete ? '⚠ Confirmar?' : '🗑'}
          </button>
        )}
      </div>

      {/* ── Conteúdo ── */}
      {post.content && (
        <div style={{ padding: '0 20px 14px' }}>
          <p style={{ color: '#2d2737', fontSize: 15, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>
            {post.content}
          </p>
        </div>
      )}

      {/* ── Mídia ── */}
      {post.mediaUrl && post.mediaType === 'image' && (
        <div style={{ padding: '0 0 4px' }}>
          <MediaImage src={post.mediaUrl} />
        </div>
      )}
      {post.mediaUrl && post.mediaType === 'video' && (
        <div style={{ padding: '0 0 4px', background: '#000' }}>
          <video src={post.mediaUrl} controls
            style={{ width: '100%', maxHeight: 420, display: 'block' }}
            onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none' }}
          />
        </div>
      )}

      {/* ── Contador de engajamento ── */}
      {(likesCount > 0 || commentsCount > 0) && (
        <div style={{
          padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid #f5f2ef',
        }}>
          {likesCount > 0 ? (
            <button
              onClick={toggleLikes}
              style={{
                fontSize: 12, background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, color: showLikes ? '#ff2f69' : '#aaa8b0',
                fontWeight: showLikes ? 700 : 400,
                textDecoration: showLikes ? 'none' : 'underline',
                textUnderlineOffset: 2,
              }}
            >
              ❤️ {likesCount} curtida{likesCount !== 1 ? 's' : ''}
            </button>
          ) : <span />}
          {commentsCount > 0 && (
            <button
              onClick={toggleComments}
              style={{
                fontSize: 12, color: '#7c6aaa', background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, fontWeight: 600,
                textDecoration: showComments ? 'none' : 'underline',
                textUnderlineOffset: 2,
              }}
            >
              {commentsCount} comentário{commentsCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* ── Ações ── */}
      <div style={{
        padding: '4px 16px 12px',
        display: 'flex', alignItems: 'center', gap: 4,
        borderTop: '1px solid #f5f2ef',
      }}>
        <ActionBtn
          onClick={handleLike}
          disabled={isPending}
          active={liked}
          activeColor="#ff2f69"
          icon={liked ? '❤️' : '🤍'}
          label={liked ? 'Curtiu' : 'Curtir'}
        />
        <ActionBtn
          onClick={toggleComments}
          disabled={loadingComments}
          active={showComments}
          activeColor="#422c76"
          icon="💬"
          label={loadingComments ? 'Carregando…' : 'Comentar'}
        />
      </div>

      {/* ── Quem curtiu ── */}
      {showLikes && (
        <div style={{
          background: '#fdf8ff',
          borderTop: '1px solid #f0ede8',
          padding: '12px 20px',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
            Curtidas
          </p>
          {loadingLikes ? (
            <p style={{ fontSize: 13, color: '#aaa8b0' }}>Carregando…</p>
          ) : likes.length === 0 ? (
            <p style={{ fontSize: 13, color: '#aaa8b0' }}>Nenhuma curtida ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {likes.map(l => (
                <div key={l.userId} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, background: '#fff', border: '1px solid #ede9e4' }}>
                  <UserAvatar name={l.userName} avatarUrl={l.userAvatar} size={22} bgColor="#ff2f6933" textColor="#ff2f69" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#2d2737' }}>{l.userName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Comentários ── */}
      {showComments && (
        <div style={{
          background: '#faf9f7',
          borderTop: '1px solid #f0ede8',
          padding: '14px 20px 16px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {comments.length === 0 && !loadingComments && (
            <p style={{ fontSize: 13, color: '#aaa8b0', textAlign: 'center', padding: '4px 0' }}>
              Nenhum comentário ainda. Seja o primeiro! 🎉
            </p>
          )}

          {comments.map((c) => (
            <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <UserAvatar name={c.userName} avatarUrl={c.userAvatar} size={32}
                bgColor={c.isAdmin ? '#422c76' : '#7c6aaa'} textColor="white" />
              <div style={{
                flex: 1, background: '#fff', borderRadius: 14,
                padding: '9px 13px', border: '1px solid #edeae6',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1625' }}>{c.userName}</span>
                  {c.isAdmin && (
                    <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 10, background: 'linear-gradient(135deg,#422c76,#5a3e94)', color: '#fff' }}>
                      ADMIN
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: '#c4bfba', marginLeft: 'auto' }}>{timeAgo(c.createdAt)}</span>
                  {(c.isMe || isAdmin) && (
                    <button onClick={() => handleDeleteComment(c.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#ddd', lineHeight: 1, padding: '0 2px' }}
                      title="Excluir">×</button>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#3d3847', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))}

          {/* Campo de novo comentário */}
          <form onSubmit={handleComment} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <UserAvatar name={post.userName} avatarUrl={post.userAvatar} size={32} bgColor="#5a3e94" textColor="white" />
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={300}
              placeholder="Escreva um comentário…"
              disabled={submitting}
              style={{
                flex: 1, height: 38, borderRadius: 24,
                border: '1.5px solid #e0dbd5',
                background: '#fff', color: '#1a1625',
                padding: '0 16px', fontSize: 13, outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#422c76' }}
              onBlur={(e)  => { e.target.style.borderColor = '#e0dbd5' }}
            />
            <button type="submit" disabled={!newComment.trim() || submitting} style={{
              height: 38, padding: '0 18px', borderRadius: 24, border: 'none', flexShrink: 0,
              background: !newComment.trim() || submitting
                ? '#ede9e4'
                : 'linear-gradient(135deg,#422c76,#5a3e94)',
              color: !newComment.trim() || submitting ? '#aaa8b0' : 'white',
              fontSize: 12, fontWeight: 700,
              cursor: !newComment.trim() || submitting ? 'default' : 'pointer',
              transition: 'all 0.15s',
              boxShadow: !newComment.trim() || submitting ? 'none' : '0 2px 8px rgba(66,44,118,0.35)',
            }}>
              {submitting ? '…' : 'Enviar'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ onClick, disabled, active, activeColor, icon, label }: {
  onClick: () => void; disabled: boolean; active: boolean
  activeColor: string; icon: string; label: string
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      background: active ? `${activeColor}14` : 'transparent',
      border: 'none', borderRadius: 12, cursor: 'pointer',
      padding: '8px 12px', fontSize: 13, fontWeight: 600,
      color: active ? activeColor : '#8a8490',
      transition: 'all 0.15s',
    }}>
      <span style={{ fontSize: 17 }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}
