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
        <h1 className="text-2xl font-bold text-brand-cream">Ranking Individual</h1>
        <p className="text-white/40 text-sm mt-1">
          Atualizado a cada minuto · Copa do Mundo 2026
        </p>
      </div>

      {/* ── Minha posição individual ── */}
      {myEntry && (
        <div className="card p-5 border-brand-neon/20 bg-brand-neon/5">
          <p className="text-brand-neon text-xs font-semibold uppercase tracking-widest mb-3">
            Sua posição
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-brand-neon tabular-nums">
                {myEntry.position}º
              </span>
              <div>
                <p className="text-brand-cream font-semibold">{myEntry.name}</p>
                <p className="text-white/40 text-xs">
                  {myEntry.predictionCount} palpites · {myEntry.exactCount} exatos
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-brand-neon tabular-nums">
                {myEntry.totalPoints}
              </p>
              <p className="text-brand-neon/50 text-xs">pontos</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Meu departamento ── */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/30 px-1">
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
            <p className="text-white font-bold text-xl truncate">
              {stat.value}{stat.suffix ? ` ${stat.suffix}` : ''}
            </p>
            <p className="text-white/35 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabela individual ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Classificação Individual
          </h2>
          <Link
            href="/dashboard/departamentos"
            className="text-xs text-white/30 hover:text-brand-neon transition-colors"
          >
            Ver ranking por equipe →
          </Link>
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
        <div key={i} className="h-14 rounded-xl bg-white/4 animate-pulse" />
      ))}
    </div>
  )
}
