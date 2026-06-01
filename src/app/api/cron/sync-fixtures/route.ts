/**
 * Rota cron para sincronização automática de resultados.
 *
 * Chamada a cada 15 minutos pela Vercel Cron (vercel.json).
 * O Vercel envia automaticamente o header: Authorization: Bearer CRON_SECRET
 *
 * Pode também ser invocada manualmente pelo painel admin via POST /api/admin/sync.
 *
 * Consumo de API:
 *  - 1 request por invocação (GET /fixtures?league=1&season=2026)
 *  - A cada 15 min = 96 req/dia → dentro do plano free (100 req/dia)
 *  - Verificação de rate limit: header x-ratelimit-requests-remaining
 */

import { NextRequest, NextResponse } from 'next/server'
import { syncFixtures } from '@/lib/sync-fixtures'

// ─── Proteção via CRON_SECRET ─────────────────────────────────────────────────

function isAuthorized(request: NextRequest): boolean {
  const auth   = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret) {
    // Em desenvolvimento sem secret configurado, permite (log de aviso)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[cron] CRON_SECRET não configurado — permitindo em dev')
      return true
    }
    return false
  }

  return auth === `Bearer ${secret}`
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[cron/sync-fixtures] iniciando sync...')
  const start = Date.now()

  try {
    const result = await syncFixtures()
    const ms     = Date.now() - start

    console.log(
      `[cron/sync-fixtures] ok — ${result.matchesUpdated} atualizadas, ` +
      `${result.predictionsScored} palpites pontuados, ` +
      `saldo API: ${result.rateLimitDaily ?? '?'} req/dia — ${ms}ms`,
    )

    return NextResponse.json({ ...result, durationMs: ms })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cron/sync-fixtures] erro:', msg)

    return NextResponse.json(
      { error: msg, syncedAt: new Date().toISOString() },
      { status: 500 },
    )
  }
}
