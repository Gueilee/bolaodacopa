'use client'

import { useState, useTransition } from 'react'
import { scoreMatch } from '@/app/actions/scoring'
import { formatMatchTime, formatMatchDate } from '@/lib/utils'
import { TeamFlag } from '@/components/team-flag'
import { AdminGoalEntry } from '@/components/admin-goal-entry'
import type { AdminMatch } from '@/lib/queries'

type Props = { match: AdminMatch }

export function AdminMatchRow({ match }: Props) {
  const isFinished = match.status === 'finished'
  const isScored   = match.isScored

  const [home, setHome]         = useState(match.homeScore?.toString() ?? '')
  const [away, setAway]         = useState(match.awayScore?.toString() ?? '')
  const [open, setOpen]         = useState(false)
  const [isPending, startTx]    = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  const predTotal  = match.predictions.length
  const predScored = match.predictions.filter(p => p.isScored).length

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)
    startTx(async () => {
      const res = await scoreMatch(match.id, Number(home), Number(away))
      if (res.success) {
        setFeedback({ ok: true, msg: `✓ ${res.scored} palpites pontuados` })
        setOpen(false)
      } else {
        setFeedback({ ok: false, msg: res.error ?? 'Erro ao pontuar.' })
      }
    })
  }

  return (
    <div style={{ borderBottom: '1px solid #f0ede8' }}>
      {/* ── Linha do jogo ── */}
      <div className="px-4 py-3">

        {/* Meta: data · hora · local */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <span className="text-[10px]" style={{ color: '#aaa8b0' }}>
              {formatMatchDate(match.matchDate)} · {formatMatchTime(match.matchDate)}
            </span>
            {match.venue && (
              <p className="text-[10px] mt-0.5" style={{ color: '#aaa8b0' }}>
                📍 {match.venue}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Badge de palpites */}
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: '#f0ede8', color: '#8a8490' }}>
              {predScored}/{predTotal} pts
            </span>

            {isScored ? (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(1,225,142,0.12)', color: '#01a866' }}>
                ✓ Pontuado
              </span>
            ) : isFinished ? (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                style={{ background: '#fff0f3', color: '#ff2f69' }}>
                Aguard. pontuação
              </span>
            ) : null}
          </div>
        </div>

        {/* Times + placar */}
        <div className="flex items-center gap-2">

          {/* Time da casa */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
            <span className="text-xs font-bold truncate" style={{ color: '#1a1625' }}>
              {match.homeTeam}
            </span>
            <TeamFlag teamName={match.homeTeam} size={28} />
          </div>

          {/* Placar central */}
          <div className="shrink-0 flex items-center gap-1.5">
            {isFinished ? (
              <>
                <span className="w-10 h-10 flex items-center justify-center rounded-xl font-black text-base tabular-nums"
                  style={{ background: '#f0ede8', border: '1.5px solid #e0dbd5', color: '#1a1625' }}>
                  {match.homeScore}
                </span>
                <span className="text-xs font-light" style={{ color: '#c4bfba' }}>×</span>
                <span className="w-10 h-10 flex items-center justify-center rounded-xl font-black text-base tabular-nums"
                  style={{ background: '#f0ede8', border: '1.5px solid #e0dbd5', color: '#1a1625' }}>
                  {match.awayScore}
                </span>
              </>
            ) : (
              <span className="px-3 py-1 rounded-xl text-xs font-semibold"
                style={{ background: '#f0ede8', color: '#8a8490' }}>
                vs
              </span>
            )}
          </div>

          {/* Time visitante */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <TeamFlag teamName={match.awayTeam} size={28} />
            <span className="text-xs font-bold truncate" style={{ color: '#1a1625' }}>
              {match.awayTeam}
            </span>
          </div>

          {/* Botão ação */}
          <div className="shrink-0 ml-2">
            <button
              onClick={() => { setOpen(v => !v); setFeedback(null) }}
              className="text-[11px] font-semibold rounded-lg px-3 py-1.5 transition-all"
              style={{
                background: open ? '#422c76' : isScored ? '#f0ede8' : '#422c76',
                color: open ? '#fff' : isScored ? '#8a8490' : '#fff',
                border: 'none', cursor: 'pointer',
              }}
            >
              {isScored ? 'Corrigir' : isFinished ? 'Pontuar' : 'Resultado'}
            </button>
          </div>
        </div>

        {/* Feedback inline */}
        {feedback && !open && (
          <p className="text-[11px] mt-2 text-center font-semibold"
            style={{ color: feedback.ok ? '#01a866' : '#ff2f69' }}>
            {feedback.msg}
          </p>
        )}
      </div>

      {/* ── Formulário expandido ── */}
      {open && (
        <form
          onSubmit={handleSubmit}
          style={{ background: '#faf9f8', borderTop: '1px solid #f0ede8', padding: '16px 20px' }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3"
            style={{ color: '#8a8490' }}>
            Registrar resultado
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Home */}
            <div className="flex items-center gap-2">
              <TeamFlag teamName={match.homeTeam} size={24} />
              <span className="text-xs font-semibold" style={{ color: '#1a1625' }}>
                {match.homeTeam}
              </span>
              <input
                type="number" min="0" max="99"
                value={home}
                onChange={e => setHome(e.target.value)}
                required disabled={isPending}
                style={{
                  width: 52, height: 44, textAlign: 'center', fontSize: 18,
                  fontWeight: 800, borderRadius: 10, border: '2px solid #d0cbc5',
                  background: '#fff', color: '#1a1625', outline: 'none',
                  appearance: 'textfield',
                }}
              />
            </div>

            <span style={{ fontSize: 20, color: '#c4bfba', fontWeight: 300 }}>×</span>

            {/* Away */}
            <div className="flex items-center gap-2">
              <input
                type="number" min="0" max="99"
                value={away}
                onChange={e => setAway(e.target.value)}
                required disabled={isPending}
                style={{
                  width: 52, height: 44, textAlign: 'center', fontSize: 18,
                  fontWeight: 800, borderRadius: 10, border: '2px solid #d0cbc5',
                  background: '#fff', color: '#1a1625', outline: 'none',
                  appearance: 'textfield',
                }}
              />
              <span className="text-xs font-semibold" style={{ color: '#1a1625' }}>
                {match.awayTeam}
              </span>
              <TeamFlag teamName={match.awayTeam} size={24} />
            </div>

            {/* Botões */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="submit"
                disabled={isPending || home === '' || away === ''}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none',
                  background: isPending || home === '' || away === '' ? '#c4bfba' : '#422c76',
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {isPending ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite', width: 13, height: 13 }}
                      viewBox="0 0 24 24" fill="none">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Pontuando {predTotal}...
                  </>
                ) : (
                  `Confirmar · ${predTotal} palpites`
                )}
              </button>
              <button
                type="button" onClick={() => setOpen(false)}
                style={{
                  padding: '10px 16px', borderRadius: 10,
                  border: '1px solid #e0dbd5', background: '#fff',
                  color: '#6b6672', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>

          {feedback && (
            <p className="text-xs mt-3 font-semibold"
              style={{ color: feedback.ok ? '#01a866' : '#ff2f69' }}>
              {feedback.msg}
            </p>
          )}
        </form>
      )}

      {/* ── Artilharia: sempre visível para jogos finalizados ── */}
      {isFinished && match.homeScore !== null && match.awayScore !== null && (
        <div style={{ padding: '0 20px 16px', background: '#faf9f8' }}>
          <AdminGoalEntry
            matchId={match.id}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            homeScore={match.homeScore}
            awayScore={match.awayScore}
          />
        </div>
      )}
    </div>
  )
}
