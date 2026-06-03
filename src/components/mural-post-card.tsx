'use client'

import { useState, useTransition, useRef } from 'react'
import { toggleLike, deletePost, getPostComments, createComment, deleteComment } from '@/app/actions/social'
import { useRouter } from 'next/navigation'
import type { PostWithUser, CommentItem } from '@/app/actions/social'
import { UserAvatar } from '@/components/user-avatar'

// Imagem de post com fallback silencioso se a URL estiver quebrada
function MediaImage({ src }: { src: string }) {
  const [broken, setBroken] = useState(false)
  if (broken) return null
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', maxHeight: 400 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Post"
        onError={() => setBroken(true)}
        style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }}
      />
    </div>
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

function Avatar({ name, role, avatarUrl }: { name: string; role: string; avatarUrl?: string | null }) {
  return (
    <UserAvatar
      name={name}
      avatarUrl={avatarUrl}
      size={32}
      bgColor={role === 'admin' ? '#422c76' : '#5a3e94'}
      textColor="white"
    />
  )
}

type Props = {
  post:          PostWithUser
  currentUserId: string
  isAdmin:       boolean
}

export function MuralPostCard({ post, currentUserId, isAdmin }: Props) {
  const [liked, setLiked]             = useState(post.likedByMe)
  const [likesCount, setLikesCount]   = useState(post.likesCount)
  const [commentsCount, setCommentsCount] = useState(post.commentsCount)
  const [showComments, setShowComments]   = useState(false)
  const [comments, setComments]           = useState<CommentItem[]>([])
  const [commentsLoaded, setLoaded]       = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [newComment, setNewComment]       = useState('')
  const [confirmDelete, setConfirm]       = useState(false)
  const [isPending, start]                = useTransition()
  const [submitting, setSubmitting]       = useState(false)
  const inputRef                          = useRef<HTMLInputElement>(null)
  const router                            = useRouter()

  const initials = post.userName.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

  // ── Curtir ──────────────────────────────────────────────────────────────────
  function handleLike() {
    if (isPending) return
    setLiked((v) => !v)
    setLikesCount((v) => liked ? v - 1 : v + 1)
    start(async () => { await toggleLike(post.id) })
  }

  // ── Deletar post ─────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirmDelete) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return }
    await deletePost(post.id)
    router.refresh()
  }

  // ── Abrir/fechar comentários ─────────────────────────────────────────────────
  async function toggleComments() {
    if (!showComments && !commentsLoaded) {
      setLoadingComments(true)
      const data = await getPostComments(post.id)
      setComments(data)
      setLoaded(true)
      setLoadingComments(false)
    }
    setShowComments((v) => !v)
    if (!showComments) setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── Enviar comentário ────────────────────────────────────────────────────────
  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || submitting) return
    setSubmitting(true)
    const res = await createComment(post.id, newComment)
    if (res.success && res.comment) {
      setComments((prev) => [...prev, res.comment!])
      setCommentsCount((v) => v + 1)
      setNewComment('')
    }
    setSubmitting(false)
  }

  // ── Deletar comentário ───────────────────────────────────────────────────────
  async function handleDeleteComment(commentId: string) {
    const res = await deleteComment(commentId)
    if (res.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      setCommentsCount((v) => Math.max(0, v - 1))
    }
  }

  return (
    <div className="card p-5 space-y-4" style={{ transition: 'box-shadow 0.2s' }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar name={post.userName} avatarUrl={post.userAvatar} size={40} bgColor={post.userRole === 'admin' ? '#422c76' : '#5a3e94'} textColor="white" />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm" style={{ color: '#1a1625' }}>{post.userName}</p>
              {post.userRole === 'admin' && (
                <span style={{ fontSize: 10, fontWeight: 700, background: '#422c76', color: 'white', padding: '1px 6px', borderRadius: 10 }}>
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: '#aaa8b0' }}>{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        {(currentUserId && isAdmin) && (
          <button onClick={handleDelete} style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 8,
            background: confirmDelete ? '#ff2f69' : '#f5f2ef',
            color: confirmDelete ? 'white' : '#8a8490',
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {confirmDelete ? 'Confirmar?' : '🗑'}
          </button>
        )}
      </div>

      {/* ── Conteúdo ── */}
      {post.content && (
        <p style={{ color: '#1a1625', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {post.content}
        </p>
      )}

      {/* ── Mídia ── */}
      {post.mediaUrl && post.mediaType === 'image' && (
        <MediaImage src={post.mediaUrl} />
      )}
      {post.mediaUrl && post.mediaType === 'video' && (
        <div style={{ borderRadius: 12, overflow: 'hidden' }}>
          <video src={post.mediaUrl} controls
            style={{ width: '100%', maxHeight: 400, display: 'block', background: '#000' }}
            onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none' }}
          />
        </div>
      )}

      {/* ── Ações (curtir + comentários) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 4, borderTop: '1px solid #f0ede8' }}>
        {/* Curtir */}
        <button onClick={handleLike} disabled={isPending} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 600, padding: '4px 0',
          color: liked ? '#ff2f69' : '#8a8490', transition: 'color 0.15s',
        }}>
          <span style={{ fontSize: 18, transform: liked ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.15s' }}>
            {liked ? '❤️' : '🤍'}
          </span>
          {likesCount > 0 && <span>{likesCount}</span>}
          <span style={{ fontWeight: 400, fontSize: 13 }}>{liked ? 'Curtiu' : 'Curtir'}</span>
        </button>

        {/* Comentários */}
        <button onClick={toggleComments} disabled={loadingComments} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 600, padding: '4px 0',
          color: showComments ? '#422c76' : '#8a8490', transition: 'color 0.15s',
        }}>
          <span style={{ fontSize: 17 }}>💬</span>
          {commentsCount > 0 && <span>{commentsCount}</span>}
          <span style={{ fontWeight: 400, fontSize: 13 }}>
            {loadingComments ? 'Carregando…' : commentsCount === 1 ? '1 comentário' : commentsCount > 1 ? `${commentsCount} comentários` : 'Comentar'}
          </span>
        </button>
      </div>

      {/* ── Seção de comentários ── */}
      {showComments && (
        <div style={{ borderTop: '1px solid #f0ede8', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Lista de comentários */}
          {comments.length === 0 && !loadingComments && (
            <p style={{ fontSize: 13, color: '#aaa8b0', textAlign: 'center', padding: '8px 0' }}>
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          )}

          {comments.map((c) => (
            <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Avatar name={c.userName} role={c.isAdmin ? 'admin' : 'user'} avatarUrl={c.userAvatar} />
              <div style={{
                flex: 1, background: '#f9f7f5', borderRadius: 12,
                padding: '8px 12px', position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1625' }}>{c.userName}</span>
                  {c.isAdmin && (
                    <span style={{ fontSize: 9, fontWeight: 700, background: '#422c76', color: 'white', padding: '1px 5px', borderRadius: 8 }}>Admin</span>
                  )}
                  <span style={{ fontSize: 11, color: '#aaa8b0', marginLeft: 'auto' }}>{timeAgo(c.createdAt)}</span>
                  {(c.isMe || isAdmin) && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#c4bfba', padding: '0 2px', lineHeight: 1 }}
                      title="Excluir comentário"
                    >
                      ×
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#3d3847', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))}

          {/* Campo novo comentário */}
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
                flex: 1, height: 38, borderRadius: 20,
                border: '1.5px solid #e0dbd5',
                background: '#fafaf8', color: '#1a1625',
                padding: '0 14px', fontSize: 13, outline: 'none',
                opacity: submitting ? 0.6 : 1,
              }}
              onFocus={(e) => { e.target.style.borderColor = '#422c76' }}
              onBlur={(e)  => { e.target.style.borderColor = '#e0dbd5' }}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              style={{
                height: 38, padding: '0 16px', borderRadius: 20, border: 'none',
                background: !newComment.trim() || submitting ? '#e8e4df' : '#422c76',
                color: !newComment.trim() || submitting ? '#aaa8b0' : 'white',
                fontSize: 12, fontWeight: 700, cursor: !newComment.trim() || submitting ? 'default' : 'pointer',
                transition: 'all 0.15s', flexShrink: 0,
              }}
            >
              {submitting ? '…' : 'Enviar'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
