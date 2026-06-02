/**
 * Documento PDF do Bolão Copa 2026 — Vendemmia.
 * Gerado server-side via @react-pdf/renderer.
 *
 * Cores da marca:
 *  #422c76  roxo Vendemmia (headers, bordas)
 *  #01E18E  verde neon     (destaques, top 3)
 *  #ff2f69  rosa           (alertas, avisos)
 *  #414042  cinza escuro   (texto principal)
 *  #faf9f5  off-white      (fundo da página)
 */

import {
  Document, Page, Text, View, Image,
  StyleSheet, Font,
} from '@react-pdf/renderer'
import type { FullReportData } from '@/lib/report-data'

// ─── Paleta ──────────────────────────────────────────────────────────────────

const C = {
  purple:    '#422c76',
  purpleLight: '#5a3e94',
  neon:      '#01E18E',
  pink:      '#ff2f69',
  gray:      '#414042',
  cream:     '#faf9f5',
  white:     '#ffffff',
  rowAlt:    '#f3f1f8',
  border:    '#e2dff0',
  muted:     '#8a7aaa',
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    paddingHorizontal: 40,
    paddingVertical:   40,
    backgroundColor:   C.cream,
    fontFamily:        'Helvetica',
    fontSize:          9,
    color:             C.gray,
  },

  // ── Header / Footer ──
  pageHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'flex-end',
    marginBottom:    20,
    paddingBottom:   10,
    borderBottomWidth: 2,
    borderBottomColor: C.purple,
  },
  pageFooter: {
    position:    'absolute',
    bottom:      25,
    left:        40,
    right:       40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize:    7,
    color:       C.muted,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop:  6,
  },

  // ── Cover ──
  coverPage: {
    justifyContent: 'center',
    alignItems:     'center',
    paddingVertical: 60,
  },
  coverBadge: {
    backgroundColor: C.purple,
    borderRadius:    4,
    paddingVertical:  4,
    paddingHorizontal: 16,
    marginBottom:    12,
  },
  coverBadgeText: {
    color:       C.cream,
    fontSize:    10,
    fontFamily:  'Helvetica',
    letterSpacing: 2,
  },
  coverTitle: {
    fontSize:    28,
    fontFamily:  'Helvetica-Bold',
    color:       C.gray,
    textAlign:   'center',
    marginBottom: 4,
  },
  coverSubtitle: {
    fontSize:    13,
    color:       C.muted,
    textAlign:   'center',
    marginBottom: 40,
  },
  coverDivider: {
    width:       80,
    height:      3,
    backgroundColor: C.neon,
    marginBottom: 40,
  },
  coverKpiGrid: {
    flexDirection: 'row',
    gap:           16,
    marginBottom:  40,
  },
  coverKpiCard: {
    flex:          1,
    backgroundColor: C.white,
    borderRadius:  6,
    padding:       14,
    alignItems:    'center',
    borderTopWidth: 3,
    borderTopColor: C.purple,
  },
  coverKpiValue: {
    fontSize:    20,
    fontFamily:  'Helvetica-Bold',
    color:       C.purple,
    marginBottom: 3,
  },
  coverKpiLabel: {
    fontSize:    7,
    color:       C.muted,
    textAlign:   'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  coverGenerated: {
    fontSize:    8,
    color:       C.muted,
    textAlign:   'center',
  },

  // ── Seções ──
  sectionTitle: {
    fontSize:      13,
    fontFamily:    'Helvetica-Bold',
    color:         C.purple,
    marginBottom:  10,
    paddingBottom:  6,
    borderBottomWidth: 1.5,
    borderBottomColor: C.neon,
  },

  // ── Tabelas ──
  tableHeader: {
    flexDirection:    'row',
    backgroundColor:  C.purple,
    paddingVertical:   5,
    paddingHorizontal: 6,
    borderRadius:      3,
    marginBottom:      1,
  },
  th: {
    color:       C.white,
    fontSize:    7,
    fontFamily:  'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection:    'row',
    paddingVertical:   4,
    paddingHorizontal: 6,
  },
  tableRowAlt: {
    backgroundColor: C.rowAlt,
  },
  td: {
    fontSize:    8,
    color:       C.gray,
  },
  tdBold: {
    fontSize:    8,
    fontFamily:  'Helvetica-Bold',
    color:       C.gray,
  },

  // ── Medalhas e badges ──
  medal1: { color: '#C9A227', fontFamily: 'Helvetica-Bold', fontSize: 9 },
  medal2: { color: '#808080', fontFamily: 'Helvetica-Bold', fontSize: 9 },
  medal3: { color: '#CD7F32', fontFamily: 'Helvetica-Bold', fontSize: 9 },

  neonText:  { color: C.neon,  fontFamily: 'Helvetica-Bold' },
  pinkText:  { color: C.pink,  fontFamily: 'Helvetica-Bold' },
  mutedText: { color: C.muted },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(d)
}

function posLabel(pos: number) {
  if (pos === 1) return '1º 🥇'
  if (pos === 2) return '2º 🥈'
  if (pos === 3) return '3º 🥉'
  return `${pos}º`
}

// ─── Cabeçalho de página ──────────────────────────────────────────────────────

function PageHeader({ title }: { title: string }) {
  return (
    <View style={S.pageHeader}>
      <View>
        <Text style={{ fontSize: 7, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>
          Vendemmia Comércio Internacional
        </Text>
        <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.purple, marginTop: 2 }}>
          {title}
        </Text>
      </View>
      <Text style={{ fontSize: 7, color: C.muted }}>
        Bolão Copa 2026
      </Text>
    </View>
  )
}

// ─── Rodapé de página ─────────────────────────────────────────────────────────

function PageFooter({ pageNum, generatedAt }: { pageNum: string; generatedAt: Date }) {
  return (
    <View style={S.pageFooter} fixed>
      <Text>Bolão Copa 2026 · Vendemmia · Documento Confidencial</Text>
      <Text>Gerado em {formatDate(generatedAt)} · Página {pageNum}</Text>
    </View>
  )
}

// ─── Página de capa ───────────────────────────────────────────────────────────

function CoverPage({ data, logoBase64 }: { data: FullReportData; logoBase64?: string | null }) {
  const { overview, tournament, generatedAt } = data

  const kpiRow1 = [
    { value: String(overview.totalUsers),          label: 'Participantes' },
    { value: `${overview.participationRate}%`,      label: 'Taxa de Adesão' },
  ]
  const kpiRow2 = [
    { value: overview.avgPoints.toFixed(1),         label: 'Pontuação Média' },
    { value: String(overview.maxPoints),            label: 'Pontuação Máxima' },
  ]

  return (
    <Page size="A4" style={[S.page, S.coverPage]}>

      {/* Faixa roxa superior decorativa */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 6,
        backgroundColor: C.purple,
      }} />

      {/* Faixa neon inferior decorativa */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
        backgroundColor: C.neon,
      }} />

      {/* Logo */}
      {logoBase64 ? (
        <Image
          src={logoBase64}
          style={{ width: 220, marginBottom: 28, objectFit: 'contain' }}
        />
      ) : (
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.purple }}>
            VENDEMMIA
          </Text>
        </View>
      )}

      {/* Badge */}
      <View style={S.coverBadge}>
        <Text style={S.coverBadgeText}>RELATÓRIO OFICIAL</Text>
      </View>

      {/* Título */}
      <Text style={S.coverTitle}>Bolão Copa do Mundo 2026</Text>
      <Text style={S.coverSubtitle}>Vendemmia Comércio Internacional</Text>

      {/* Divisor neon */}
      <View style={S.coverDivider} />

      {/* KPIs em 2×2 — evita truncamento por largura insuficiente */}
      <View style={{ width: '75%', marginBottom: 32, gap: 10 }}>
        {[kpiRow1, kpiRow2].map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row', gap: 10 }}>
            {row.map(kpi => (
              <View key={kpi.label} style={[S.coverKpiCard, { flex: 1 }]}>
                <Text style={S.coverKpiValue}>{kpi.value}</Text>
                <Text style={S.coverKpiLabel}>{kpi.label}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Resultado do torneio (se disponível) */}
      {(tournament.champion || tournament.topScorer) && (
        <View style={{
          backgroundColor: C.white, borderRadius: 6, padding: 16, width: '75%',
          borderLeftWidth: 4, borderLeftColor: C.neon, marginBottom: 28,
        }}>
          <Text style={{ fontSize: 8, color: C.muted, marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Helvetica-Bold' }}>
            Resultado Final do Torneio
          </Text>
          {tournament.champion  && (
            <Text style={{ fontSize: 10, marginBottom: 3 }}>
              Campeao: <Text style={S.neonText}>{tournament.champion}</Text>
            </Text>
          )}
          {tournament.runnerUp  && (
            <Text style={{ fontSize: 10, marginBottom: 3 }}>
              Vice-campeao: <Text style={S.tdBold}>{tournament.runnerUp}</Text>
            </Text>
          )}
          {tournament.topScorer && (
            <Text style={{ fontSize: 10 }}>
              Artilheiro: <Text style={S.tdBold}>{tournament.topScorer}</Text>
            </Text>
          )}
        </View>
      )}

      {/* Data de geração */}
      <Text style={S.coverGenerated}>
        Gerado em {formatDate(generatedAt)} · {data.ranking.length} participantes
      </Text>

      <PageFooter pageNum="1" generatedAt={generatedAt} />
    </Page>
  )
}

// ─── Ranking Individual ───────────────────────────────────────────────────────

const ROWS_PER_PAGE = 28

function RankingPages({ data }: { data: FullReportData }) {
  const { ranking, generatedAt } = data
  const pages = []

  for (let i = 0; i < ranking.length; i += ROWS_PER_PAGE) {
    const slice    = ranking.slice(i, i + ROWS_PER_PAGE)
    const pageNum  = Math.floor(i / ROWS_PER_PAGE) + 1
    const totalPgs = Math.ceil(ranking.length / ROWS_PER_PAGE)

    pages.push(
      <Page key={`rank-${i}`} size="A4" style={S.page}>
        <PageHeader title="Ranking Individual" />

        {pageNum === 1 && (
          <Text style={S.sectionTitle}>Classificação Individual</Text>
        )}

        {/* Cabeçalho da tabela */}
        <View style={S.tableHeader}>
          <Text style={[S.th, { width: '6%' }]}>#</Text>
          <Text style={[S.th, { width: '30%' }]}>Nome</Text>
          <Text style={[S.th, { width: '22%' }]}>Departamento</Text>
          <Text style={[S.th, { width: '14%', textAlign: 'right' }]}>Pontos</Text>
          <Text style={[S.th, { width: '14%', textAlign: 'right' }]}>Exatos</Text>
          <Text style={[S.th, { width: '14%', textAlign: 'right' }]}>Palpites</Text>
        </View>

        {slice.map((u, rowIdx) => {
          const isTop3  = u.position <= 3
          const isEven  = rowIdx % 2 === 0
          const posStyle = u.position === 1 ? S.medal1 : u.position === 2 ? S.medal2 : u.position === 3 ? S.medal3 : S.td

          return (
            <View
              key={u.id}
              style={[S.tableRow, isEven ? {} : S.tableRowAlt,
                isTop3 ? { borderLeftWidth: 2, borderLeftColor: C.neon } : {}]}
            >
              <Text style={[posStyle, { width: '6%' }]}>{u.position}º</Text>
              <Text style={[isTop3 ? S.tdBold : S.td, { width: '30%' }]}>{u.name}</Text>
              <Text style={[S.mutedText, S.td, { width: '22%' }]}>
                {u.department ?? '—'}
              </Text>
              <Text style={[isTop3 ? S.neonText : S.tdBold, { width: '14%', textAlign: 'right' }]}>
                {u.totalPoints}
              </Text>
              <Text style={[S.td, { width: '14%', textAlign: 'right' }]}>
                {u.exactCount > 0 ? `⚡ ${u.exactCount}` : '—'}
              </Text>
              <Text style={[S.td, { width: '14%', textAlign: 'right' }]}>
                {u.isPredictionLocked ? u.predictionCount : `${u.predictionCount}*`}
              </Text>
            </View>
          )
        })}

        <Text style={{ fontSize: 7, color: C.muted, marginTop: 4 }}>
          * Palpites não finalizados · Página {pageNum} de {totalPgs}
        </Text>

        <PageFooter pageNum={String(pageNum + 1)} generatedAt={generatedAt} />
      </Page>,
    )
  }

  return <>{pages}</>
}

// ─── Ranking por Departamento ─────────────────────────────────────────────────

function DeptRankingPage({ data }: { data: FullReportData }) {
  const { deptRanking, generatedAt, ranking } = data
  const totalPages = Math.ceil(ranking.length / ROWS_PER_PAGE) + 2

  return (
    <Page size="A4" style={S.page}>
      <PageHeader title="Ranking por Departamento" />
      <Text style={S.sectionTitle}>Classificação por Equipe</Text>

      <View style={S.tableHeader}>
        <Text style={[S.th, { width: '6%' }]}>#</Text>
        <Text style={[S.th, { width: '26%' }]}>Departamento</Text>
        <Text style={[S.th, { width: '12%', textAlign: 'center' }]}>Membros</Text>
        <Text style={[S.th, { width: '14%', textAlign: 'center' }]}>Finalizados</Text>
        <Text style={[S.th, { width: '12%', textAlign: 'center' }]}>Adesão</Text>
        <Text style={[S.th, { width: '14%', textAlign: 'right' }]}>Média pts</Text>
        <Text style={[S.th, { width: '16%' }]}>Líder</Text>
      </View>

      {deptRanking.map((dept, idx) => {
        const isTop3  = dept.position <= 3
        const isEven  = idx % 2 === 0
        const rateColor = dept.participationRate >= 80 ? C.neon :
                          dept.participationRate >= 50 ? '#d4a300' : C.pink

        return (
          <View
            key={dept.department}
            style={[S.tableRow, isEven ? {} : S.tableRowAlt,
              isTop3 ? { borderLeftWidth: 2, borderLeftColor: C.neon } : {}]}
          >
            <Text style={[isTop3 ? S.neonText : S.td, { width: '6%' }]}>
              {dept.position}º
            </Text>
            <Text style={[isTop3 ? S.tdBold : S.td, { width: '26%' }]}>
              {dept.department}
            </Text>
            <Text style={[S.td, { width: '12%', textAlign: 'center' }]}>
              {dept.totalMembers}
            </Text>
            <Text style={[S.td, { width: '14%', textAlign: 'center' }]}>
              {dept.lockedMembers}
            </Text>
            <Text style={[S.td, { width: '12%', textAlign: 'center', color: rateColor, fontFamily: 'Helvetica-Bold' }]}>
              {dept.participationRate}%
            </Text>
            <Text style={[S.tdBold, { width: '14%', textAlign: 'right' }]}>
              {dept.avgPoints.toFixed(1)}
            </Text>
            <Text style={[S.td, S.mutedText, { width: '16%' }]}>
              {dept.leader ? dept.leader.split(' ')[0] : '—'}
            </Text>
          </View>
        )
      })}

      <View style={{ marginTop: 12, padding: 10, backgroundColor: C.white, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: C.purple }}>
        <Text style={{ fontSize: 7, color: C.muted }}>
          Classificação por média de pontos de todos os membros (incluindo 0 pts para não participantes).
          Desempate: taxa de adesão → pontuação máxima individual.
        </Text>
      </View>

      <PageFooter pageNum={String(totalPages)} generatedAt={generatedAt} />
    </Page>
  )
}

// ─── Documento principal ──────────────────────────────────────────────────────

export function BolaoReport({ data, logoBase64 }: { data: FullReportData; logoBase64?: string | null }) {
  return (
    <Document
      title="Bolão Copa 2026 — Vendemmia"
      author="Vendemmia Comércio Internacional"
      subject="Relatório do Bolão Corporativo Copa do Mundo 2026"
      creator="Bolão Copa 2026 System"
    >
      <CoverPage data={data} logoBase64={logoBase64} />
      <RankingPages data={data} />
      <DeptRankingPage data={data} />
    </Document>
  )
}
