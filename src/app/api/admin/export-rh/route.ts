/**
 * GET /api/admin/export-rh
 * Retorna um arquivo CSV com todos os dados de participação para planilha de premiação.
 * Restrito a administradores (verificação via JWT session).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getCsvExportData } from '@/lib/hr-analytics'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return new NextResponse('Acesso negado', { status: 403 })
  }

  const rows = await getCsvExportData()

  // Cabeçalho CSV (compatível com Excel pt-BR usando ; como separador)
  const header = [
    'Nome',
    'E-mail',
    'Departamento',
    'Finalizou Palpites',
    'Data de Finalização',
    'Palpites Registrados',
    'Pontos Atuais',
    'Placares Exatos',
  ].join(';')

  const csvRows = rows.map((r) =>
    [
      `"${r.nome}"`,
      `"${r.email}"`,
      `"${r.departamento}"`,
      r.finalizado,
      `"${r.finalizadoEm}"`,
      r.palpites,
      r.pontosAtuais,
      r.placarExatos,
    ].join(';'),
  )

  const csv = [header, ...csvRows].join('\n')

  // BOM UTF-8 para Excel abrir corretamente com acentos
  const bom = '﻿'

  return new NextResponse(bom + csv, {
    status: 200,
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bolao-copa-2026-rh-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control':       'no-store',
    },
  })
}
