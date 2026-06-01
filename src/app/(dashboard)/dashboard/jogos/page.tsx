import { getSession } from '@/lib/session'
import { getMatchesWithUserPredictions, getUserLockStatus } from '@/lib/queries'
import { MatchCard } from '@/components/match-card'
import { PhaseFilter } from '@/components/phase-filter'
import { formatMatchDate, groupMatchesByDate, phaseLabels, phaseOrder } from '@/lib/utils'
import { redirect } from 'next/navigation'

export const revalidate = 30

type SearchParams = { fase?: string }

export default async function JogosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { fase } = await searchParams
  const [allMatches, lockStatus] = await Promise.all([
    getMatchesWithUserPredictions(session.userId),
    getUserLockStatus(session.userId),
  ])
  const isUserLocked = lockStatus?.isPredictionLocked ?? false

  // Collect unique phases for the filter tabs
  const phases = [...new Set(allMatches.map((m) => m.phase))].sort(
    (a, b) => (phaseOrder[a] ?? 0) - (phaseOrder[b] ?? 0),
  )

  // Apply phase filter
  const filtered = fase ? allMatches.filter((m) => m.phase === fase) : allMatches

  // Group by calendar date
  const grouped = groupMatchesByDate(filtered)

  // Stats
  const total     = allMatches.length
  const withBet   = allMatches.filter((m) => m.predictions.length > 0).length
  const remaining = allMatches.filter(
    (m) => m.status === 'upcoming' && m.predictions.length === 0,
  ).length

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-cream">Jogos</h1>
          <p className="text-white/40 text-sm mt-1">
            {withBet}/{total} palpites feitos
            {remaining > 0 && (
              <span className="ml-2 text-brand-pink">· {remaining} abertos</span>
            )}
          </p>
        </div>

        {/* Progress bar */}
        <div className="text-right">
          <p className="text-brand-neon font-bold text-lg">
            {total > 0 ? Math.round((withBet / total) * 100) : 0}%
          </p>
          <p className="text-white/30 text-xs">completo</p>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-brand-neon rounded-full transition-all duration-700"
          style={{ width: `${total > 0 ? (withBet / total) * 100 : 0}%` }}
        />
      </div>

      {/* ── Phase filter tabs ── */}
      <PhaseFilter phases={phases} active={fase ?? null} />

      {/* ── Match groups ── */}
      {grouped.size === 0 ? (
        <p className="text-center text-white/30 py-16">
          Nenhum jogo encontrado para este filtro.
        </p>
      ) : (
        Array.from(grouped.entries()).map(([dateKey, dayMatches]) => (
          <section key={dateKey} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 px-1">
              {formatMatchDate(dayMatches[0].matchDate)}
            </h2>

            <div className="space-y-3">
              {dayMatches.map((match) => (
                <MatchCard key={match.id} match={match} isUserLocked={isUserLocked} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
