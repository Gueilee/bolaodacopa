import { getSession } from '@/lib/session'
import {
  getMatchesWithUserPredictions,
  getMyPredictionStats,
  getUserLockStatus,
} from '@/lib/queries'
import { db } from '@/lib/db'
import { tournamentPredictions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { LockPredictionsButton } from '@/components/lock-predictions-button'
import { PredictionRow }         from '@/components/prediction-row'
import { phaseLabels, phaseOrder } from '@/lib/utils'

export const revalidate = 0

export default async function MeusPalpitesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [allMatches, stats, lockStatus, tournamentBet] = await Promise.all([
    getMatchesWithUserPredictions(session.userId),
    getMyPredictionStats(session.userId),
    getUserLockStatus(session.userId),
    db.query.tournamentPredictions.findFirst({
      where: eq(tournamentPredictions.userId, session.userId),
    }),
  ])

  const isLocked = lockStatus?.isPredictionLocked ?? false

  // Agrupar partidas por fase
  const phaseMap = new Map<string, typeof allMatches>()
  for (const match of allMatches) {
    if (!phaseMap.has(match.phase)) phaseMap.set(match.phase, [])
    phaseMap.get(match.phase)!.push(match)
  }

  const sortedPhases = [...phaseMap.keys()].sort(
    (a, b) => (phaseOrder[a] ?? 99) - (phaseOrder[b] ?? 99),
  )

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-brand-cream">Meus Palpites</h1>
        <p className="text-white/40 text-sm mt-1">Registro único · Copa do Mundo 2026</p>
      </div>

      {/* ── Lock status / CTA ── */}
      <LockPredictionsButton
        filled={stats.filled}
        total={stats.totalMatches}
        isLocked={isLocked}
        lockedAt={lockStatus?.predictionsLockedAt ?? null}
      />

      {/* ── Stats overview ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Preenchidos',     value: `${stats.filled}/${stats.totalMatches}`, highlight: false },
          { label: 'Pts acumulados',  value: stats.pointsEarned,   highlight: true  },
          { label: 'Placares exatos', value: stats.exactScores,    highlight: true  },
          { label: 'Acertos simples', value: stats.correctWinner,  highlight: false },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold tabular-nums ${s.highlight ? 'text-brand-neon' : 'text-brand-cream'}`}>
              {s.value}
            </p>
            <p className="text-white/35 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Palpite final do torneio ── */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">
          🌟 Palpite Final do Torneio
        </h2>

        {tournamentBet ? (
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: '🏆 Campeão',      value: tournamentBet.champion  },
              { label: '🥈 Vice',          value: tournamentBet.runnerUp  },
              { label: '⚽ Artilheiro',   value: tournamentBet.topScorer },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl p-3 ${isLocked ? 'bg-brand-neon/5 border border-brand-neon/15' : 'bg-white/5 border border-white/10'}`}>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-white font-semibold text-sm">{item.value}</p>
                {tournamentBet.isScored && tournamentBet.bonusPoints > 0 && (
                  <p className="text-brand-neon text-xs mt-1">+{tournamentBet.bonusPoints} pts</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-white/30 text-sm mb-3">Você ainda não fez o palpite final do torneio.</p>
            {!isLocked && (
              <a
                href="/dashboard/finais"
                className="text-brand-neon text-sm hover:underline"
              >
                Fazer palpite final →
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Palpites por fase ── */}
      {sortedPhases.map((phase) => {
        const phaseMatches = phaseMap.get(phase) ?? []
        const phaseFilled  = phaseMatches.filter((m) => m.predictions.length > 0).length

        return (
          <section key={phase} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">
                {phaseLabels[phase] ?? phase}
              </h2>
              <span className="text-xs text-white/30 tabular-nums">
                {phaseFilled}/{phaseMatches.length}
              </span>
            </div>

            <div className="card overflow-hidden divide-y divide-white/5">
              {phaseMatches.map((match, i) => (
                <PredictionRow
                  key={match.id}
                  match={match}
                  isUserLocked={isLocked}
                  index={i}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
