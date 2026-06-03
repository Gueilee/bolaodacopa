/**
 * Rota que serve arquivos estáticos da pasta public/ e data/uploads/.
 * Necessária em ambientes Docker/standalone onde o servidor Next.js
 * não expõe automaticamente a pasta public/ via HTTP.
 */

export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import fs   from 'fs'
import path from 'path'

const MIME: Record<string, string> = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params
  const relative = segments.join('/')

  // Tenta public/ primeiro, depois data/uploads/
  const candidates = [
    path.join(process.cwd(), 'public',       relative),
    path.join(process.cwd(), 'data', 'uploads', relative),
  ]

  // Segurança: impede path traversal
  const roots = [
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'data', 'uploads'),
  ]

  let filePath: string | null = null
  for (const candidate of candidates) {
    const rootMatch = roots.some(r => candidate.startsWith(r + path.sep) || candidate === r)
    if (rootMatch && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      filePath = candidate
      break
    }
  }

  if (!filePath) {
    return new NextResponse('Not found', { status: 404 })
  }

  const ext         = path.extname(filePath).toLowerCase()
  const contentType = MIME[ext] ?? 'application/octet-stream'
  const buffer      = fs.readFileSync(filePath)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':  contentType,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  })
}
