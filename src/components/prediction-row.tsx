'use client'

import { useState, useTransition } from 'react'
import { savePrediction } from '@/app/actions/scoring'
import { formatMatchTime, formatMatchDate } from '@/lib/utils'
import { TeamFlag } from '@/components/team-flag'
import type { MatchWithPrediction } from '@/lib/queries'

type Props = {
  match:               MatchWithPrediction
  isUserLocked:        boolean
  index:               number
  projectedHomeTeam?:  string | null
  projectedAwayTeam?:  string | null
}

function PointsPill({ points }: { points: number }) {
  if (points === 10) return <span className="points-badge text-[11px]">⚡ {points}</span>
  if (points === 7)  return <span className="text-[11px] font-bold" style={{ color: '#d4a017' }}>🎯 {points}</span>
  if (points === 5)  return <span className="text-[11px] font-bold" style={{ color: '#2563eb' }}>✓ {points}</span>
  if (points === 0)  return <span className="text-[11px]" style={{ color: '#c4bfba' }}>0 pts</span>
  return null
}

function ScoreInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  return (
    <input
      type="number" min="0" max="99"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: 44, height: 44, textAlign: 'center',
        fontSize: 16, fontWeight: 700,
        borderRadius: 10,
        background: '#ffffff',
        border: '1.5px solid #d0cbc5',
        color: '#1a1625',
        outline: 'none',
        appearance: 'textfield',
        opacity: disabled ? 0.5 : 1,
      }}
    />
  )
}

function ScoreBox({ value, highlight }: { value: number | null | string; highlight?: boolean }) {
  return (
    <span style={{
      width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 10, fontWeight: 700, fontSize: 16,
      background: highlight ? '#f5f2ef' : '#fff',
      border: `1.5px solid ${highlight ? '#e0dbd5' : '#e8e4df'}`,
      color: '#1a1625',
    }}>
      {value ?? '–'}
    </span>
  )
}

export function PredictionRow({ match, isUserLocked, projectedHomeTeam, projectedAwayTeam }: Props) {
  const displayHomeTeam = projectedHomeTeam !== undefined ? projectedHomeTeam : match.homeTeam
  const displayAwayTeam = projectedAwayTeam !== undefined ? projectedAwayTeam : match.awayTeam
  const prediction      = match.predictions[0] ?? null
  const isFinished      = match.status === 'finished'
  const hasBet          = prediction !== null

  // Regra: palpites fecham 30 minutos antes da partida começar
  const matchStart   = new Date(match.matchDate)
  const cutoffTime   = new Date(matchStart.getTime() - 30 * 60 * 1000)
  const isPastCutoff = new Date() >= cutoffTime

  const [home, setHome]             = useState(prediction?.homeScore?.toString() ?? '')
  const [away, setAway]             = useState(prediction?.awayScore?.toString() ?? '')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved]           = useState(false)
  const [savedHome, setSavedHome]   = useState<number | null>(null)
  const [savedAway, setSavedAway]   = useState<number | null>(null)
  const [error, setError]           = useState<string | null>(null)

  // Pode editar APENAS se: não está globalmente locked, jogo não encerrou,
  // ainda não salvou palpite nesse jogo, prazo não encerrou, E não acabou de salvar
  const canEdit = !isUserLocked && !isFinished && !hasBet && !isPastCutoff && !saved

  const isDirty    = home !== '' || away !== ''
  const isComplete = home !== '' && away !== ''

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await savePrediction(match.id, Number(home), Number(away))
      if (result.success) {
        setSaved(true)
        setSavedHome(Number(home))
        setSavedAway(Number(away))
      } else {
        setError(result.error ?? 'Erro ao salvar.')
      }
    })
  }

  // Calcula minutos restantes até o cutoff (para exibir aviso)
  const msUntilCutoff = cutoffTime.getTime() - Date.now()
  const minutesUntilCutoff = Math.ceil(msUntilCutoff / 60000)
  const showCutoffWarning = !isFinished && !hasBet && !isUserLocked && minutesUntilCutoff > 0 && minutesUntilCutoff <= 60

  return (
    <div className="px-4 py-3 transition-colors" style={{ borderBottom: '1px solid #f0ede8' }}>

      {/* Meta */}
      <div className="mb-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px]" style={{ color: '#aaa8b0' }}>
            {formatMatchDate(match.matchDate)} · {formatMatchTime(match.matchDate)}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {match.groupName && (
              <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ background: '#f0ede8', color: '#8a8490' }}>
                {match.groupName}
              </span>
            )}
            {isFinished && (
              <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ background: '#fce8ee', color: '#ff2f69' }}>
                Encerrado
              </span>
            )}
            {!isFinished && isPastCutoff && !hasBet && (
              <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ background: '#fff3e0', color: '#e65100' }}>
                ⏰ Prazo encerrado
              </span>
            )}
            {showCutoffWarning && (
              <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ background: '#fff8e1', color: '#f59e0b' }}>
                ⚡ {minutesUntilCutoff}min restantes
              </span>
            )}
          </div>
        </div>
        {match.venue && (
          <p className="text-[10px] mt-0.5" style={{ color: '#aaa8b0' }}>
            📍 {match.venue}
          </p>
        )}
      </div>

      {/* Main row */}
      <div className="flex items-center gap-2">

        {/* Home team */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
          <span className="text-xs font-semibold truncate" style={{ color: displayHomeTeam ? '#1a1625' : '#aaa8b0' }}>
            {displayHomeTeam ?? '?'}
          </span>
          {displayHomeTeam && <TeamFlag teamName={displayHomeTeam} size={28} />}
        </div>

        {/* Score */}
        <div className="flex items-center gap-1.5 shrink-0">
          {canEdit ? (
            <>
              <ScoreInput value={home} onChange={(v) => { setHome(v); setSaved(false) }} disabled={isPending} />
              <span className="text-sm font-light" style={{ color: '#c4bfba' }}>×</span>
              <ScoreInput value={away} onChange={(v) => { setAway(v); setSaved(false) }} disabled={isPending} />
            </>
          ) : (
            <>
              <ScoreBox
                value={
                  isFinished   ? (match.homeScore ?? '–') :
                  saved        ? savedHome :
                  hasBet       ? prediction!.homeScore :
                  '–'
                }
                highlight={isFinished}
              />
              <span className="text-sm font-light" style={{ color: '#c4bfba' }}>×</span>
              <ScoreBox
                value={
                  isFinished   ? (match.awayScore ?? '–') :
                  saved        ? savedAway :
                  hasBet       ? prediction!.awayScore :
                  '–'
                }
                highlight={isFinished}
              />
            </>
          )}
        </div>

        {/* Away team */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {displayAwayTeam && <TeamFlag teamName={displayAwayTeam} size={28} />}
          <span className="text-xs font-semibold truncate" style={{ color: displayAwayTeam ? '#1a1625' : '#aaa8b0' }}>
            {displayAwayTeam ?? '?'}
          </span>
        </div>

        {/* Action */}
        <div className="w-16 shrink-0 flex justify-end">
          {isFinished && prediction?.isScored ? (
            <PointsPill points={prediction.points} />
          ) : isFinished && !hasBet ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded"
              style={{ background: '#fce8ee', color: '#e05a7a' }}>
              sem palpite
            </span>
          ) : isFinished && hasBet ? (
            <span className="text-[11px]" style={{ color: '#aaa8b0' }}>aguardando</span>
          ) : hasBet ? (
            // Palpite salvo — bloqueado permanentemente
            <span className="text-[11px] font-bold" style={{ color: '#01a866' }}>🔒 salvo</span>
          ) : isPastCutoff ? (
            <span className="text-[10px] font-semibold" style={{ color: '#e65100' }}>sem palpite</span>
          ) : isUserLocked ? (
            <span className="text-[11px]" style={{ color: '#c4bfba' }}>🔒</span>
          ) : saved ? (
            <span className="text-[11px] font-bold" style={{ color: '#01a866' }}>✓ salvo</span>
          ) : canEdit && isDirty && isComplete ? (
            <button
              onClick={handleSave}
              disabled={isPending}
              className="text-[11px] font-semibold rounded-lg px-2.5 py-1.5 transition-colors"
              style={{ background: '#422c76', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              {isPending ? '...' : 'Salvar'}
            </button>
          ) : (
            <span className="text-[11px]" style={{ color: '#c4bfba' }}>—</span>
          )}
        </div>
      </div>

      {/* Erro inline */}
      {error && (
        <p style={{ fontSize: 11, color: '#ff2f69', marginTop: 6, textAlign: 'right' }}>{error}</p>
      )}
    </div>
  )
}
