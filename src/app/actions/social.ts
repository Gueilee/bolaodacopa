'use server'

import { db } from '@/lib/db'
import { socialPosts, socialLikes, users } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export type PostWithUser = {
  id: string
  content: string | null
  mediaUrl: string | null
  mediaType: 'image' | 'video' | 'text'
  likesCount: number
  createdAt: Date
  userName: string
  userRole: string
  likedByMe: boolean
}

export async function getSocialPosts(): Promise<PostWithUser[]> {
  const session = await getSession()
  if (!session) return []

  const posts = await db.query.socialPosts.findMany({
    orderBy: [desc(socialPosts.createdAt)],
    with: {
      user: { columns: { name: true, role: true } },
      likes: { columns: { userId: true } },
    },
    limit: 50,
  })

  return posts.map((p) => ({
    id:         p.id,
    content:    p.content,
    mediaUrl:   p.mediaUrl,
    mediaType:  p.mediaType,
    likesCount: p.likesCount,
    createdAt:  p.createdAt,
    userName:   p.user.name,
    userRole:   p.user.role,
    likedByMe:  p.likes.some((l) => l.userId === session.userId),
  }))
}

export async function createPost(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Não autenticado.' }

  const content   = (formData.get('content') as string)?.trim() || null
  const mediaUrl  = (formData.get('mediaUrl') as string)?.trim() || null
  const mediaType = (formData.get('mediaType') as 'image' | 'video' | 'text') || 'text'

  if (!content && !mediaUrl) {
    return { success: false, error: 'Escreva algo ou adicione uma mídia.' }
  }

  await db.insert(socialPosts).values({
    userId: session.userId,
    content,
    mediaUrl,
    mediaType,
  })

  revalidatePath('/dashboard/mural')
  return { success: true }
}

export async function toggleLike(postId: string): Promise<{ success: boolean; liked: boolean }> {
  const session = await getSession()
  if (!session) return { success: false, liked: false }

  const existing = await db.query.socialLikes.findFirst({
    where: and(
      eq(socialLikes.userId, session.userId),
      eq(socialLikes.postId, postId),
    ),
  })

  if (existing) {
    await db.delete(socialLikes).where(
      and(eq(socialLikes.userId, session.userId), eq(socialLikes.postId, postId)),
    )
    await db.update(socialPosts)
      .set({ likesCount: Math.max(0, (await db.query.socialPosts.findFirst({ where: eq(socialPosts.id, postId) }))!.likesCount - 1) })
      .where(eq(socialPosts.id, postId))
    revalidatePath('/dashboard/mural')
    return { success: true, liked: false }
  } else {
    await db.insert(socialLikes).values({ userId: session.userId, postId })
    const post = await db.query.socialPosts.findFirst({ where: eq(socialPosts.id, postId) })
    await db.update(socialPosts)
      .set({ likesCount: (post?.likesCount ?? 0) + 1 })
      .where(eq(socialPosts.id, postId))
    revalidatePath('/dashboard/mural')
    return { success: true, liked: true }
  }
}

export async function deletePost(postId: string): Promise<{ success: boolean }> {
  const session = await getSession()
  if (!session) return { success: false }

  const post = await db.query.socialPosts.findFirst({ where: eq(socialPosts.id, postId) })
  if (!post) return { success: false }

  // Só dono ou admin podem deletar
  if (post.userId !== session.userId && session.role !== 'admin') {
    return { success: false }
  }

  await db.delete(socialPosts).where(eq(socialPosts.id, postId))
  revalidatePath('/dashboard/mural')
  return { success: true }
}
