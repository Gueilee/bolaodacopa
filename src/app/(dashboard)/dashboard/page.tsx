import { Suspense }       from 'react'
import { getSession }     from '@/lib/session'
import { getRanking }     from '@/lib/queries'
import { getMyDeptStatus} from '@/lib/dept-ranking'
import { RankingTable }   from '@/components/ranking-table'
import { MyDeptBanner }   from '@/components/my-dept-banner'
import { redirect }       from 'next/navigation'
import Link               from 'next/link'

export const revalidate = 60

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [ranking, myDeptStatus] = await Promise.all([
    getRanking(),
    getMyDeptStatus(session.userId),
  ])

  const myEntry = ranking.find((e) => e.id === session.userId)

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1a1625' }}>Ranking Individual</h1>
        <p className="text-sm mt-1" style={{ color: '#8a8490' }}>
          Atualizado a cada minuto · Copa do Mundo 2026
        </p>
      </div>

      {/* ── Minha posição individual ── */}
      {myEntry && (
        <div className="card p-5" style={{ background: 'linear-gradient(135deg, #422c76 0%, #2a1a4e 100%)', border: 'none' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#01E18E' }}>
            Sua posição
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black tabular-nums" style={{ color: '#01E18E' }}>
                {myEntry.position}º
              </span>
              <div>
                <p className="font-semibold text-white">{myEntry.name}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {myEntry.predictionCount} palpites · {myEntry.exactCount} exatos
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black tabular-nums" style={{ color: '#01E18E' }}>
                {myEntry.totalPoints}
              </p>
              <p className="text-xs" style={{ color: 'rgba(1,225,142,0.6)' }}>pontos</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Meu departamento ── */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: '#8a8490' }}>
          Disputa por Departamento
        </p>
        <MyDeptBanner status={myDeptStatus} />
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Participantes',   value: ranking.length },
          { label: 'Líder',           value: ranking[0]?.name.split(' ')[0] ?? '—' },
          { label: 'Pontuação máx.',  value: ranking[0]?.totalPoints ?? 0, suffix: 'pts' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <p className="font-bold text-xl truncate" style={{ color: '#1a1625' }}>
              {stat.value}{stat.suffix ? ` ${stat.suffix}` : ''}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8a8490' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabela individual ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8a8490' }}>
            Classificação Individual
          </h2>
          <div className="flex gap-3">
            <Link href="/dashboard/departamentos" className="text-xs transition-colors" style={{ color: '#422c76' }}>
              Por departamento →
            </Link>
            <Link href="/dashboard/gestores" className="text-xs transition-colors" style={{ color: '#422c76' }}>
              Por gestor →
            </Link>
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
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: '#e8e4df' }} />
      ))}
    </div>
  )
}
