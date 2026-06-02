import { getSession }          from '@/lib/session'
import { getManagerRanking }   from '@/lib/queries'
import { db }                  from '@/lib/db'
import { users }               from '@/db/schema'
import { eq }                  from 'drizzle-orm'
import { ManagerRankingTable } from '@/components/manager-ranking-table'
import { redirect }            from 'next/navigation'
import Link                    from 'next/link'

export const revalidate = 60
export const metadata   = { title: 'Ranking por Gestor | Bolão Copa 2026' }

export default async function GestoresPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [ranking, me] = await Promise.all([
    getManagerRanking(),
    db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: { manager: true },
    }),
  ])

  const userManager = me?.manager ?? null
  const myEntry     = userManager ? ranking.find(e => e.manager === userManager) : null
  const myPos       = myEntry ? ranking.indexOf(myEntry) + 1 : null

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1a1625' }}>Ranking por Gestor</h1>
          <p className="text-sm mt-1" style={{ color: '#6b6672' }}>
            Disputa coletiva · Copa do Mundo 2026 · Vendemmia
          </p>
        </div>
        <Link href="/dashboard/departamentos" className="text-xs self-center hover:underline" style={{ color: '#8a8490' }}>
          ← Por departamento
        </Link>
      </div>

      {/* ── Minha posição de gestor ── */}
      {myEntry && myPos && (
        <div className="card p-5" style={{ background: 'linear-gradient(135deg, #2a1a4e 0%, #422c76 100%)', border: 'none' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#01E18E' }}>
            Time do seu gestor
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black tabular-nums" style={{ color: '#01E18E' }}>{myPos}º</span>
              <div>
                <p className="font-semibold text-white">{myEntry.manager}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {myEntry.participants} colaboradores · Destaque: {myEntry.leader.split(' ')[0]}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black tabular-nums" style={{ color: '#01E18E' }}>{myEntry.totalPoints}</p>
              <p className="text-xs" style={{ color: 'rgba(1,225,142,0.6)' }}>pts totais</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Gestores',      value: ranking.length },
          { label: 'Líder',         value: ranking[0]?.manager?.split(' ')[0] ?? '—' },
          { label: 'Total do líder', value: `${ranking[0]?.totalPoints ?? 0} pts` },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="font-bold text-xl truncate" style={{ color: '#1a1625' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: '#8a8490' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Pódio top 3 gestores ── */}
      {ranking.length >= 3 && (
        <div className="card p-6 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(66,44,118,0.6), transparent 70%)' }} />
          <p className="text-xs font-semibold uppercase tracking-widest text-center mb-6 relative z-10" style={{ color: '#6b6672' }}>
            🏆 Top 3 Gestores
          </p>
          <div className="flex items-end justify-center gap-4 relative z-10">
            {/* 2º */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xl"
                style={{ background: 'rgba(160,160,160,0.15)', color: '#a0a0a0', border: '2px solid #a0a0a0' }}>
                2
              </div>
              <div className="h-20 w-full rounded-t-xl flex flex-col items-center justify-center"
                style={{ background: 'rgba(160,160,160,0.1)', border: '1px solid rgba(160,160,160,0.2)' }}>
                <p className="text-xs font-semibold text-center px-1 leading-tight" style={{ color: '#6b6672' }}>
                  {ranking[1]?.manager?.split(' ')[0]}
                </p>
                <p className="text-sm font-bold mt-1" style={{ color: '#a0a0a0' }}>{ranking[1]?.totalPoints} pts</p>
              </div>
            </div>
            {/* 1º */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-[160px]">
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl"
                style={{ background: 'rgba(245,197,24,0.15)', color: '#f5c518', border: '2px solid #f5c518' }}>
                1
              </div>
              <div className="h-28 w-full rounded-t-xl flex flex-col items-center justify-center"
                style={{ background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.25)' }}>
                <p className="text-xs font-semibold text-center px-1 leading-tight" style={{ color: '#1a1625' }}>
                  {ranking[0]?.manager?.split(' ')[0]}
                </p>
                <p className="text-base font-black mt-1" style={{ color: '#f5c518' }}>{ranking[0]?.totalPoints} pts</p>
              </div>
            </div>
            {/* 3º */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xl"
                style={{ background: 'rgba(205,127,50,0.15)', color: '#cd7f32', border: '2px solid #cd7f32' }}>
                3
              </div>
              <div className="h-14 w-full rounded-t-xl flex flex-col items-center justify-center"
                style={{ background: 'rgba(205,127,50,0.1)', border: '1px solid rgba(205,127,50,0.2)' }}>
                <p className="text-xs font-semibold text-center px-1 leading-tight" style={{ color: '#6b6672' }}>
                  {ranking[2]?.manager?.split(' ')[0]}
                </p>
                <p className="text-sm font-bold mt-1" style={{ color: '#cd7f32' }}>{ranking[2]?.totalPoints} pts</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabela completa ── */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: '#8a8490' }}>
          Classificação Completa ({ranking.length} gestores)
        </h2>
        <ManagerRankingTable entries={ranking} userManager={userManager} />
      </section>
    </div>
  )
}
