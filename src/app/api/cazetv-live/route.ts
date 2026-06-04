/**
 * Busca o video ID atual ao vivo da CazéTV sem precisar do channel ID.
 * Tenta múltiplas estratégias e retorna o video ID para embed.
 */

import { NextResponse } from 'next/server'

// Channel ID correto da CazéTV (atualizar se necessário)
// Obter em: youtube.com/@CazeTV → Ctrl+U → pesquisar "externalId"
const CAZETV_CHANNEL_ID = process.env.CAZETV_CHANNEL_ID ?? ''

// Cache em memória (30 min)
let cached: { videoId: string | null; ts: number } = { videoId: null, ts: 0 }
const CACHE_TTL = 30 * 60 * 1000

export const dynamic = 'force-dynamic'

export async function GET() {
  const now = Date.now()

  // Cache ainda válido
  if (now - cached.ts < CACHE_TTL && cached.videoId !== null) {
    return NextResponse.json({ videoId: cached.videoId, source: 'cache' })
  }

  let videoId: string | null = null

  // ── Estratégia 1: RSS feed do canal (se tiver channel ID) ─────────────────
  if (CAZETV_CHANNEL_ID.startsWith('UC')) {
    try {
      const rssRes = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${CAZETV_CHANNEL_ID}`,
        { next: { revalidate: 0 } }
      )
      if (rssRes.ok) {
        const xml  = await rssRes.text()
        const vids = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)]
        if (vids.length > 0) {
          // Retorna o vídeo mais recente (provavelmente a live)
          videoId = vids[0][1]
        }
      }
    } catch { /* ignora */ }
  }

  // ── Estratégia 2: Scrape da página /live do canal ─────────────────────────
  if (!videoId) {
    try {
      const liveRes = await fetch('https://www.youtube.com/@CazeTV/live', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
        next: { revalidate: 0 },
      })
      if (liveRes.ok) {
        const html = await liveRes.text()
        // Extrai video ID da URL canônica ou do player config
        const match =
          html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/) ||
          html.match(/watch\?v=([a-zA-Z0-9_-]{11})/)
        if (match) videoId = match[1]
      }
    } catch { /* ignora */ }
  }

  // Atualiza cache
  cached = { videoId, ts: now }

  return NextResponse.json({
    videoId,
    channelId: CAZETV_CHANNEL_ID || null,
    source:    videoId ? 'live' : 'none',
  })
}
