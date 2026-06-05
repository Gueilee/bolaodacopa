/**
 * GET /api/admin/audit-pdf?userId=xxx
 * Gera o PDF de auditoria individual de um colaborador.
 * Restrito a administradores.
 */
export const runtime = 'nodejs'

import { NextRequest, NextResponse }          from 'next/server'
import { renderToBuffer }                     from '@react-pdf/renderer'
import React                                  from 'react'
import fs                                     from 'fs'
import path                                   from 'path'
import { getSession }                         from '@/lib/session'
import { getAuditByUser, getRanking }         from '@/lib/queries'
import { db }                                 from '@/lib/db'
import { users, tournamentPredictions, settings } from '@/db/schema'
import { eq, inArray }                        from 'drizzle-orm'
import { AuditUserReport }                    from '@/components/pdf/audit-user-report'
import type { AuditPdfData }                  from '@/components/pdf/audit-user-report'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || (session.role !== 'admin' && session.role !== 'rh')) {
    return new NextResponse('Acesso negado', { status: 403 })
  }

  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return new NextResponse('userId obrigatório', { status: 400 })

  // ── Busca paralela de todos os dados necessários ──────────────────────────
  const [user, predictions, ranking, tournamentBet, tournamentSettings] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, name: true, email: true, department: true, totalPoints: true, isPredictionLocked: true },
    }),
    getAuditByUser(userId),
    getRanking(),
    db.query.tournamentPredictions.findFirst({
      where: eq(tournamentPredictions.userId, userId),
    }),
    db.select().from(settings).where(
      inArray(settings.key, ['champion', 'runner_up', 'top_scorer'])
    ),
  ])

  if (!user) return new NextResponse('Usuário não encontrado', { status: 404 })

  // Posição no ranking
  const rankEntry   = ranking.find(r => r.id === userId)
  const rankPosition = rankEntry?.position ?? ranking.length + 1
  const totalRanked  = ranking.length

  // Resultado real do torneio
  const settingsMap = Object.fromEntries(tournamentSettings.map(s => [s.key, s.value]))
  const realChampion  = settingsMap['champion']   ?? null
  const realRunnerUp  = settingsMap['runner_up']  ?? null
  const realTopScorer = settingsMap['top_scorer'] ?? null
  const tournamentScored = !!(realChampion || realRunnerUp || realTopScorer)

  // Logo base64
  let logoBase64: string | null = null
  try {
    const p = path.join(process.cwd(), 'public', 'logo2.png')
    if (fs.existsSync(p)) logoBase64 = `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`
  } catch { /* segue sem logo */ }

  const data: AuditPdfData = {
    user: {
      id:           user.id,
      name:         user.name,
      email:        user.email,
      department:   user.department,
      totalPoints:  user.totalPoints,
      rankPosition,
      totalRanked,
      isPredictionLocked: user.isPredictionLocked,
    },
    predictions,
    tournament: {
      userChampion:  tournamentBet?.champion  ?? null,
      userRunnerUp:  tournamentBet?.runnerUp  ?? null,
      userTopScorer: tournamentBet?.topScorer ?? null,
      realChampion,
      realRunnerUp,
      realTopScorer,
      bonusPoints:   tournamentBet?.bonusPoints ?? 0,
      isScored:      tournamentBet?.isScored ?? false,
    },
    generatedAt: new Date(),
    logoBase64,
  }

  const buffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(AuditUserReport, { data }) as React.ReactElement<any>,
  )

  const safeName = user.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const date     = new Date().toISOString().slice(0, 10)
  const filename = `auditoria-bolao-2026-${safeName}-${date}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control':       'no-store',
    },
  })
}
