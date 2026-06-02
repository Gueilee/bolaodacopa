'use client'

import { useState, useTransition } from 'react'
import { savePrediction } from '@/app/actions/scoring'
import { formatMatchTime, phaseLabels } from '@/lib/utils'
import { TeamFlag } from '@/components/team-flag'
import type { MatchWithPrediction } from '@/lib/queries'

type Props = {
  match:        MatchWithPrediction
  isUserLocked: boolean
}

// ── Points result pill ────────────────────────────────────────────────────────
function PointsPill({ points }: { points: number }) {
  if (points === 10) return <span className="points-badge">⚡ {points} pts — Placar exato</span>
  if (points === 7)  return <span className="points-badge text-yellow-400 bg-yellow-400/10 border-yellow-400/20">🎯 {points} pts</span>
  if (points === 5)  return <span className="points-badge text-blue-400 bg-blue-400/10 border-blue-400/20">✓ {points} pts</span>
  return <span className="text-xs" style={{ color: '#8a8490' }}>0 pts</span>
}

// ── Score display (read-only) ─────────────────────────────────────────────────
function ScoreDisplay({ value }: { value: number | null }) {
  return (
    <span
      className="w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xl tabular-nums"
      style={{ background: '#f5f2ef', border: '1px solid #e8e4df', color: '#1a1625' }}
    >
      {value ?? '–'}
    </span>
  )
}

// ── Score input ───────────────────────────────────────────────────────────────
function ScoreInput({
  value,
  onChange,
  disabled,
  label,
}: {
  value: string
  onChange: (v: string) => void
  disabled: boolean
  label: string
}) {
  return (
    <input
      type="number"
      min="0"
      max="99"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label={label}
      className="
        w-12 h-12 text-center font-bold text-xl rounded-lg
        focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/50
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all duration-150 tabular-nums
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
      "
      style={{ background: '#f5f2ef', border: '1px solid #d8d4cf', color: '#1a1625' }}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function MatchCard({ match, isUserLocked }: Props) {
  const prediction = match.predictions[0] ?? null
  const isFinished = match.status === 'finished'

  const [home, setHome] = useState(prediction?.homeScore?.toString() ?? '')
  const [away, setAway] = useState(prediction?.awayScore?.toString() ?? '')
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  const hasPrediction   = prediction !== null
  const canEdit         = !isUserLocked && !isFinished
  const isInputDirty    = hasPrediction
    ? home !== String(prediction.homeScore) || away !== String(prediction.awayScore)
    : home !== '' || away !== ''
  const isInputComplete = home !== '' && away !== ''

  function handleSave() {
    setFeedback(null)
    startTransition(async () => {
      const result = await savePrediction(
        match.id,
        Number(home),
        Number(away),
      )
      if (result.success) {
        setFeedback({ ok: true, msg: 'Palpite salvo!' })
        setTimeout(() => setFeedback(null), 3000)
      } else {
        setFeedback({ ok: false, msg: result.error ?? 'Erro ao salvar.' })
      }
    })
  }

  return (
    <div
      className={`
        card p-5 transition-all duration-200
        ${isFinished ? 'opacity-90' : ''}
        ${prediction?.isScored && prediction.points > 0 ? 'border-brand-neon/20' : ''}
      `}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md"
            style={{ color: '#6b6672', background: '#f5f2ef' }}
          >
            {match.groupName ?? phaseLabels[match.phase] ?? match.phase}
          </span>
          {isFinished && (
            <span className="text-[10px]" style={{ color: '#8a8490' }}>Encerrado</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs" style={{ color: '#8a8490' }}>
          <span>{formatMatchTime(match.matchDate)}</span>
          {match.venue && <span className="hidden sm:inline">· {match.venue}</span>}
        </div>
      </div>

      {/* ── Teams + Scores ── */}
      <div className="flex items-center justify-center gap-4 my-2">
        {/* Home team */}
        <div className="flex-1 flex flex-col items-end gap-2 min-w-0">
          <TeamFlag teamName={match.homeTeam} size={40} />
          <span className="text-sm font-semibold truncate" style={{ color: '#1a1625' }}>{match.homeTeam}</span>
        </div>

        {/* Score area */}
        <div className="flex items-center gap-2 shrink-0">
          {isFinished ? (
            /* Show actual result */
            <>
              <ScoreDisplay value={match.homeScore} />
              <span className="font-light" style={{ color: '#c8c4c0' }}>×</span>
              <ScoreDisplay value={match.awayScore} />
            </>
          ) : isUserLocked ? (
            /* Locked: show current prediction or dashes */
            <>
              <ScoreDisplay value={prediction?.homeScore ?? null} />
              <span className="font-light" style={{ color: '#c8c4c0' }}>×</span>
              <ScoreDisplay value={prediction?.awayScore ?? null} />
            </>
          ) : (
            /* Editable inputs */
            <>
              <ScoreInput
                value={home}
                onChange={setHome}
                disabled={isPending}
                label={`Gols ${match.homeTeam}`}
              />
              <span className="font-light" style={{ color: '#c8c4c0' }}>×</span>
              <ScoreInput
                value={away}
                onChange={setAway}
                disabled={isPending}
                label={`Gols ${match.awayTeam}`}
              />
            </>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex flex-col items-start gap-2 min-w-0">
          <TeamFlag teamName={match.awayTeam} size={40} />
          <span className="text-sm font-semibold truncate" style={{ color: '#1a1625' }}>{match.awayTeam}</span>
        </div>
      </div>

      {/* ── User prediction row (when finished) ── */}
      {isFinished && prediction && (
        <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #e8e4df' }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#8a8490' }}>
            <span>Seu palpite:</span>
            <span className="font-semibold" style={{ color: '#6b6672' }}>
              {prediction.homeScore} × {prediction.awayScore}
            </span>
          </div>
          {prediction.isScored ? (
            <PointsPill points={prediction.points} />
          ) : (
            <span className="text-xs" style={{ color: '#8a8490' }}>Aguardando pontuação</span>
          )}
        </div>
      )}

      {/* ── Action area (upcoming only) ── */}
      {!isFinished && (
        <div className="mt-4 flex items-center justify-between gap-3">

          {/* Lock status */}
          <div className="text-xs">
            {isUserLocked ? (
              <span className="flex items-center gap-1" style={{ color: '#8a8490' }}>
                🔒 Palpites bloqueados
              </span>
            ) : hasPrediction ? (
              <span style={{ color: '#8a8490' }}>Palpite registrado</span>
            ) : (
              <span style={{ color: '#8a8490' }}>Sem palpite ainda</span>
            )}
          </div>

          {/* Save button */}
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={isPending || !isInputComplete || !isInputDirty}
              className="btn-primary text-sm py-2 px-4 min-w-[120px]"
            >
              {isPending ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Salvando...
                </span>
              ) : hasPrediction ? (
                'Atualizar'
              ) : (
                'Salvar Palpite'
              )}
            </button>
          )}
        </div>
      )}

      {/* ── Feedback toast ── */}
      {feedback && (
        <div
          className={`
            mt-3 text-xs text-center px-3 py-2 rounded-lg animate-fade-in
            ${feedback.ok
              ? 'bg-brand-neon/10 border border-brand-neon/20 text-brand-neon'
              : 'bg-brand-pink/10 border border-brand-pink/20 text-brand-pink'}
          `}
        >
          {feedback.msg}
        </div>
      )}
    </div>
  )
}
