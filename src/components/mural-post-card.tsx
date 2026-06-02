'use client'

import { useState, useTransition } from 'react'
import { toggleLike, deletePost } from '@/app/actions/social'
import { useRouter } from 'next/navigation'
import type { PostWithUser } from '@/app/actions/social'

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

type Props = {
  post:          PostWithUser
  currentUserId: string
  isAdmin:       boolean
}

export function MuralPostCard({ post, currentUserId, isAdmin }: Props) {
  const [liked, setLiked]         = useState(post.likedByMe)
  const [likesCount, setLikesCount] = useState(post.likesCount)
  const [isPending, start]        = useTransition()
  const [confirmDelete, setConfirm] = useState(false)
  const router                    = useRouter()

  const initials = post.userName.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
  const canDelete = currentUserId === post.id || isAdmin

  function handleLike() {
    if (isPending) return
    setLiked((v) => !v)
    setLikesCount((v) => liked ? v - 1 : v + 1)
    start(async () => { await toggleLike(post.id) })
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return }
    await deletePost(post.id)
    router.refresh()
  }

  return (
    <div className="card p-5 space-y-4" style={{ transition: 'box-shadow 0.2s' }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white"
            style={{ background: post.userRole === 'admin' ? '#422c76' : '#5a3e94' }}>
            {initials}
          </div>
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

        {/* Delete */}
        {(currentUserId && isAdmin) && (
          <button
            onClick={handleDelete}
            style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 8,
              background: confirmDelete ? '#ff2f69' : '#f5f2ef',
              color: confirmDelete ? 'white' : '#8a8490',
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {confirmDelete ? 'Confirmar?' : '🗑'}
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p style={{ color: '#1a1625', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {post.content}
        </p>
      )}

      {/* Media */}
      {post.mediaUrl && post.mediaType === 'image' && (
        <div style={{ borderRadius: 12, overflow: 'hidden', maxHeight: 400 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.mediaUrl}
            alt="Post"
            style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}
      {post.mediaUrl && post.mediaType === 'video' && (
        <div style={{ borderRadius: 12, overflow: 'hidden' }}>
          <video
            src={post.mediaUrl}
            controls
            style={{ width: '100%', maxHeight: 400, display: 'block', background: '#000' }}
          />
        </div>
      )}

      {/* Footer — likes */}
      <div className="flex items-center gap-4 pt-1" style={{ borderTop: '1px solid #f0ede8' }}>
        <button
          onClick={handleLike}
          disabled={isPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, padding: '4px 0',
            color: liked ? '#ff2f69' : '#8a8490',
            transition: 'color 0.15s',
          }}
        >
          <span style={{ fontSize: 18, transform: liked ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.15s' }}>
            {liked ? '❤️' : '🤍'}
          </span>
          {likesCount > 0 && <span>{likesCount}</span>}
          <span style={{ fontWeight: 400, fontSize: 13 }}>{liked ? 'Curtiu' : 'Curtir'}</span>
        </button>
      </div>
    </div>
  )
}
