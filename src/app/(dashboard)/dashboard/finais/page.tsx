import { getSession }              from '@/lib/session'
import { redirect }                from 'next/navigation'
import { db }                      from '@/lib/db'
import { tournamentPredictions }   from '@/db/schema'
import { eq }                      from 'drizzle-orm'
import { FinaisForm }              from '@/components/finais-form'

// Primeiro jogo da Copa do Mundo 2026
const CUP_START = new Date('2026-06-11T20:00:00Z')

export const revalidate = 0

export default async function FinaisPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const existing = await db.query.tournamentPredictions.findFirst({
    where: eq(tournamentPredictions.userId, session.userId),
  })

  const isPastDeadline = new Date() >= CUP_START

  return (
    <FinaisForm
      existing={existing
        ? {
            champion:  existing.champion,
            runnerUp:  existing.runnerUp,
            topScorer: existing.topScorer,
            isScored:  existing.isScored,
            bonusPoints: existing.bonusPoints,
          }
        : null}
      isPastDeadline={isPastDeadline}
      cupStartISO={CUP_START.toISOString()}
    />
  )
}
