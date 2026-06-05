import { Suspense }        from 'react'
import { getSession }      from '@/lib/session'
import { getRanking }      from '@/lib/queries'
import { getMyDeptStatus } from '@/lib/dept-ranking'
import { RankingTable }    from '@/components/ranking-table'
import { MyDeptBanner }    from '@/components/my-dept-banner'
import { redirect }        from 'next/navigation'
import Link                from 'next/link'
import { Users, Crown, Zap } from 'lucide-react'

export const revalidate = 60

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [ranking, myDeptStatus] = await Promise.all([
    getRanking(),
    getMyDeptStatus(session.userId),
  ])

  const myEntry  = ranking.find((e) => e.id === session.userId)
  const leader   = ranking[0]

  return (
    <div className="max-w-3xl mx-auto animate-fade-in" style={{ paddingBottom: 40 }}>

      {/* ── Hero: minha posição ─────────────────────────────────── */}
      {myEntry && (
        <div style={{
          background: 'linear-gradient(135deg, #0d0920 0%, #1a0d36 50%, #0a1a0a 100%)',
          borderRadius: 24, padding: '28px 32px',
          marginBottom: 24, position: 'relative', overflow: 'hidden',
        }}>
          {/* decoração */}
          <div style={{ position: 'absolute', top: -40, right: -30, width: 220, height: 220,
            background: 'radial-gradient(circle, rgba(1,225,142,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -20, width: 180, height: 180,
            background: 'radial-gradient(circle, rgba(66,44,118,0.35) 0%, transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#01E18E', display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-barlow), sans-serif',
            }}>
              Sua Posição no Ranking
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: 'rgba(1,225,142,0.1)', border: '2px solid rgba(1,225,142,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 30, fontWeight: 900, color: '#01E18E', letterSpacing: '-0.03em' }}>
                    {myEntry.position}º
                  </span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#faf9f5', letterSpacing: '-0.02em' }}>
                    {myEntry.name.split(' ').slice(0, 2).join(' ')}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                    {myEntry.predictionCount} palpites · {myEntry.exactCount} placar{myEntry.exactCount !== 1 ? 'es' : ''} exato{myEntry.exactCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 40, fontWeight: 900, color: '#01E18E', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {myEntry.totalPoints}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 11, fontWeight: 600, color: 'rgba(1,225,142,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  pontos
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {([
          { label: 'Participantes',   value: ranking.length,                    Icon: Users,  color: '#422c76' },
          { label: 'Líder atual',     value: leader?.name.split(' ')[0] ?? '—', Icon: Crown,  color: '#D97706' },
          { label: 'Maior pontuação', value: `${leader?.totalPoints ?? 0} pts`, Icon: Zap,    color: '#01E18E' },
        ] as const).map((stat) => (
          <div key={stat.label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, margin: '0 auto 8px',
              background: `${stat.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <stat.Icon size={17} color={stat.color} strokeWidth={2} />
            </div>
            <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 17, color: '#1a1625',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {stat.value}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: '#8a8490' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Meu departamento ───────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#8a8490', margin: '0 0 8px 4px' }}>
          Disputa por Departamento
        </p>
        <MyDeptBanner status={myDeptStatus} />
      </div>

      {/* ── Tabela de ranking ──────────────────────────────────── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8490' }}>
            Classificação Individual
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { href: '/dashboard/departamentos', label: 'Por departamento' },
              { href: '/dashboard/gestores',      label: 'Por gestor' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                fontSize: 12, color: '#422c76', fontWeight: 600, textDecoration: 'none',
                padding: '4px 10px', borderRadius: 8, background: 'rgba(66,44,118,0.07)',
                border: '1px solid rgba(66,44,118,0.15)', transition: 'all 0.15s',
              }}>
                {l.label} →
              </Link>
            ))}
          </div>
        </div>

        <Suspense fallback={<TableSkeleton />}>
          <RankingTable entries={ranking} currentUserId={session.userId} />
        </Suspense>
      </section>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ height: 56, borderRadius: 14, background: '#e8e4df', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )
}
