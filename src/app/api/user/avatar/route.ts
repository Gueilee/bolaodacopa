export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { uploadToBlob } from '@/lib/azure-storage'

const MAX_MB  = 5
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Erro ao ler o arquivo enviado.' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file)                          return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
  if (!ALLOWED.includes(file.type))   return NextResponse.json({ error: 'Use JPG, PNG, WebP ou GIF.' }, { status: 400 })
  if (file.size / 1024 / 1024 > MAX_MB) return NextResponse.json({ error: `Máximo ${MAX_MB}MB.` }, { status: 400 })

  const ext      = EXT_MAP[file.type] ?? 'jpg'
  const filename = `${session.userId}.${ext}`
  const buffer   = Buffer.from(await file.arrayBuffer())
  const blobPath = `avatars/${filename}`

  let url: string
  try {
    const uploadUrl = await uploadToBlob(buffer, blobPath, file.type)
    url = `${uploadUrl}?v=${Date.now()}`
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[avatar upload] Erro no Azure Blob:', msg)
    return NextResponse.json({ error: `Erro no upload: ${msg}` }, { status: 500 })
  }

  await db.update(users)
    .set({ avatarUrl: url, updatedAt: new Date() })
    .where(eq(users.id, session.userId))

  return NextResponse.json({ url })
}
