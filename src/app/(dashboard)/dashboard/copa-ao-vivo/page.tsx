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
        <h1 className="text-2xl font-bold text-brand-cream">Copa ao Vivo</h1>
        <p className="text-white/40 text-sm mt-1">
          Dados em tempo real · API-Sports · league=1 · season=2026
        </p>
      </div>

      {/* ── Visão geral + jogos de hoje ── */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 px-1">
          Jogos &amp; Placares
        </h2>
        <CopaLeagueOverview />
      </section>

      {/* ── Classificação dos grupos ── */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 px-1">
          Classificação dos Grupos
        </h2>
        <CopaGroupStandings />
      </section>

    </div>
  )
}
