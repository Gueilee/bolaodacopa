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
import { GroupStandingsPanel }   from '@/components/group-standings-panel'
import { phaseLabels, phaseOrder } from '@/lib/utils'
import {
  computeGroupStandings,
  computeBracketProjection,
  type MatchData,
  type BracketProjection,
} from '@/lib/bracket'

export const revalidate = 0

// Fases que possuem times TBD resolvidos pelo bracket
const KNOCKOUT_PHASES = new Set(['round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final'])

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

  // Jogos já encerrados sem palpite do usuário (exibe aviso informativo)
  const finishedWithoutBet = allMatches.filter(
    m => m.status === 'finished' && m.predictions.length === 0
  ).length

  // Jogos disponíveis para palpitar (futuros, prazo aberto, sem palpite ainda)
  const now = new Date()
  const availableToPredict = allMatches.filter(m => {
    if (m.status === 'finished') return false
    if (m.predictions.length > 0) return false
    const cutoff = new Date(new Date(m.matchDate).getTime() - 30 * 60 * 1000)
    return now < cutoff
  }).length

  // ── Calcular classificação dos grupos e projeção do chaveamento ──────────────
  const matchData: MatchData[] = allMatches.map(m => ({
    id:                  m.id,
    phase:               m.phase,
    groupName:           m.groupName,
    matchNumber:         m.matchNumber,
    homeTeam:            m.homeTeam,
    awayTeam:            m.awayTeam,
    status:              m.status,
    predictedHomeScore:  m.predictions[0]?.homeScore ?? null,
    predictedAwayScore:  m.predictions[0]?.awayScore ?? null,
    actualHomeScore:     m.homeScore ?? null,
    actualAwayScore:     m.awayScore ?? null,
  }))

  const groupStandings   = computeGroupStandings(matchData)
  const bracketProjection: BracketProjection = computeBracketProjection(matchData, groupStandings)

  // ── Agrupar partidas por fase ─────────────────────────────────────────────────
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
        <h1 className="text-2xl font-bold" style={{ color: '#1a1625' }}>Meus Palpites</h1>
        <p className="text-sm mt-1" style={{ color: '#6b6672' }}>Registro único · Copa do Mundo 2026</p>
      </div>

      {/* ── Aviso: jogos encerrados sem palpite ── */}
      {finishedWithoutBet > 0 && !isLocked && (
        <div style={{
          background: 'linear-gradient(135deg, #fff8f0, #fff3e8)',
          border: '1.5px solid #f59e0b33',
          borderRadius: 14,
          padding: '14px 18px',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>⏰</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', margin: '0 0 3px' }}>
              {finishedWithoutBet} jogo{finishedWithoutBet > 1 ? 's' : ''} já encerrado{finishedWithoutBet > 1 ? 's' : ''}
            </p>
            <p style={{ fontSize: 12, color: '#b45309', margin: 0, lineHeight: 1.5 }}>
              Os placares em cinza exibem o resultado oficial — você não palpitou nesses jogos antes do prazo.
              {availableToPredict > 0
                ? ` Ainda há ${availableToPredict} jogo${availableToPredict > 1 ? 's' : ''} disponível${availableToPredict > 1 ? 'is' : ''} para palpitar.`
                : ''}
            </p>
          </div>
        </div>
      )}

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
            <p className={`text-2xl font-bold tabular-nums ${s.highlight ? 'text-brand-neon' : ''}`} style={!s.highlight ? { color: '#1a1625' } : undefined}>
              {s.value}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8a8490' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Palpite final do torneio ── */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#6b6672' }}>
          🌟 Palpite Final do Torneio
        </h2>

        {tournamentBet ? (
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: '🏆 Campeão',      value: tournamentBet.champion  },
              { label: '🥈 Vice',          value: tournamentBet.runnerUp  },
              { label: '⚽ Artilheiro',   value: tournamentBet.topScorer },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-xl p-3 ${isLocked ? 'border border-brand-neon/15' : 'border'}`}
                style={isLocked ? { background: 'rgba(var(--brand-neon-rgb),0.05)' } : { background: '#f5f2ef', borderColor: '#e8e4df' }}
              >
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#8a8490' }}>{item.label}</p>
                <p className="font-semibold text-sm" style={{ color: '#1a1625' }}>{item.value}</p>
                {tournamentBet.isScored && tournamentBet.bonusPoints > 0 && (
                  <p className="text-brand-neon text-xs mt-1">+{tournamentBet.bonusPoints} pts</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm mb-3" style={{ color: '#8a8490' }}>Você ainda não fez o palpite final do torneio.</p>
            {!isLocked && (
              <a href="/dashboard/finais" className="text-brand-neon text-sm hover:underline">
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
              <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#6b6672' }}>
                {phaseLabels[phase] ?? phase}
              </h2>
              <span className="text-xs tabular-nums" style={{ color: '#8a8490' }}>
                {phaseFilled}/{phaseMatches.length}
              </span>
            </div>

            <div className="card overflow-hidden divide-y" style={{ borderColor: '#f0ede8' }}>
              {phaseMatches.map((match, i) => {
                const proj = KNOCKOUT_PHASES.has(phase) ? bracketProjection[match.id] : undefined
                return (
                  <PredictionRow
                    key={match.id}
                    match={match}
                    isUserLocked={isLocked}
                    index={i}
                    projectedHomeTeam={proj?.home}
                    projectedAwayTeam={proj?.away}
                  />
                )
              })}
            </div>

            {/* Classificação dos grupos: aparece após a fase de grupos */}
            {phase === 'group' && (
              <div className="pt-4">
                <GroupStandingsPanel standings={groupStandings} />
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
