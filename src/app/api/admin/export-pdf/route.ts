/**
 * GET /api/admin/export-pdf
 * Gera e faz download do relatório completo em PDF.
 *
 * Usa @react-pdf/renderer (Node.js runtime — não funciona em Edge).
 * Requer: pnpm add @react-pdf/renderer
 */

export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer }            from '@react-pdf/renderer'
import { getSession }                from '@/lib/session'
import { getFullReportData }         from '@/lib/report-data'
import { BolaoReport }               from '@/components/pdf/bolao-report'
import React                         from 'react'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return new NextResponse('Acesso negado', { status: 403 })
  }

  const data = await getFullReportData()

  const buffer = await renderToBuffer(
    React.createElement(BolaoReport, { data }) as React.ReactElement<any>,
  )

  const filename = `bolao-copa-2026-${new Date().toISOString().slice(0, 10)}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control':       'no-store',
    },
  })
}
