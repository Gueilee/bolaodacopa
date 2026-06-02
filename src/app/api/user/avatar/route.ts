export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/session'

const MAX_MB    = 5
const ALLOWED   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const formData = await request.formData()
  const file     = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: 'Use JPG, PNG, WebP ou GIF.' }, { status: 400 })
  if (file.size / 1024 / 1024 > MAX_MB)
    return NextResponse.json({ error: `Máximo ${MAX_MB}MB.` }, { status: 400 })

  const ext      = file.name.split('.').pop() ?? 'jpg'
  const filename = `avatars/${session.userId}.${ext}`

  const blob = await put(filename, file, { access: 'public', contentType: file.type, addRandomSuffix: false })

  await db.update(users)
    .set({ avatarUrl: blob.url, updatedAt: new Date() })
    .where(eq(users.id, session.userId))

  return NextResponse.json({ url: blob.url })
}
