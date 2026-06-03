export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { uploadToBlob } from '@/lib/azure-storage'

const MAX_SIZE_MB   = 10
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
  'video/mp4':  'mp4',
  'video/webm': 'webm',
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const formData = await request.formData()
  const file     = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: 'Tipo não suportado. Use JPG, PNG, GIF, WebP, MP4 ou WebM.' }, { status: 400 })
  if (file.size / 1024 / 1024 > MAX_SIZE_MB)
    return NextResponse.json({ error: `Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.` }, { status: 400 })

  const ext      = EXT_MAP[file.type] ?? 'jpg'
  const filename = `${Date.now()}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const blobPath = `mural/${session.userId}/${filename}`
  
  const url = await uploadToBlob(buffer, blobPath, file.type)
  const mediaType = file.type.startsWith('video/') ? 'video' : 'image'

  return NextResponse.json({ url, mediaType })
}
