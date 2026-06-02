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
import fs                            from 'fs'
import path                          from 'path'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return new NextResponse('Acesso negado', { status: 403 })
  }

  const data = await getFullReportData()

  // Lê logo.png do diretório public e converte para base64
  let logoBase64: string | null = null
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    if (fs.existsSync(logoPath)) {
      logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
    }
  } catch { /* segue sem logo se não encontrar */ }

  const buffer = await renderToBuffer(
    React.createElement(BolaoReport, { data, logoBase64 }) as React.ReactElement<any>,
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
