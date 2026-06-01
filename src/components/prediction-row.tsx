'use client'

import { useState, useTransition } from 'react'
import { savePrediction } from '@/app/actions/scoring'
import { formatMatchTime } from '@/lib/utils'
import type { MatchWithPrediction } from '@/lib/queries'

type Props = {
  match:        MatchWithPrediction
  isUserLocked: boolean
  index:        number
}

function PointsPill({ points }: { points: number }) {
  if (points === 10) return <span className="points-badge text-[11px]">⚡ {points}</span>
  if (points === 7)  return <span className="points-badge text-yellow-400 bg-yellow-400/10 border-yellow-400/20 text-[11px]">🎯 {points}</span>
  if (points === 5)  return <span className="points-badge text-blue-400 bg-blue-400/10 border-blue-400/20 text-[11px]">✓ {points}</span>
  if (points === 0 ) return <span className="text-[11px] text-white/20">0 pts</span>
  return null
}

export function PredictionRow({ match, isUserLocked }: Props) {
  const prediction = match.predictions[0] ?? null
  const isFinished = match.status === 'finished'
  const canEdit    = !isUserLocked && !isFinished

  const [home, setHome] = useState(prediction?.homeScore?.toString() ?? '')
  const [away, setAway] = useState(prediction?.awayScore?.toString() ?? '')
  const [isPending, startTransition] = useTransition()
  const [saved,     setSaved]        = useState(false)

  const isDirty    = prediction
    ? home !== String(prediction.homeScore) || away !== String(prediction.awayScore)
    : home !== '' || away !== ''
  const isComplete = home !== '' && away !== ''
  const hasBet     = prediction !== null

  function handleSave() {
    startTransition(async () => {
      const result = await savePrediction(match.id, Number(home), Number(away))
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 transition-colors ${isFinished && hasBet && prediction!.isScored ? '' : ''}`}>

      {/* Date + time */}
      <div className="w-16 shrink-0 text-center">
        <p className="text-[10px] text-white/30">{formatMatchTime(match.matchDate)}</p>
        {match.groupName && (
          <p className="text-[9px] text-white/20 mt-0.5">{match.groupName.replace('Grupo ', 'Gr.')}</p>
        )}
      </div>

      {/* Teams */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{match.homeFlag}</span>
          <span className="text-xs text-brand-cream truncate">{match.homeTeam}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-base leading-none">{match.awayFlag}</span>
          <span className="text-xs text-brand-cream truncate">{match.awayTeam}</span>
        </div>
      </div>

      {/* Score area */}
      <div className="flex items-center gap-1.5 shrink-0">
        {canEdit ? (
          <>
            <input
              type="number" min="0" max="99"
              value={home}
              onChange={(e) => { setHome(e.target.value); setSaved(false) }}
              disabled={isPending}
              className="w-9 h-9 text-center text-sm font-bold rounded-lg bg-white/5 border border-white/15 text-brand-cream focus:outline-none focus:border-brand-purple disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-white/20 text-xs">×</span>
            <input
              type="number" min="0" max="99"
              value={away}
              onChange={(e) => { setAway(e.target.value); setSaved(false) }}
              disabled={isPending}
              className="w-9 h-9 text-center text-sm font-bold rounded-lg bg-white/5 border border-white/15 text-brand-cream focus:outline-none focus:border-brand-purple disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </>
        ) : (
          /* Read-only */
          <>
            <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/8 font-bold text-sm text-brand-cream tabular-nums">
              {hasBet ? prediction!.homeScore : '–'}
            </span>
            <span className="text-white/20 text-xs">×</span>
            <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/8 font-bold text-sm text-brand-cream tabular-nums">
              {hasBet ? prediction!.awayScore : '–'}
            </span>
          </>
        )}
      </div>

      {/* Action / status */}
      <div className="w-16 shrink-0 flex items-center justify-end">
        {isFinished && prediction?.isScored ? (
          <PointsPill points={prediction.points} />
        ) : isFinished && !hasBet ? (
          <span className="text-[11px] text-white/20">sem palpite</span>
        ) : isUserLocked ? (
          <span className="text-[11px] text-white/25">🔒</span>
        ) : saved ? (
          <span className="text-[11px] text-brand-neon">✓</span>
        ) : canEdit && isDirty && isComplete ? (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-[11px] text-brand-purple hover:text-white border border-brand-purple/40 rounded-md px-2 py-1 transition-colors"
          >
            {isPending ? '...' : 'Salvar'}
          </button>
        ) : hasBet ? (
          <span className="text-[11px] text-white/25">✓</span>
        ) : (
          <span className="text-[11px] text-white/20">—</span>
        )}
      </div>
    </div>
  )
}
