'use client'

import { useState, useTransition } from 'react'
import { scoreMatch } from '@/app/actions/scoring'
import { formatMatchTime, formatMatchDate, phaseLabels } from '@/lib/utils'
import type { AdminMatch } from '@/lib/queries'

type Props = { match: AdminMatch }

export function AdminMatchRow({ match }: Props) {
  const isFinished = match.status === 'finished'

  const [homeGoals, setHomeGoals] = useState(match.homeScore?.toString() ?? '')
  const [awayGoals, setAwayGoals] = useState(match.awayScore?.toString() ?? '')
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  const [open, setOpen] = useState(false)

  const predTotal  = match.predictions.length
  const predScored = match.predictions.filter((p) => p.isScored).length

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)

    startTransition(async () => {
      const result = await scoreMatch(match.id, Number(homeGoals), Number(awayGoals))
      if (result.success) {
        setFeedback({ ok: true, msg: `${result.scored} palpites pontuados com sucesso.` })
        setOpen(false)
      } else {
        setFeedback({ ok: false, msg: result.error ?? 'Erro ao pontuar.' })
      }
    })
  }

  return (
    <div
      className={`
        card p-4 transition-all
        ${isFinished && match.isScored ? 'opacity-60' : ''}
      `}
    >
      {/* ── Row summary ── */}
      <div className="flex items-center gap-4">
        {/* Phase + date */}
        <div className="hidden sm:block shrink-0 w-28">
          <p className="text-[10px] uppercase tracking-wider" style={{color:'#8a8490'}}>
            {match.groupName ?? phaseLabels[match.phase]}
          </p>
          <p className="text-xs mt-0.5" style={{color:'#8a8490'}}>
            {formatMatchDate(match.matchDate)} {formatMatchTime(match.matchDate)}
          </p>
        </div>

        {/* Match */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-lg">{match.homeFlag ?? '🏳'}</span>
          <span className="text-sm font-semibold" style={{color:'#1a1625'}}>{match.homeTeam}</span>

          {isFinished ? (
            <span className="font-bold tabular-nums" style={{color:'#8a8490'}}>
              {match.homeScore} × {match.awayScore}
            </span>
          ) : (
            <span className="text-sm" style={{color:'#8a8490'}}>vs</span>
          )}

          <span className="text-sm font-semibold" style={{color:'#1a1625'}}>{match.awayTeam}</span>
          <span className="text-lg">{match.awayFlag ?? '🏳'}</span>
        </div>

        {/* Prediction count */}
        <div className="shrink-0 text-right">
          <p className="text-xs tabular-nums" style={{color:'#8a8490'}}>
            {predScored}/{predTotal} pontuados
          </p>
        </div>

        {/* Status / action button */}
        <div className="shrink-0">
          {isFinished && match.isScored ? (
            <span className="text-xs text-brand-neon bg-brand-neon/10 border border-brand-neon/20 rounded-lg px-2 py-1">
              ✓ Pontuado
            </span>
          ) : (
            <button
              onClick={() => setOpen((v) => !v)}
              className="text-xs bg-brand-purple/40 hover:bg-brand-purple text-white border border-brand-purple/50 rounded-lg px-3 py-1.5 transition-all"
            >
              {isFinished ? 'Re-pontuar' : 'Registrar Resultado'}
            </button>
          )}
        </div>
      </div>

      {/* ── Expanded form ── */}
      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 pt-4 flex flex-col sm:flex-row items-start sm:items-end gap-4 animate-slide-up"
          style={{borderTop:'1px solid #e8e4df'}}
        >
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-xs mb-1" style={{color:'#8a8490'}}>{match.homeTeam}</p>
              <input
                type="number"
                min="0"
                max="99"
                value={homeGoals}
                onChange={(e) => setHomeGoals(e.target.value)}
                required
                disabled={isPending}
                className="w-16 h-12 text-center text-xl font-bold rounded-lg focus:outline-none focus:border-brand-purple disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{background:'#f5f2ef', border:'1px solid #e8e4df', color:'#1a1625'}}
              />
            </div>
            <span className="mt-5" style={{color:'#8a8490'}}>×</span>
            <div className="text-center">
              <p className="text-xs mb-1" style={{color:'#8a8490'}}>{match.awayTeam}</p>
              <input
                type="number"
                min="0"
                max="99"
                value={awayGoals}
                onChange={(e) => setAwayGoals(e.target.value)}
                required
                disabled={isPending}
                className="w-16 h-12 text-center text-xl font-bold rounded-lg focus:outline-none focus:border-brand-purple disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{background:'#f5f2ef', border:'1px solid #e8e4df', color:'#1a1625'}}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending || homeGoals === '' || awayGoals === ''}
              className="btn-primary text-sm py-2 px-5"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Pontuando {predTotal} palpites...
                </span>
              ) : (
                `Confirmar e Pontuar (${predTotal})`
              )}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-ghost text-sm"
            >
              Cancelar
            </button>
          </div>

          {feedback && (
            <p
              className={`text-xs ${
                feedback.ok ? 'text-brand-neon' : 'text-brand-pink'
              }`}
            >
              {feedback.msg}
            </p>
          )}
        </form>
      )}
    </div>
  )
}
