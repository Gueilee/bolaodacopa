/**
 * Proxy de imagens do Azure Blob Storage (container privado).
 * Busca o blob autenticado com a access key e entrega ao browser.
 * Uso: /api/blob/bolaodacopa/avatars/userId.jpg
 */

export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'

const ACCOUNT   = process.env.AZURE_STORAGE_ACCOUNT   ?? 'vdmgueileeprodstorage'
const CONTAINER = process.env.AZURE_STORAGE_CONTAINER ?? 'filescontainer'
const KEY       = process.env.BLOB_READ_WRITE_TOKEN    ?? ''

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png',  gif: 'image/gif',
  webp: 'image/webp', svg: 'image/svg+xml',
  mp4: 'video/mp4',  webm: 'video/webm',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params
  const blobPath = segments.join('/')

  if (!KEY) return new NextResponse('Storage not configured', { status: 503 })

  try {
    const credential = new StorageSharedKeyCredential(ACCOUNT, KEY)
    const service    = new BlobServiceClient(`https://${ACCOUNT}.blob.core.windows.net`, credential)
    const blob       = service.getContainerClient(CONTAINER).getBlobClient(blobPath)

    const download = await blob.download()
    if (!download.readableStreamBody) return new NextResponse('Not found', { status: 404 })

    const chunks: Uint8Array[] = []
    for await (const chunk of download.readableStreamBody as AsyncIterable<Uint8Array>) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    const ext         = blobPath.split('.').pop()?.toLowerCase() ?? ''
    const contentType = MIME[ext] ?? 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':  contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    })
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode === 404 ? 404 : 500
    return new NextResponse('Not found', { status })
  }
}
