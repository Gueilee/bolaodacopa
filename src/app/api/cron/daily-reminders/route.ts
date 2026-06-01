/**
 * Cron: lembrete diário de palpites pendentes.
 *
 * Roda diariamente às 09:00 Brasília (12:00 UTC) durante o período pré-Copa.
 * Após a Copa começar (11/Jun), roda somente enquanto ainda houver palpites abertos.
 *
 * Schedule em vercel.json: "0 12 * * *"
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendDailyReminders }        from '@/lib/notifications'
import { isWhatsAppConfigured }      from '@/lib/whatsapp'

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret && process.env.NODE_ENV !== 'production') return true
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isWhatsAppConfigured()) {
    return NextResponse.json({
      skipped: true,
      reason:  'WhatsApp não configurado (ZAPI_INSTANCE_ID ausente).',
    })
  }

  console.log('[cron/daily-reminders] iniciando envio de lembretes...')
  const start  = Date.now()
  const result = await sendDailyReminders()

  console.log(
    `[cron/daily-reminders] ${result.sent} enviados, ` +
    `${result.skipped} ignorados, ${result.failed} falhas — ${Date.now() - start}ms`,
  )

  return NextResponse.json({ ...result, durationMs: Date.now() - start })
}
