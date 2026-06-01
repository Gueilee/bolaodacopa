'use client'

import { useState, useTransition } from 'react'
import { saveTournamentPrediction } from '@/app/actions/tournament'

const TEAMS_2026 = [
  'Brasil', 'Argentina', 'França', 'Espanha', 'Alemanha',
  'Portugal', 'Inglaterra', 'Países Baixos', 'EUA', 'México',
  'Uruguai', 'Colômbia', 'Bélgica', 'Japão', 'Marrocos',
  'Egito', 'Senegal', 'Austrália', 'Canadá', 'Coreia do Sul',
]

export default function FinaisPage() {
  const [champion,  setChampion]  = useState('')
  const [runnerUp,  setRunnerUp]  = useState('')
  const [topScorer, setTopScorer] = useState('')
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  const isValid = champion && runnerUp && topScorer && champion !== runnerUp

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setFeedback(null)

    startTransition(async () => {
      const result = await saveTournamentPrediction({ champion, runnerUp, topScorer })
      if (result.success) {
        setFeedback({ ok: true, msg: 'Palpite final salvo! Boa sorte.' })
      } else {
        setFeedback({ ok: false, msg: result.error ?? 'Erro ao salvar.' })
      }
    })
  }

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-brand-cream">Palpite Final</h1>
        <p className="text-white/40 text-sm mt-1">
          Pode ser alterado até o início da Copa.
        </p>
      </div>

      {/* Bonus table */}
      <div className="card p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">
          Pontuação de bônus
        </p>
        {[
          { label: 'Campeão correto',      points: '+50 pts' },
          { label: 'Artilheiro correto',   points: '+50 pts' },
          { label: 'Vice-campeão correto', points: '+25 pts' },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center">
            <span className="text-sm text-white/60">{row.label}</span>
            <span className="points-badge">{row.points}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Champion */}
        <div className="space-y-1.5">
          <label className="block text-sm text-white/60 font-medium">
            🏆 Campeão
          </label>
          <select
            value={champion}
            onChange={(e) => setChampion(e.target.value)}
            required
            disabled={isPending}
            className="input-field"
          >
            <option value="">Selecione um país...</option>
            {TEAMS_2026.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Runner-up */}
        <div className="space-y-1.5">
          <label className="block text-sm text-white/60 font-medium">
            🥈 Vice-campeão
          </label>
          <select
            value={runnerUp}
            onChange={(e) => setRunnerUp(e.target.value)}
            required
            disabled={isPending}
            className="input-field"
          >
            <option value="">Selecione um país...</option>
            {TEAMS_2026.filter((t) => t !== champion).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {champion === runnerUp && runnerUp && (
            <p className="text-brand-pink text-xs">
              Campeão e vice não podem ser o mesmo país.
            </p>
          )}
        </div>

        {/* Top scorer */}
        <div className="space-y-1.5">
          <label className="block text-sm text-white/60 font-medium">
            ⚽ Artilheiro
          </label>
          <input
            type="text"
            value={topScorer}
            onChange={(e) => setTopScorer(e.target.value)}
            required
            disabled={isPending}
            placeholder="Nome completo do jogador"
            className="input-field"
          />
          <p className="text-white/25 text-xs">
            Digite o nome como aparece oficialmente (ex: Vinicius Jr.)
          </p>
        </div>

        {feedback && (
          <div
            className={`text-sm px-4 py-3 rounded-xl border animate-fade-in ${
              feedback.ok
                ? 'bg-brand-neon/10 border-brand-neon/20 text-brand-neon'
                : 'bg-brand-pink/10 border-brand-pink/20 text-brand-pink'
            }`}
          >
            {feedback.msg}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !isValid}
          className="btn-primary w-full"
        >
          {isPending ? 'Salvando...' : 'Confirmar Palpite Final'}
        </button>
      </form>
    </div>
  )
}
