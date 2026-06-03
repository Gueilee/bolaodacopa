export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import fs   from 'fs'
import path from 'path'

const MAX_MB  = 5
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
}

// Salva em /data/uploads/avatars/ (volume montado no Docker)
// e serve via /api/static/uploads/avatars/<file>
const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads', 'avatars')

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

  fs.mkdirSync(UPLOAD_DIR, { recursive: true })

  const ext      = EXT_MAP[file.type] ?? 'jpg'
  const filename = `${session.userId}.${ext}`
  const filePath = path.join(UPLOAD_DIR, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  fs.writeFileSync(filePath, buffer)

  // URL pública via rota /api/static
  const url = `/api/static/uploads/avatars/${filename}`

  await db.update(users)
    .set({ avatarUrl: url, updatedAt: new Date() })
    .where(eq(users.id, session.userId))

  return NextResponse.json({ url })
}
