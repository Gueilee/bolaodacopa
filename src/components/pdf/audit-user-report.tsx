/**
 * PDF de Auditoria Individual — Bolão Copa 2026
 * Documento oficial por colaborador: palpites x resultado real + bônus torneio.
 * Gerado server-side via @react-pdf/renderer.
 */

import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'

// Desabilita hifenização automática globalmente para este documento
Font.registerHyphenationCallback((word) => [word])
import type { AuditUserPrediction } from '@/lib/queries'

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  purple:  '#422c76',
  neon:    '#01E18E',
  pink:    '#ff2f69',
  gray:    '#414042',
  cream:   '#faf9f5',
  white:   '#ffffff',
  rowAlt:  '#f3f1f8',
  border:  '#e2dff0',
  muted:   '#8a7aaa',
  green:   '#065f46',
  greenBg: '#d1fae5',
  blue:    '#1e40af',
  blueBg:  '#dbeafe',
  red:     '#991b1b',
  redBg:   '#fee2e2',
  gold:    '#92400e',
  goldBg:  '#fef3c7',
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    paddingHorizontal: 38,
    paddingVertical:   38,
    paddingBottom:     55,
    backgroundColor:   C.cream,
    fontFamily:        'Helvetica',
    fontSize:          9,
    color:             C.gray,
  },
  pageHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: 18, paddingBottom: 8,
    borderBottomWidth: 2, borderBottomColor: C.purple,
  },
  pageFooter: {
    position: 'absolute', bottom: 22, left: 38, right: 38,
    flexDirection: 'row', justifyContent: 'space-between',
    fontSize: 7, color: C.muted,
    borderTopWidth: 0.5, borderTopColor: C.border, paddingTop: 5,
  },
  sectionTitle: {
    fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.purple,
    marginBottom: 8, paddingBottom: 4,
    borderBottomWidth: 1.5, borderBottomColor: C.neon,
  },
  tableHeader: {
    flexDirection: 'row', backgroundColor: C.purple,
    paddingVertical: 5, paddingHorizontal: 4,
    borderRadius: 3, marginBottom: 1,
  },
  th: { color: C.white, fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.4 },
  row: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 4 },
  td: { fontSize: 8, color: C.gray },
  tdBold: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gray },
  mutedTd: { fontSize: 8, color: C.muted },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'America/Sao_Paulo' })
}
function fmtFull(d: Date) {
  return new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
  })
}
function ptsColor(pts: number, isScored: boolean) {
  if (!isScored) return C.muted
  if (pts === 10) return C.green
  if (pts >= 5)   return C.blue
  return C.red
}
function ptsBg(pts: number, isScored: boolean) {
  if (!isScored) return C.rowAlt
  if (pts === 10) return C.greenBg
  if (pts >= 5)   return C.blueBg
  return C.redBg
}
function ptsLabel(pts: number, isScored: boolean) {
  if (!isScored) return 'pendente'
  if (pts === 10) return 'Exato  10 pts'
  if (pts === 7)  return 'Saldo   7 pts'
  if (pts === 5)  return 'Venc.   5 pts'
  return 'Erro    0 pts'
}

const PHASE_LABELS: Record<string, string> = {
  group:        'Fase de Grupos',
  round_of_32:  'Rodada de 32',
  round_of_16:  'Oitavas de Final',
  quarter_final:'Quartas de Final',
  semi_final:   'Semifinais',
  third_place:  '3º Lugar',
  final:        'Final',
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type AuditPdfUser = {
  id:          string
  name:        string
  email:       string
  department:  string | null
  totalPoints: number
  rankPosition: number
  totalRanked:  number
  isPredictionLocked: boolean
}

export type AuditPdfTournament = {
  userChampion:  string | null
  userRunnerUp:  string | null
  userTopScorer: string | null
  realChampion:  string | null
  realRunnerUp:  string | null
  realTopScorer: string | null
  bonusPoints:   number
  isScored:      boolean
}

export type AuditPdfData = {
  user:        AuditPdfUser
  predictions: AuditUserPrediction[]
  tournament:  AuditPdfTournament
  generatedAt: Date
  logoBase64:  string | null
}

// ─── Cabeçalho / rodapé ───────────────────────────────────────────────────────

function PageHeader({ user }: { user: AuditPdfUser }) {
  return (
    <View style={S.pageHeader}>
      <View>
        <Text style={{ fontSize: 7, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>
          Vendemmia · Bolão Copa do Mundo 2026
        </Text>
        <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.purple, marginTop: 2 }}>
          Auditoria de Palpites — {user.name}
        </Text>
      </View>
      <Text style={{ fontSize: 7, color: C.muted }}>DOCUMENTO OFICIAL</Text>
    </View>
  )
}

function PageFooter({ generatedAt, pageNum }: { generatedAt: Date; pageNum: string }) {
  return (
    <View style={S.pageFooter} fixed>
      <Text>Bolão Copa 2026 · Vendemmia · Documento Oficial de Auditoria</Text>
      <Text>Gerado em {fmtFull(generatedAt)} · Pág. {pageNum}</Text>
    </View>
  )
}

// ─── Capa ─────────────────────────────────────────────────────────────────────

function CoverPage({ data }: { data: AuditPdfData }) {
  const { user, predictions, tournament, generatedAt, logoBase64 } = data
  const scored  = predictions.filter(p => p.isScored)
  const exact   = scored.filter(p => p.points === 10).length
  const winner  = scored.filter(p => p.points === 5 || p.points === 7).length
  const miss    = scored.filter(p => p.points === 0).length
  const pending = predictions.filter(p => !p.isScored).length
  const total   = predictions.length

  return (
    <Page size="A4" style={[S.page, { justifyContent: 'flex-start', alignItems: 'center', paddingTop: 50 }]}>
      {/* Faixa topo */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, backgroundColor: C.purple }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: C.neon }} />

      {/* Logo */}
      {logoBase64 ? (
        <Image src={logoBase64} style={{ width: 200, marginBottom: 28, objectFit: 'contain' }} />
      ) : (
        <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.purple, marginBottom: 28 }}>VENDEMMIA</Text>
      )}

      {/* Badge */}
      <View style={{ backgroundColor: C.purple, borderRadius: 4, paddingVertical: 4, paddingHorizontal: 18, marginBottom: 14 }}>
        <Text style={{ color: C.cream, fontSize: 9, fontFamily: 'Helvetica-Bold', letterSpacing: 2, textTransform: 'uppercase' }}>
          Auditoria Oficial
        </Text>
      </View>

      <Text style={{ fontSize: 22, fontFamily: 'Helvetica-Bold', color: C.gray, textAlign: 'center', marginBottom: 4 }}>
        Bolão Copa do Mundo 2026
      </Text>
      <Text style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginBottom: 6 }}>
        Vendemmia Comércio Internacional
      </Text>

      {/* Divisor */}
      <View style={{ width: 60, height: 3, backgroundColor: C.neon, marginBottom: 28 }} />

      {/* Card do colaborador */}
      <View style={{
        width: '80%', backgroundColor: C.white, borderRadius: 8, padding: 18,
        borderLeftWidth: 5, borderLeftColor: C.purple, marginBottom: 24,
        borderWidth: 1, borderColor: C.border,
      }}>
        <Text style={{ fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
          Colaborador
        </Text>
        <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.purple, marginBottom: 3 }}>
          {user.name}
        </Text>
        <Text style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>
          {user.department ?? 'Sem departamento'} · {user.email}
        </Text>
        <Text style={{ fontSize: 9, color: C.gray, marginTop: 4 }}>
          Posição no ranking: <Text style={{ fontFamily: 'Helvetica-Bold' }}>
            {user.rankPosition}º de {user.totalRanked}
          </Text>
          {' · '}Status: <Text style={{ fontFamily: 'Helvetica-Bold', color: user.isPredictionLocked ? C.green : C.gold }}>
            {user.isPredictionLocked ? 'Palpites finalizados' : 'Palpites em aberto'}
          </Text>
        </Text>
      </View>

      {/* KPIs */}
      <View style={{ flexDirection: 'row', gap: 8, width: '80%', marginBottom: 24 }}>
        {[
          { label: 'Pontos',    value: String(user.totalPoints), color: C.purple },
          { label: 'Exatos',   value: String(exact),            color: C.green  },
          { label: 'Vencedor', value: String(winner),           color: C.blue   },
          { label: 'Erros',    value: String(miss),             color: C.red    },
          { label: 'Pendentes',value: String(pending),          color: C.gold   },
          { label: 'Palpites', value: String(total),            color: C.gray   },
        ].map(k => (
          <View key={k.label} style={{
            flex: 1, backgroundColor: C.white, borderRadius: 6, padding: 10,
            alignItems: 'center', borderTopWidth: 3, borderTopColor: k.color,
            borderWidth: 1, borderColor: C.border,
          }}>
            <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: k.color, marginBottom: 3 }}>
              {k.value}
            </Text>
            <Text style={{ fontSize: 7, color: C.muted, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {k.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Palpite do torneio resumido */}
      {tournament.userChampion && (
        <View style={{
          width: '80%', backgroundColor: C.white, borderRadius: 6, padding: 14,
          borderLeftWidth: 4, borderLeftColor: C.neon, marginBottom: 20,
          borderWidth: 1, borderColor: C.border,
        }}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
            Palpite Final do Torneio
            {tournament.isScored ? `  ·  +${tournament.bonusPoints} pts bônus` : '  ·  aguardando resultado final'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {[
              { label: 'Campeao',    pred: tournament.userChampion,  real: tournament.realChampion  },
              { label: 'Vice',       pred: tournament.userRunnerUp,  real: tournament.realRunnerUp  },
              { label: 'Artilheiro', pred: tournament.userTopScorer, real: tournament.realTopScorer },
            ].map(item => {
              const hit = item.real && item.pred?.trim().toLowerCase() === item.real?.trim().toLowerCase()
              return (
                <View key={item.label} style={{ flex: 1 }}>
                  <Text style={{ fontSize: 7, color: C.muted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</Text>
                  <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.purple }}>
                    {item.pred ?? '—'}
                  </Text>
                  {item.real && (
                    <Text style={{ fontSize: 7, color: hit ? C.green : C.muted, marginTop: 2 }}>
                      {hit ? 'Acertou!' : `Real: ${item.real}`}
                    </Text>
                  )}
                </View>
              )
            })}
          </View>
        </View>
      )}

      <Text style={{ fontSize: 8, color: C.muted, textAlign: 'center' }}>
        Gerado em {fmtFull(generatedAt)}
      </Text>

      <PageFooter generatedAt={generatedAt} pageNum="1" />
    </Page>
  )
}

// ─── Tabela de palpites por fase ──────────────────────────────────────────────

const ROWS_PER_PAGE = 22

function PredictionPages({ data }: { data: AuditPdfData }) {
  const { user, predictions, generatedAt } = data

  // Agrupar por fase
  const phaseOrder: Record<string, number> = {
    group: 1, round_of_32: 2, round_of_16: 3,
    quarter_final: 4, semi_final: 5, third_place: 6, final: 7,
  }
  const phaseMap = new Map<string, AuditUserPrediction[]>()
  for (const p of predictions) {
    if (!phaseMap.has(p.phase)) phaseMap.set(p.phase, [])
    phaseMap.get(p.phase)!.push(p)
  }
  const phases = [...phaseMap.keys()].sort((a, b) => (phaseOrder[a] ?? 9) - (phaseOrder[b] ?? 9))

  // Achatar em rows com separadores de fase
  type Row = { type: 'phase'; label: string } | { type: 'pred'; pred: AuditUserPrediction }
  const rows: Row[] = []
  for (const ph of phases) {
    rows.push({ type: 'phase', label: PHASE_LABELS[ph] ?? ph })
    for (const p of phaseMap.get(ph)!) rows.push({ type: 'pred', pred: p })
  }

  // Paginar
  const pages: React.ReactElement[] = []
  let rowIdx = 0
  let pageNum = 2

  while (rowIdx < rows.length) {
    const slice = rows.slice(rowIdx, rowIdx + ROWS_PER_PAGE)
    rowIdx += ROWS_PER_PAGE

    pages.push(
      <Page key={`pred-${pageNum}`} size="A4" style={S.page}>
        <PageHeader user={user} />

        {pageNum === 2 && (
          <Text style={S.sectionTitle}>Histórico Completo de Palpites vs Resultados Reais</Text>
        )}

        {/* Cabeçalho da tabela */}
        <View style={S.tableHeader}>
          <Text style={[S.th, { width: '5%' }]}>#</Text>
          <Text style={[S.th, { width: '24%' }]}>Partida</Text>
          <Text style={[S.th, { width: '9%' }]}>Data</Text>
          <Text style={[S.th, { width: '12%', textAlign: 'center' }]}>Resultado</Text>
          <Text style={[S.th, { width: '12%', textAlign: 'center' }]}>Palpite</Text>
          <Text style={[S.th, { width: '12%', textAlign: 'center' }]}>Diferença</Text>
          <Text style={[S.th, { width: '12%', textAlign: 'center' }]}>Pts</Text>
          <Text style={[S.th, { width: '14%', textAlign: 'center' }]}>Status</Text>
        </View>

        {slice.map((row, i) => {
          if (row.type === 'phase') {
            return (
              <View key={`ph-${i}`} style={{
                backgroundColor: C.purple + '18',
                paddingVertical: 4, paddingHorizontal: 4,
                marginTop: 4, marginBottom: 1, borderRadius: 2,
              }}>
                <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.purple, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  {row.label}
                </Text>
              </View>
            )
          }

          const p = row.pred
          const isAlt = i % 2 === 0
          const isExact = p.isScored && p.homeScore !== null && p.predHome === p.homeScore && p.predAway === p.awayScore
          const diffH = p.isScored && p.homeScore !== null ? p.predHome - p.homeScore : null
          const diffA = p.isScored && p.awayScore !== null ? p.predAway - p.awayScore : null
          const diffStr = diffH === null ? '—'
            : diffH === 0 && diffA === 0 ? '✓ exato'
            : `${diffH > 0 ? '+' : ''}${diffH} / ${diffA! > 0 ? '+' : ''}${diffA}`

          return (
            <View key={`row-${i}`} style={[
              S.row,
              isAlt && !isExact ? { backgroundColor: C.rowAlt } : {},
              isExact ? { backgroundColor: C.greenBg } : {},
            ]}>
              <Text style={[S.mutedTd, { width: '5%' }]}>{p.matchNumber}</Text>
              <Text style={[S.tdBold, { width: '24%' }]}>
                {`${p.homeTeam} × ${p.awayTeam}`.slice(0, 28)}
              </Text>
              <Text style={[S.mutedTd, { width: '9%' }]}>{fmtDate(p.matchDate)}</Text>
              <Text style={[S.tdBold, { width: '12%', textAlign: 'center' }]}>
                {p.status === 'finished' && p.homeScore !== null
                  ? `${p.homeScore} × ${p.awayScore}`
                  : '–'}
              </Text>
              <Text style={[{ width: '12%', textAlign: 'center', fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.purple }]}>
                {p.predHome} × {p.predAway}
              </Text>
              <Text style={[{ width: '12%', textAlign: 'center', fontSize: 8,
                color: diffH === 0 && diffA === 0 ? C.green : C.muted }]}>
                {diffStr}
              </Text>
              <Text style={[{ width: '12%', textAlign: 'center', fontSize: 8,
                fontFamily: 'Helvetica-Bold', color: ptsColor(p.points, p.isScored) }]}>
                {p.isScored ? p.points : '–'}
              </Text>
              <View style={{ width: '14%', alignItems: 'center' }}>
                <View style={{
                  backgroundColor: ptsBg(p.points, p.isScored),
                  borderRadius: 10, paddingVertical: 2, paddingHorizontal: 6,
                }}>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: ptsColor(p.points, p.isScored) }}>
                    {ptsLabel(p.points, p.isScored)}
                  </Text>
                </View>
              </View>
            </View>
          )
        })}

        <PageFooter generatedAt={generatedAt} pageNum={String(pageNum)} />
      </Page>
    )
    pageNum++
  }

  return <>{pages}</>
}

// ─── Página de torneio + validação ────────────────────────────────────────────

function TournamentPage({ data }: { data: AuditPdfData }) {
  const { user, tournament, predictions, generatedAt } = data
  const scored = predictions.filter(p => p.isScored)
  const exact  = scored.filter(p => p.points === 10).length
  const winner = scored.filter(p => p.points === 5 || p.points === 7).length
  const miss   = scored.filter(p => p.points === 0).length
  const matchPts = scored.reduce((s, p) => s + p.points, 0)

  const tournamentItems = [
    { label: 'Campeao',       pred: tournament.userChampion,  real: tournament.realChampion,  pts: 50 },
    { label: 'Vice-Campeao',  pred: tournament.userRunnerUp,  real: tournament.realRunnerUp,  pts: 25 },
    { label: 'Artilheiro',    pred: tournament.userTopScorer, real: tournament.realTopScorer, pts: 50 },
  ]

  const lastPage = Math.max(2, Math.ceil(predictions.length / ROWS_PER_PAGE) + 1) + 1

  return (
    <Page size="A4" style={S.page}>
      <PageHeader user={user} />

      {/* Palpite Final do Torneio */}
      <Text style={[S.sectionTitle, { marginTop: 0 }]}>Palpite Final do Torneio</Text>

      <View style={S.tableHeader}>
        {['Categoria', 'Palpite do Colaborador', 'Resultado Real', 'Bônus', 'Resultado'].map((h, i) => (
          <Text key={h} style={[S.th, { flex: [1.2, 2, 2, 0.8, 1.2][i] }]}>{h}</Text>
        ))}
      </View>

      {tournamentItems.map((item, i) => {
        const isAlt = i % 2 === 0
        const hit = item.real && item.pred?.trim().toLowerCase() === item.real?.trim().toLowerCase()
        const applicable = !!item.real
        return (
          <View key={item.label} style={[S.row, isAlt ? {} : { backgroundColor: C.rowAlt }, hit ? { backgroundColor: C.greenBg } : {}]}>
            <Text style={[S.tdBold, { flex: 1.2 }]}>{item.label}</Text>
            <Text style={[{ flex: 2, fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.purple }]}>
              {item.pred ?? '—'}
            </Text>
            <Text style={[S.td, { flex: 2 }]}>{item.real ?? 'Aguardando'}</Text>
            <Text style={[S.td, { flex: 0.8, textAlign: 'center' }]}>+{item.pts}</Text>
            <View style={{ flex: 1.2, alignItems: 'flex-start' }}>
              {applicable ? (
                <View style={{ backgroundColor: hit ? C.greenBg : C.redBg, borderRadius: 10, paddingVertical: 2, paddingHorizontal: 6 }}>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: hit ? C.green : C.red }}>
                    {hit ? 'Acertou' : 'Errou'}
                  </Text>
                </View>
              ) : (
                <Text style={[S.mutedTd]}>Pendente</Text>
              )}
            </View>
          </View>
        )
      })}

      {/* Bônus total */}
      {tournament.isScored && (
        <View style={{
          marginTop: 8, padding: 10, backgroundColor: C.white, borderRadius: 4,
          borderLeftWidth: 3, borderLeftColor: C.neon, flexDirection: 'row', alignItems: 'center',
        }}>
          <Text style={{ flex: 1, fontSize: 9, color: C.gray }}>
            Bônus total do torneio
          </Text>
          <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.neon }}>
            +{tournament.bonusPoints} pts
          </Text>
        </View>
      )}

      {/* Resumo final de pontuação */}
      <Text style={[S.sectionTitle, { marginTop: 18 }]}>Resumo Final de Pontuação</Text>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Pts Partidas', value: matchPts,                                              color: C.purple },
          { label: 'Bonus Torneio',value: tournament.isScored ? tournament.bonusPoints : '–',   color: C.neon   },
          { label: 'TOTAL GERAL',  value: user.totalPoints,                                      color: C.purple, big: true },
          { label: 'Exatos',       value: exact,                                                 color: C.green  },
          { label: 'Vencedores',   value: winner,                                                color: C.blue   },
          { label: 'Erros',        value: miss,                                                  color: C.red    },
        ].map(k => (
          <View key={k.label} style={{
            flex: 1, backgroundColor: C.white, borderRadius: 6, padding: 10,
            alignItems: 'center', borderTopWidth: (k as {big?: boolean}).big ? 4 : 2, borderTopColor: k.color,
            borderWidth: 1, borderColor: C.border,
          }}>
            <Text style={{ fontSize: (k as {big?: boolean}).big ? 20 : 16, fontFamily: 'Helvetica-Bold', color: k.color, marginBottom: 3 }}>
              {k.value}
            </Text>
            <Text style={{ fontSize: 7, color: C.muted, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {k.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Posição no Ranking */}
      <View style={{
        padding: 14, backgroundColor: C.purple, borderRadius: 8,
        flexDirection: 'row', alignItems: 'center', marginBottom: 18,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.cream, fontSize: 11, fontFamily: 'Helvetica-Bold' }}>
            {user.name}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 8, marginTop: 2 }}>
            {user.department ?? 'Sem departamento'} · {user.email}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: C.neon, fontSize: 24, fontFamily: 'Helvetica-Bold', lineHeight: 1 }}>
            {user.rankPosition}º
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 7 }}>
            de {user.totalRanked} participantes
          </Text>
        </View>
      </View>

      {/* Carimbo de validação */}
      <View style={{
        borderWidth: 1.5, borderColor: C.border, borderRadius: 8,
        padding: 14, marginBottom: 10,
      }}>
        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Validação e Autenticidade
        </Text>
        <Text style={{ fontSize: 8, color: C.muted, lineHeight: 1.5 }}>
          Este documento foi gerado automaticamente pelo sistema do Bolão Copa 2026 da Vendemmia
          Comércio Internacional e reflete fielmente os palpites registrados pelo colaborador
          identificado acima, bem como os resultados oficiais das partidas da Copa do Mundo FIFA 2026.
        </Text>
        <Text style={{ fontSize: 8, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
          Os dados foram extraídos diretamente do banco de dados em {fmtFull(generatedAt)}.
          Qualquer divergência deve ser reportada ao administrador do sistema.
        </Text>

        {/* Linha de assinatura */}
        <View style={{ flexDirection: 'row', marginTop: 24, gap: 20 }}>
          {['Administrador do Bolão', 'Colaborador', 'RH Vendemmia'].map(l => (
            <View key={l} style={{ flex: 1 }}>
              <View style={{ borderBottomWidth: 0.75, borderBottomColor: C.gray, marginBottom: 4 }} />
              <Text style={{ fontSize: 7, color: C.muted, textAlign: 'center' }}>{l}</Text>
            </View>
          ))}
        </View>
      </View>

      <PageFooter generatedAt={generatedAt} pageNum={String(lastPage)} />
    </Page>
  )
}

// ─── Documento ────────────────────────────────────────────────────────────────

export function AuditUserReport({ data }: { data: AuditPdfData }) {
  return (
    <Document
      title={`Auditoria Bolão Copa 2026 — ${data.user.name}`}
      author="Vendemmia Comércio Internacional"
      subject="Documento Oficial de Auditoria de Palpites"
      creator="Bolão Copa 2026 System"
    >
      <CoverPage data={data} />
      <PredictionPages data={data} />
      <TournamentPage data={data} />
    </Document>
  )
}
