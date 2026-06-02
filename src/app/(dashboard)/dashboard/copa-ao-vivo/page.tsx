import { CopaLeagueOverview, CopaGroupStandings } from '@/components/copa-widgets'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Copa ao Vivo | Bolão 2026' }

export default async function CopaAoVivoPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">

      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1a1625' }}>Copa ao Vivo</h1>
        <p className="text-sm mt-1" style={{ color: '#6b6672' }}>
          Dados em tempo real · API-Sports · league=1 · season=2026
        </p>
      </div>

      {/* ── Visão geral + jogos de hoje ── */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: '#8a8490' }}>
          Jogos &amp; Placares
        </h2>
        <CopaLeagueOverview />
      </section>

      {/* ── Classificação dos grupos ── */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: '#8a8490' }}>
          Classificação dos Grupos
        </h2>
        <CopaGroupStandings />
      </section>

    </div>
  )
}
