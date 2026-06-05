import { getSession }       from '@/lib/session'
import { redirect }         from 'next/navigation'
import { getUnitRanking, getMyUnitStatus, getUnitMeta } from '@/lib/unit-ranking'
import Link                 from 'next/link'

export const revalidate = 60
export const metadata   = { title: 'Ranking por Unidade | Bolão Copa 2026' }

// ─── Medalhas e cores de posição ──────────────────────────────────────────────

const MEDAL = ['🥇', '🥈', '🥉']

const POS_STYLE: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: 'linear-gradient(135deg,#fffbea,#fef9c3)', border: '#f59e0b', text: '#92400e' },
  2: { bg: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', border: '#94a3b8', text: '#475569' },
  3: { bg: 'linear-gradient(135deg,#fff7ed,#ffedd5)', border: '#f97316', text: '#9a3412' },
}

// ─── Pódio 3D ─────────────────────────────────────────────────────────────────

function Podium({ top3 }: { top3: Awaited<ReturnType<typeof getUnitRanking>> }) {
  const order  = [top3[1], top3[0], top3[2]].filter(Boolean) // 2º, 1º, 3º
  const heights = [top3[1] ? 100 : 0, 140, top3[2] ? 80 : 0]
  const idxMap  = [1, 0, 2] // posição real de cada slot visual

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, paddingBottom: 8 }}>
      {order.map((entry, vi) => {
        if (!entry) return null
        const realIdx = idxMap[vi]
        const h       = heights[vi]
        const meta    = getUnitMeta(entry.unit)
        return (
          <div key={entry.unit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 160 }}>
            {/* Info acima do pódio */}
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 28 }}>{MEDAL[entry.position - 1]}</span>
              <p style={{ margin: '4px 0 2px', fontSize: 14, fontWeight: 800, color: '#1a1625' }}>
                {meta.icon} {entry.unit}
              </p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: meta.color }}>
                {entry.avgPoints.toFixed(1)} pts <span style={{ fontSize: 10, fontWeight: 500, color: '#aaa8b0' }}>média</span>
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8a8490' }}>
                {entry.totalMembers} participantes
              </p>
            </div>
            {/* Bloco do pódio */}
            <div style={{
              width: '100%', height: h,
              background: `linear-gradient(180deg, ${meta.color}22 0%, ${meta.color}44 100%)`,
              border: `2px solid ${meta.color}55`,
              borderRadius: '10px 10px 0 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: meta.color, opacity: 0.5 }}>
                {entry.position}º
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Card de unidade ──────────────────────────────────────────────────────────

function UnitCard({ entry, isMyUnit }: {
  entry: Awaited<ReturnType<typeof getUnitRanking>>[number]
  isMyUnit: boolean
}) {
  const meta   = getUnitMeta(entry.unit)
  const style  = POS_STYLE[entry.position]
  const barW   = Math.min(100, entry.avgPoints > 0 ? (entry.avgPoints / 20) * 100 : 2)

  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      border: isMyUnit ? `2px solid ${meta.color}` : '1px solid rgba(0,0,0,0.07)',
      boxShadow: isMyUnit ? `0 0 0 3px ${meta.color}22, 0 4px 20px rgba(0,0,0,0.08)` : '0 2px 8px rgba(0,0,0,0.05)',
      background: style ? style.bg : '#fff',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Faixa lateral colorida */}
      <div style={{ display: 'flex' }}>
        <div style={{ width: 5, flexShrink: 0, background: meta.color, borderRadius: '0 0 0 0' }} />

        <div style={{ flex: 1, padding: '16px 18px' }}>
          {/* Linha principal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            {/* Posição */}
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: `${meta.color}18`, border: `1.5px solid ${meta.color}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {entry.position <= 3
                ? <span style={{ fontSize: 20 }}>{MEDAL[entry.position - 1]}</span>
                : <span style={{ fontSize: 15, fontWeight: 800, color: meta.color }}>{entry.position}º</span>}
            </div>

            {/* Nome + estado */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 17, fontWeight: 900, color: '#1a1625' }}>
                  {meta.icon} {entry.unit}
                </span>
                {meta.state && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                    background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30`,
                  }}>
                    {meta.state}
                  </span>
                )}
                {isMyUnit && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
                    background: `${meta.color}`, color: '#fff',
                  }}>
                    Minha unidade
                  </span>
                )}
              </div>
              {entry.leader && (
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8a8490' }}>
                  🏆 Líder: <strong style={{ color: '#4a4555' }}>{entry.leader}</strong>
                  {' '}· {entry.leaderPoints} pts
                </p>
              )}
            </div>

            {/* Pontuação */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: meta.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {entry.avgPoints.toFixed(1)}
              </p>
              <p style={{ margin: 0, fontSize: 10, color: '#8a8490' }}>pts médios</p>
            </div>
          </div>

          {/* Barra de progresso de pontos */}
          <div style={{ height: 4, borderRadius: 4, background: '#f0ede8', overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ height: '100%', borderRadius: 4, width: `${barW}%`, background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})`, transition: 'width 0.5s' }} />
          </div>

          {/* Stats menores */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Participantes', value: entry.totalMembers },
              { label: 'Finalizados',   value: entry.lockedMembers },
              { label: 'Adesão',        value: `${entry.participationRate}%` },
              { label: 'Total pts',     value: entry.totalPoints },
              { label: 'Melhor',        value: `${entry.maxPoints} pts` },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1625', lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: '2px 0 0', fontSize: 10, color: '#aaa8b0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function UnidadesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [ranking, myStatus] = await Promise.all([
    getUnitRanking(),
    getMyUnitStatus(session.userId),
  ])

  const hasAnyPts = ranking.some(u => u.avgPoints > 0)
  const top3      = ranking.slice(0, 3)

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1a1625' }}>Ranking por Unidade</h1>
          <p className="text-sm mt-1" style={{ color: '#6b6672' }}>
            Disputa coletiva entre as 5 unidades · Copa do Mundo 2026 · Vendemmia
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Link href="/dashboard/departamentos" className="text-xs hover:text-brand-neon transition-colors self-center" style={{ color: '#8a8490' }}>
            Por Departamento →
          </Link>
        </div>
      </div>

      {/* ── Minha unidade ── */}
      {myStatus.unit && (
        <div style={{
          borderRadius: 16, padding: '16px 20px',
          background: `linear-gradient(135deg, ${getUnitMeta(myStatus.unit).color}12 0%, ${getUnitMeta(myStatus.unit).color}06 100%)`,
          border: `1.5px solid ${getUnitMeta(myStatus.unit).color}30`,
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 36 }}>{getUnitMeta(myStatus.unit).icon}</div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Minha Unidade
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 900, color: '#1a1625' }}>
              {myStatus.unit}
            </p>
            {myStatus.leader && (
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8a8490' }}>
                Líder: <strong style={{ color: '#4a4555' }}>{myStatus.leader}</strong>
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
            {[
              { label: 'Posição',     value: myStatus.position ? `${myStatus.position}º` : '—', accent: true },
              { label: 'Média pts',   value: myStatus.avgPoints.toFixed(1) },
              { label: 'Membros',     value: myStatus.totalMembers },
              { label: 'Adesão',      value: `${myStatus.participationRate}%` },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 900, lineHeight: 1,
                  color: s.accent ? getUnitMeta(myStatus.unit!).color : '#1a1625',
                  fontVariantNumeric: 'tabular-nums' }}>
                  {s.value}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 10, color: '#aaa8b0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── KPIs globais ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Unidades',      value: ranking.length },
          { label: 'Líder',         value: ranking[0]?.unit ?? '—', isText: true },
          { label: 'Melhor média',  value: ranking[0] ? `${ranking[0].avgPoints.toFixed(1)} pts` : '—', isText: true },
          { label: 'Total jogadores', value: ranking.reduce((a, u) => a + u.totalMembers, 0) },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`font-bold ${s.isText ? 'text-base' : 'text-2xl'} truncate`} style={{ color: '#1a1625' }}>
              {s.value}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8a8490' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Pódio ── */}
      {top3.length > 0 && (
        <section className="card p-8 overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(66,44,118,0.5) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-center mb-8" style={{ color: '#6b6672' }}>
              🏆 Disputa das Unidades
            </p>
            <Podium top3={top3} />
          </div>
        </section>
      )}

      {/* ── Aviso pré-Copa ── */}
      {!hasAnyPts && (
        <div className="card p-5">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>⏳</span>
            <div>
              <p className="font-medium text-sm" style={{ color: '#1a1625' }}>
                A Copa ainda não começou — todas as unidades estão com 0 pts.
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#8a8490' }}>
                O ranking será atualizado conforme os jogos forem pontuados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Cards de todas as unidades ── */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: '#8a8490' }}>
          Classificação — {ranking.length} Unidades
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ranking.map(entry => (
            <UnitCard
              key={entry.unit}
              entry={entry}
              isMyUnit={entry.unit === myStatus.unit}
            />
          ))}
        </div>
      </section>

      {/* ── Como funciona ── */}
      <details className="card p-5 group">
        <summary className="flex items-center justify-between cursor-pointer text-sm hover:text-brand-neon transition-colors select-none" style={{ color: '#6b6672' }}>
          <span>Como funciona o ranking por unidade?</span>
          <span className="group-open:rotate-180 transition-transform" style={{ color: '#8a8490' }}>▼</span>
        </summary>
        <div className="mt-4 space-y-3 text-sm leading-relaxed" style={{ color: '#8a8490' }}>
          <p>
            <strong style={{ color: '#6b6672' }}>Métrica:</strong> Média de pontos de todos os membros ativos da unidade.
            Membros sem palpites contam com <strong style={{ color: '#6b6672' }}>0 pontos</strong> — incentivando participação de 100% da equipe.
          </p>
          <p>
            <strong style={{ color: '#6b6672' }}>Desempate:</strong> Taxa de participação (% com palpites finalizados)
            e pontuação máxima individual da unidade.
          </p>
          <p>
            <strong style={{ color: '#6b6672' }}>Unidades:</strong> Garuva · Itapevi · Navegantes CD01 · Navegantes CD02 · Vila Olímpia.
          </p>
        </div>
      </details>
    </div>
  )
}
