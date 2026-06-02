'use server'

import { db } from '@/lib/db'
import { socialPosts, socialLikes, socialComments, users } from '@/db/schema'
import { eq, and, desc, asc } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export type PostWithUser = {
  id:            string
  content:       string | null
  mediaUrl:      string | null
  mediaType:     'image' | 'video' | 'text'
  likesCount:    number
  commentsCount: number
  createdAt:     Date
  userName:      string
  userRole:      string
  likedByMe:     boolean
}

export type CommentItem = {
  id:        string
  content:   string
  createdAt: Date
  userName:  string
  userId:    string
  isMe:      boolean
  isAdmin:   boolean
}

const REVALIDATE = '/dashboard/mural'

// ─── Listar posts ─────────────────────────────────────────────────────────────

export async function getSocialPosts(): Promise<PostWithUser[]> {
  const session = await getSession()
  if (!session) return []

  const posts = await db.query.socialPosts.findMany({
    orderBy: [desc(socialPosts.createdAt)],
    with: {
      user:  { columns: { name: true, role: true } },
      likes: { columns: { userId: true } },
    },
    limit: 50,
  })

  return posts.map((p) => ({
    id:            p.id,
    content:       p.content,
    mediaUrl:      p.mediaUrl,
    mediaType:     p.mediaType,
    likesCount:    p.likesCount,
    commentsCount: p.commentsCount,
    createdAt:     p.createdAt,
    userName:      p.user.name,
    userRole:      p.user.role,
    likedByMe:     p.likes.some((l) => l.userId === session.userId),
  }))
}

// ─── Criar post ───────────────────────────────────────────────────────────────

export async function createPost(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Não autenticado.' }

  const content   = (formData.get('content') as string)?.trim() || null
  const mediaUrl  = (formData.get('mediaUrl') as string)?.trim() || null
  const mediaType = (formData.get('mediaType') as 'image' | 'video' | 'text') || 'text'

  if (!content && !mediaUrl) return { success: false, error: 'Escreva algo ou adicione uma mídia.' }

  await db.insert(socialPosts).values({ userId: session.userId, content, mediaUrl, mediaType })
  revalidatePath(REVALIDATE)
  return { success: true }
}

// ─── Curtir / descurtir ───────────────────────────────────────────────────────

export async function toggleLike(postId: string): Promise<{ success: boolean; liked: boolean }> {
  const session = await getSession()
  if (!session) return { success: false, liked: false }

  const existing = await db.query.socialLikes.findFirst({
    where: and(eq(socialLikes.userId, session.userId), eq(socialLikes.postId, postId)),
  })

  const post = await db.query.socialPosts.findFirst({ where: eq(socialPosts.id, postId) })
  if (!post) return { success: false, liked: false }

  if (existing) {
    await db.delete(socialLikes).where(
      and(eq(socialLikes.userId, session.userId), eq(socialLikes.postId, postId)),
    )
    await db.update(socialPosts)
      .set({ likesCount: Math.max(0, post.likesCount - 1) })
      .where(eq(socialPosts.id, postId))
    revalidatePath(REVALIDATE)
    return { success: true, liked: false }
  } else {
    await db.insert(socialLikes).values({ userId: session.userId, postId })
    await db.update(socialPosts)
      .set({ likesCount: post.likesCount + 1 })
      .where(eq(socialPosts.id, postId))
    revalidatePath(REVALIDATE)
    return { success: true, liked: true }
  }
}

// ─── Deletar post ─────────────────────────────────────────────────────────────

export async function deletePost(postId: string): Promise<{ success: boolean }> {
  const session = await getSession()
  if (!session) return { success: false }

  const post = await db.query.socialPosts.findFirst({ where: eq(socialPosts.id, postId) })
  if (!post) return { success: false }
  if (post.userId !== session.userId && session.role !== 'admin') return { success: false }

  await db.delete(socialPosts).where(eq(socialPosts.id, postId))
  revalidatePath(REVALIDATE)
  return { success: true }
}

// ─── Listar comentários de um post ────────────────────────────────────────────

export async function getPostComments(postId: string): Promise<CommentItem[]> {
  const session = await getSession()
  if (!session) return []

  const rows = await db.query.socialComments.findMany({
    where:   eq(socialComments.postId, postId),
    orderBy: [asc(socialComments.createdAt)],
    with: {
      user: { columns: { name: true, role: true } },
    },
  })

  return rows.map((c) => ({
    id:        c.id,
    content:   c.content,
    createdAt: c.createdAt,
    userName:  c.user.name,
    userId:    c.userId,
    isMe:      c.userId === session.userId,
    isAdmin:   c.user.role === 'admin',
  }))
}

// ─── Criar comentário ─────────────────────────────────────────────────────────

export async function createComment(
  postId:  string,
  content: string,
): Promise<{ success: boolean; comment?: CommentItem; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Não autenticado.' }

  const text = content.trim()
  if (!text)          return { success: false, error: 'Comentário vazio.' }
  if (text.length > 300) return { success: false, error: 'Máximo 300 caracteres.' }

  const post = await db.query.socialPosts.findFirst({ where: eq(socialPosts.id, postId) })
  if (!post) return { success: false, error: 'Post não encontrado.' }

  const [inserted] = await db.insert(socialComments)
    .values({ postId, userId: session.userId, content: text })
    .returning()

  await db.update(socialPosts)
    .set({ commentsCount: post.commentsCount + 1 })
    .where(eq(socialPosts.id, postId))

  revalidatePath(REVALIDATE)

  const me = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: { name: true, role: true },
  })

  return {
    success: true,
    comment: {
      id:        inserted.id,
      content:   inserted.content,
      createdAt: inserted.createdAt,
      userName:  me?.name ?? session.name,
      userId:    session.userId,
      isMe:      true,
      isAdmin:   me?.role === 'admin',
    },
  }
}

// ─── Deletar comentário ───────────────────────────────────────────────────────

export async function deleteComment(commentId: string): Promise<{ success: boolean }> {
  const session = await getSession()
  if (!session) return { success: false }

  const comment = await db.query.socialComments.findFirst({
    where: eq(socialComments.id, commentId),
  })
  if (!comment) return { success: false }
  if (comment.userId !== session.userId && session.role !== 'admin') return { success: false }

  await db.delete(socialComments).where(eq(socialComments.id, commentId))

  const post = await db.query.socialPosts.findFirst({ where: eq(socialPosts.id, comment.postId) })
  if (post) {
    await db.update(socialPosts)
      .set({ commentsCount: Math.max(0, post.commentsCount - 1) })
      .where(eq(socialPosts.id, comment.postId))
  }

  revalidatePath(REVALIDATE)
  return { success: true }
}
