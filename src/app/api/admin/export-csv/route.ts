/**
 * GET /api/admin/export-csv?type=ranking|departamentos|completo|pendentes|palpites
 *
 * Rota unificada de exportação CSV.
 * Separador: ; (compatível com Excel pt-BR)
 * Encoding: UTF-8 com BOM (acentos no Excel)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession }                from '@/lib/session'
import { getFullReportData }         from '@/lib/report-data'

const BOM = '﻿'

function csvRow(cells: (string | number | null | undefined)[]): string {
  return cells
    .map((c) => {
      const val = c === null || c === undefined ? '' : String(c)
      return val.includes(';') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val
    })
    .join(';')
}

function buildCsv(header: string[], rows: (string | number | null)[][]): string {
  return [header.join(';'), ...rows.map(csvRow)].join('\n')
}

// ─── Tipos de relatório ───────────────────────────────────────────────────────

type ReportType = 'ranking' | 'departamentos' | 'completo' | 'pendentes'

function getConfig(type: ReportType) {
  const configs: Record<ReportType, { filename: string; label: string }> = {
    ranking:       { filename: 'ranking-individual',    label: 'Ranking Individual' },
    departamentos: { filename: 'ranking-departamentos', label: 'Ranking por Departamento' },
    completo:      { filename: 'participacao-completa', label: 'Participação Completa' },
    pendentes:     { filename: 'pendentes-sem-registro',label: 'Pendentes sem Registro' },
  }
  return configs[type] ?? configs.ranking
}

// ─── Builders de CSV por tipo ─────────────────────────────────────────────────

function buildRankingCsv(data: Awaited<ReturnType<typeof getFullReportData>>): string {
  const header = ['Posição', 'Nome', 'E-mail', 'Departamento', 'Pontos', 'Placares Exatos', 'Palpites', 'Finalizado']
  const rows = data.ranking.map((u) => [
    u.position,
    u.name,
    u.email,
    u.department ?? 'Sem Departamento',
    u.totalPoints,
    u.exactCount,
    u.predictionCount,
    u.isPredictionLocked ? 'Sim' : 'Não',
  ])
  return buildCsv(header, rows)
}

function buildDeptCsv(data: Awaited<ReturnType<typeof getFullReportData>>): string {
  const header = ['Posição', 'Departamento', 'Membros', 'Finalizados', 'Taxa de Participação (%)', 'Média de Pontos', 'Pontuação Máxima', 'Líder']
  const rows = data.deptRanking.map((d) => [
    d.position,
    d.department,
    d.totalMembers,
    d.lockedMembers,
    `${d.participationRate}%`,
    d.avgPoints.toFixed(1),
    d.maxPoints,
    d.leader ?? '—',
  ])
  return buildCsv(header, rows)
}

function buildCompletoCsv(data: Awaited<ReturnType<typeof getFullReportData>>): string {
  const header = [
    'Posição', 'Nome', 'E-mail', 'Departamento',
    'Finalizado', 'Pontos', 'Placares Exatos',
    'Palpites Registrados', 'WhatsApp Opt-in',
  ]
  const rows = data.ranking.map((u) => [
    u.position,
    u.name,
    u.email,
    u.department ?? 'Sem Departamento',
    u.isPredictionLocked ? 'Sim' : 'Não',
    u.totalPoints,
    u.exactCount,
    u.predictionCount,
    '—', // campo whatsapp — não exposto neste relatório por privacidade
  ])
  return buildCsv(header, rows)
}

function buildPendentesCsv(data: Awaited<ReturnType<typeof getFullReportData>>): string {
  const header = ['Nome', 'E-mail', 'Departamento', 'Palpites Iniciados', 'Status']
  const rows = data.pendingUsers.map((u) => [
    u.name,
    u.email,
    u.department ?? 'Sem Departamento',
    u.betCount,
    u.betCount > 0 ? 'Iniciou mas não finalizou' : 'Sem nenhum palpite',
  ])
  return buildCsv(header, rows)
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return new NextResponse('Acesso negado', { status: 403 })
  }

  const type = (request.nextUrl.searchParams.get('type') ?? 'ranking') as ReportType
  const cfg  = getConfig(type)
  const data = await getFullReportData()

  let csv: string
  switch (type) {
    case 'departamentos': csv = buildDeptCsv(data);      break
    case 'completo':      csv = buildCompletoCsv(data);  break
    case 'pendentes':     csv = buildPendentesCsv(data); break
    default:              csv = buildRankingCsv(data);   break
  }

  const date     = new Date().toISOString().slice(0, 10)
  const filename = `bolao-copa-2026-${cfg.filename}-${date}.csv`

  return new NextResponse(BOM + csv, {
    status: 200,
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control':       'no-store',
    },
  })
}
