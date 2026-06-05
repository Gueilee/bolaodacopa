import { getSession }            from '@/lib/session'
import { redirect }              from 'next/navigation'
import { phaseLabels }           from '@/lib/utils'
import {
  getAuditMatchSummaries,
  getAuditByMatch,
  getAuditUsers,
  getAuditByUser,
} from '@/lib/queries'
import { db }       from '@/lib/db'
import { matches, users } from '@/db/schema'
import { eq }       from 'drizzle-orm'

export const revalidate = 0

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo',
  })
}

function pointsColor(pts: number, isScored: boolean) {
  if (!isScored) return { bg: '#f5f2ef', txt: '#8a8490' }
  if (pts === 10) return { bg: '#d1fae5', txt: '#065f46' }
  if (pts === 7)  return { bg: '#fef9c3', txt: '#713f12' }
  if (pts >= 5)   return { bg: '#dbeafe', txt: '#1e40af' }
  return { bg: '#fee2e2', txt: '#991b1b' }
}

function pointsLabel(pts: number, isScored: boolean) {
  if (!isScored) return '–'
  if (pts === 10) return '⚡ 10'
  if (pts === 7)  return '🎯 7'
  if (pts >= 5)   return '✓ 5'
  return '✗ 0'
}

function AccuracyBar({ exact, winner, miss, noBet }: { exact: number; winner: number; miss: number; noBet: number }) {
  const total = exact + winner + miss + noBet
  if (total === 0) return null
  const pct = (n: number) => `${((n / total) * 100).toFixed(0)}%`
  return (
    <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 1 }}>
      {exact  > 0 && <div style={{ width: pct(exact),  background: '#10b981', borderRadius: 3 }} title={`Exato: ${exact}`} />}
      {winner > 0 && <div style={{ width: pct(winner), background: '#3b82f6', borderRadius: 3 }} title={`Vencedor: ${winner}`} />}
      {miss   > 0 && <div style={{ width: pct(miss),   background: '#ef4444', borderRadius: 3 }} title={`Erro: ${miss}`} />}
      {noBet  > 0 && <div style={{ width: pct(noBet),  background: '#e5e7eb', borderRadius: 3 }} title={`Sem palpite: ${noBet}`} />}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type Props = { searchParams: Promise<Record<string, string | undefined>> }

export default async function AuditoriaPage({ searchParams }: Props) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const params  = await searchParams
  const view    = params.view ?? 'matches'
  const matchId = params.matchId
  const userId  = params.userId

  // ── Visão detalhe: palpites de uma partida ─────────────────────────────────
  if (matchId) {
    const [match, preds] = await Promise.all([
      db.query.matches.findFirst({ where: eq(matches.id, matchId) }),
      getAuditByMatch(matchId),
    ])
    if (!match) redirect('/admin/auditoria')

    const exact  = preds.filter(p => p.points === 10).length
    const winner = preds.filter(p => p.points === 5 || p.points === 7).length
    const miss   = preds.filter(p => p.points === 0 && p.isScored).length

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in" style={{ paddingBottom: 40 }}>
        <a href="/admin/auditoria" style={{ fontSize: 13, color: '#8a8490', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          ← Voltar à auditoria
        </a>

        {/* Cabeçalho da partida */}
        <div className="card p-5">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {match.groupName ?? phaseLabels[match.phase] ?? match.phase} · {fmtDate(match.matchDate)}
              </span>
              <h2 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#1a1625' }}>
                {match.homeTeam} <span style={{ color: '#422c76' }}>{match.homeScore} × {match.awayScore}</span> {match.awayTeam}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Total palpites', value: preds.length, color: '#422c76' },
                { label: '⚡ Exatos',     value: exact,          color: '#065f46' },
                { label: '✓ Vencedor',   value: winner,         color: '#1e40af' },
                { label: '✗ Erros',      value: miss,           color: '#991b1b' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '8px 14px', borderRadius: 10, background: '#f5f2ef' }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: s.color }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#8a8490' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <AccuracyBar exact={exact} winner={winner} miss={miss} noBet={0} />
        </div>

        {/* Tabela de palpites */}
        <div className="card overflow-hidden" style={{ padding: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0ede8', display: 'grid', gridTemplateColumns: '1fr 100px 80px 70px', gap: 8 }}>
            {['Colaborador', 'Palpite', 'Resultado', 'Pontos'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
            ))}
          </div>
          {preds.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#aaa8b0', fontSize: 13 }}>
              Nenhum palpite registrado para esta partida.
            </div>
          ) : (
            preds.map(p => {
              const { bg, txt } = pointsColor(p.points, p.isScored)
              const isExact = p.isScored && p.predHome === match.homeScore && p.predAway === match.awayScore
              return (
                <div key={p.userId} style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 80px 70px',
                  gap: 8, padding: '11px 16px', borderBottom: '1px solid #f0ede8',
                  alignItems: 'center',
                  background: isExact ? '#f0fdf4' : undefined,
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1625' }}>{p.userName}</span>
                    {p.department && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: '#aaa8b0' }}>{p.department}</span>
                    )}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#422c76', fontVariantNumeric: 'tabular-nums' }}>
                    {p.predHome} × {p.predAway}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1625', fontVariantNumeric: 'tabular-nums' }}>
                    {match.homeScore} × {match.awayScore}
                  </span>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                    fontSize: 12, fontWeight: 700, background: bg, color: txt,
                    textAlign: 'center',
                  }}>
                    {pointsLabel(p.points, p.isScored)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // ── Visão detalhe: palpites de um usuário ─────────────────────────────────
  if (userId) {
    const [user, preds] = await Promise.all([
      db.query.users.findFirst({ where: eq(users.id, userId), columns: { id: true, name: true, department: true, totalPoints: true } }),
      getAuditByUser(userId),
    ])
    if (!user) redirect('/admin/auditoria?view=users')

    const scored  = preds.filter(p => p.isScored)
    const exact   = scored.filter(p => p.points === 10).length
    const winner  = scored.filter(p => p.points === 5 || p.points === 7).length
    const miss    = scored.filter(p => p.points === 0).length
    const pending = preds.filter(p => !p.isScored).length

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in" style={{ paddingBottom: 40 }}>
        <a href="/admin/auditoria?view=users" style={{ fontSize: 13, color: '#8a8490', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          ← Voltar à lista de colaboradores
        </a>

        <div className="card p-5">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {user.department ?? 'Sem departamento'}
              </span>
              <h2 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#1a1625' }}>{user.name}</h2>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Pontos',     value: user.totalPoints, color: '#422c76' },
                { label: '⚡ Exatos',  value: exact,            color: '#065f46' },
                { label: '✓ Vencedor',value: winner,           color: '#1e40af' },
                { label: '✗ Erros',   value: miss,             color: '#991b1b' },
                { label: '⏳ Aguard.', value: pending,          color: '#92400e' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '8px 14px', borderRadius: 10, background: '#f5f2ef' }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: s.color }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 10, color: '#8a8490' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card overflow-hidden" style={{ padding: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0ede8', display: 'grid', gridTemplateColumns: '2fr 80px 80px 80px 70px', gap: 8 }}>
            {['Partida', 'Resultado', 'Palpite', 'Diferença', 'Pontos'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
            ))}
          </div>

          {preds.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#aaa8b0', fontSize: 13 }}>
              Nenhum palpite registrado.
            </div>
          ) : (
            preds.map(p => {
              const { bg, txt } = pointsColor(p.points, p.isScored)
              const diffHome = p.isScored && p.homeScore !== null ? p.predHome - p.homeScore : null
              const diffAway = p.isScored && p.awayScore !== null ? p.predAway - p.awayScore : null
              const hasDiff  = diffHome !== null && diffAway !== null

              return (
                <div key={p.matchId} style={{
                  display: 'grid', gridTemplateColumns: '2fr 80px 80px 80px 70px',
                  gap: 8, padding: '11px 16px', borderBottom: '1px solid #f0ede8',
                  alignItems: 'center',
                  background: p.isScored && p.points === 10 ? '#f0fdf4' : undefined,
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#1a1625' }}>
                      {p.homeTeam} × {p.awayTeam}
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa8b0', marginTop: 1 }}>
                      {p.groupName ? `${p.groupName} · ` : ''}{fmtDate(p.matchDate)}
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1625', fontVariantNumeric: 'tabular-nums' }}>
                    {p.status === 'finished' && p.homeScore !== null ? `${p.homeScore}×${p.awayScore}` : '–'}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#422c76', fontVariantNumeric: 'tabular-nums' }}>
                    {p.predHome}×{p.predAway}
                  </span>
                  <span style={{ fontSize: 12, color: hasDiff && diffHome === 0 && diffAway === 0 ? '#065f46' : '#8a8490', fontVariantNumeric: 'tabular-nums' }}>
                    {hasDiff
                      ? (diffHome === 0 && diffAway === 0 ? '✓ exato' : `${diffHome! > 0 ? '+' : ''}${diffHome} / ${diffAway! > 0 ? '+' : ''}${diffAway}`)
                      : '–'}
                  </span>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                    fontSize: 12, fontWeight: 700, background: bg, color: txt, textAlign: 'center',
                  }}>
                    {pointsLabel(p.points, p.isScored)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // ── Visão lista de colaboradores ───────────────────────────────────────────
  if (view === 'users') {
    const auditUsers = await getAuditUsers()

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in" style={{ paddingBottom: 40 }}>
        <AuditHeader view="users" />

        <div className="card overflow-hidden" style={{ padding: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0ede8', display: 'grid', gridTemplateColumns: '2fr 70px 60px 60px 60px 70px', gap: 8 }}>
            {['Colaborador', 'Pontos', '⚡ Exato', '✓ Venc.', '✗ Erro', ''].map((h, i) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
            ))}
          </div>
          {auditUsers.map((u, idx) => (
            <div key={u.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 70px 60px 60px 60px 70px',
              gap: 8, padding: '11px 16px', borderBottom: '1px solid #f0ede8', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa8b0', minWidth: 20 }}>#{idx + 1}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1625' }}>{u.name}</div>
                  {u.department && <div style={{ fontSize: 11, color: '#aaa8b0' }}>{u.department}</div>}
                </div>
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#422c76', fontVariantNumeric: 'tabular-nums' }}>{u.totalPoints}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#065f46' }}>{u.exactCount}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1e40af' }}>{u.winnerCount}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#991b1b' }}>{u.missCount}</span>
              <a href={`/admin/auditoria?userId=${u.id}`} style={{
                display: 'inline-block', padding: '5px 12px', borderRadius: 20,
                fontSize: 11, fontWeight: 700, background: '#f0ede8', color: '#422c76',
                textDecoration: 'none', textAlign: 'center',
              }}>
                Ver →
              </a>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Visão padrão: lista de jogos encerrados ────────────────────────────────
  const summaries = await getAuditMatchSummaries()

  // Agrupa por fase
  const phaseMap = new Map<string, typeof summaries>()
  for (const m of summaries) {
    if (!phaseMap.has(m.phase)) phaseMap.set(m.phase, [])
    phaseMap.get(m.phase)!.push(m)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in" style={{ paddingBottom: 40 }}>
      <AuditHeader view="matches" />

      {summaries.length === 0 ? (
        <div className="card p-8 text-center">
          <p style={{ fontSize: 32, marginBottom: 8 }}>⏳</p>
          <p style={{ fontSize: 14, color: '#8a8490' }}>Nenhuma partida encerrada ainda.</p>
          <p style={{ fontSize: 12, color: '#aaa8b0', marginTop: 4 }}>Os dados de auditoria aparecerão aqui após o início da Copa.</p>
        </div>
      ) : (
        [...phaseMap.entries()].map(([phase, phaseMatches]) => (
          <section key={phase} className="space-y-2">
            <h2 style={{ fontSize: 11, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px 4px' }}>
              {phaseLabels[phase] ?? phase}
            </h2>
            <div className="card overflow-hidden" style={{ padding: 0 }}>
              {/* Cabeçalho */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0ede8', display: 'grid', gridTemplateColumns: '2fr 90px 60px 60px 60px 50px 60px', gap: 8 }}>
                {['Partida', 'Resultado', '⚡ Exato', '✓ Venc.', '✗ Erro', '—', ''].map((h, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
                ))}
              </div>

              {phaseMatches.map(m => (
                <div key={m.id}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '2fr 90px 60px 60px 60px 50px 60px',
                    gap: 8, padding: '12px 16px', borderBottom: '1px solid #f5f2ef', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1625' }}>
                        {m.homeTeam} × {m.awayTeam}
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa8b0', marginTop: 2 }}>
                        {m.groupName ? `${m.groupName} · ` : ''}{fmtDate(m.matchDate)}
                        <AccuracyBar exact={m.exact} winner={m.winner} miss={m.miss} noBet={m.noBet} />
                      </div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#422c76', fontVariantNumeric: 'tabular-nums' }}>
                      {m.homeScore} × {m.awayScore}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#065f46' }}>{m.exact}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1e40af' }}>{m.winner}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#991b1b' }}>{m.miss}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#aaa8b0' }}>{m.noBet}</span>
                    <a href={`/admin/auditoria?matchId=${m.id}`} style={{
                      display: 'inline-block', padding: '5px 12px', borderRadius: 20,
                      fontSize: 11, fontWeight: 700, background: '#f0ede8', color: '#422c76',
                      textDecoration: 'none', textAlign: 'center',
                    }}>
                      Ver →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}

// ─── Header compartilhado com as duas abas ─────────────────────────────────

function AuditHeader({ view }: { view: 'matches' | 'users' }) {
  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #150820 0%, #1a0a2e 60%, #0a1840 100%)',
        borderRadius: 20, padding: '20px 24px', marginBottom: 16, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -10, width: 120, height: 120,
          background: 'radial-gradient(circle, rgba(66,44,118,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 22 }}>🔍</span>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#faf9f5' }}>
              Auditoria de Palpites
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Compare resultados reais com os palpites de cada colaborador
          </p>
        </div>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { href: '/admin/auditoria',           label: '⚽ Por Jogo',          v: 'matches' },
          { href: '/admin/auditoria?view=users', label: '👤 Por Colaborador',   v: 'users'   },
        ].map(tab => (
          <a key={tab.v} href={tab.href} style={{
            padding: '9px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700,
            textDecoration: 'none',
            background: view === tab.v ? '#422c76' : '#f5f2ef',
            color:      view === tab.v ? 'white' : '#6b6672',
            transition: 'all 0.15s',
          }}>
            {tab.label}
          </a>
        ))}
      </div>
    </div>
  )
}
