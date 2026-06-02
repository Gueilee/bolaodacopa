export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getSession } from '@/lib/session'

const MAX_SIZE_MB = 10
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de arquivo não suportado. Use JPG, PNG, GIF, WebP ou MP4.' }, { status: 400 })
  }

  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > MAX_SIZE_MB) {
    return NextResponse.json({ error: `Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.` }, { status: 400 })
  }

  const ext      = file.name.split('.').pop()
  const filename = `mural/${session.userId}/${Date.now()}.${ext}`

  const blob = await put(filename, file, {
    access: 'public',
    contentType: file.type,
  })

  const mediaType = file.type.startsWith('video/') ? 'video' : 'image'

  return NextResponse.json({ url: blob.url, mediaType })
}
