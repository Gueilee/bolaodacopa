'use client'

import { useState, useTransition } from 'react'
import { saveTournamentPrediction } from '@/app/actions/tournament'

const TEAMS_2026 = [
  'Brasil', 'Argentina', 'França', 'Espanha', 'Alemanha',
  'Portugal', 'Inglaterra', 'Países Baixos', 'EUA', 'México',
  'Uruguai', 'Colômbia', 'Bélgica', 'Japão', 'Marrocos',
  'Egito', 'Senegal', 'Austrália', 'Canadá', 'Coreia do Sul',
]

type ExistingPrediction = {
  champion:    string
  runnerUp:    string
  topScorer:   string
  isScored:    boolean
  bonusPoints: number
}

type Props = {
  existing:       ExistingPrediction | null
  isPastDeadline: boolean
  cupStartISO:    string
}

function InfoBox({ children, variant }: { children: React.ReactNode; variant: 'success' | 'warning' | 'error' }) {
  const styles = {
    success: { bg: 'rgba(1,168,102,0.08)', border: 'rgba(1,168,102,0.25)', color: '#01a866' },
    warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', color: '#d97706' },
    error:   { bg: 'rgba(255,47,105,0.08)', border: 'rgba(255,47,105,0.25)', color: '#ff2f69' },
  }[variant]
  return (
    <div style={{
      padding: '14px 18px', borderRadius: 14,
      background: styles.bg, border: `1px solid ${styles.border}`, color: styles.color,
      fontSize: 13, fontWeight: 500, lineHeight: 1.6,
    }}>
      {children}
    </div>
  )
}

export function FinaisForm({ existing, isPastDeadline, cupStartISO }: Props) {
  const [champion,  setChampion]  = useState('')
  const [runnerUp,  setRunnerUp]  = useState('')
  const [topScorer, setTopScorer] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const isValid = champion && runnerUp && topScorer && champion !== runnerUp

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setError(null)
    startTransition(async () => {
      const result = await saveTournamentPrediction({ champion, runnerUp, topScorer })
      if (result.success) {
        setSaved(true)
      } else {
        setError(result.error ?? 'Erro ao salvar.')
      }
    })
  }

  const cupDate = new Date(cupStartISO)
  const deadlineStr = cupDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const deadlineTime = cupDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })

  // ── Estado 1: palpite já registrado (imutável) ─────────────────────────────
  if (existing || saved) {
    const data = saved
      ? { champion, runnerUp, topScorer, isScored: false, bonusPoints: 0 }
      : existing!

    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1625', margin: 0, letterSpacing: '-0.02em' }}>
            🌟 Palpite Final
          </h1>
          <p style={{ fontSize: 13, color: '#8a8490', marginTop: 4 }}>
            Deadline: {deadlineStr} às {deadlineTime} (horário de Brasília)
          </p>
        </div>

        {/* Card de confirmação */}
        <div style={{
          borderRadius: 20, overflow: 'hidden',
          border: '2px solid rgba(1,168,102,0.3)',
          boxShadow: '0 4px 24px rgba(1,168,102,0.1)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #01a866, #008a54)',
            padding: '16px 24px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 24 }}>🔒</span>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#fff' }}>
                Palpite registrado e bloqueado
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                Não pode ser alterado em hipótese alguma
              </p>
            </div>
          </div>

          <div style={{ padding: '24px', background: '#f9fdf9' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '🏆', label: 'Campeão',      value: data.champion  },
                { icon: '🥈', label: 'Vice-campeão', value: data.runnerUp  },
                { icon: '⚽', label: 'Artilheiro',   value: data.topScorer },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', borderRadius: 14,
                  background: '#fff', border: '1px solid rgba(1,168,102,0.2)',
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.1em', color: '#8a8490' }}>{item.label}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 15, fontWeight: 800, color: '#1a1625' }}>
                      {item.value}
                    </p>
                  </div>
                  <span style={{ fontSize: 18, color: '#01a866' }}>✓</span>
                </div>
              ))}
            </div>

            {data.isScored && (
              <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 14,
                background: 'rgba(1,168,102,0.08)', border: '1px solid rgba(1,168,102,0.2)' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#01a866', fontWeight: 700 }}>
                  🏅 Bônus computado: +{data.bonusPoints} pts
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabela de bônus */}
        <BonusTable />
      </div>
    )
  }

  // ── Estado 2: prazo encerrado sem palpite ──────────────────────────────────
  if (isPastDeadline) {
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1625', margin: 0, letterSpacing: '-0.02em' }}>
            🌟 Palpite Final
          </h1>
          <p style={{ fontSize: 13, color: '#8a8490', marginTop: 4 }}>
            Deadline: {deadlineStr} às {deadlineTime} (horário de Brasília)
          </p>
        </div>

        <div style={{
          borderRadius: 20, overflow: 'hidden',
          border: '2px solid rgba(255,47,105,0.3)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff2f69, #cc1a50)',
            padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{ fontSize: 32 }}>⏰</span>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#fff' }}>
                Prazo encerrado
              </p>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>
                A Copa já começou — palpite final não foi registrado
              </p>
            </div>
          </div>
          <div style={{ padding: '20px 24px', background: '#fff8f9' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#4a4555', lineHeight: 1.6 }}>
              Você não registrou seu palpite final antes do início da Copa em{' '}
              <strong>{deadlineStr}</strong>. Os bônus de campeão, vice e artilheiro
              <strong style={{ color: '#ff2f69' }}> não serão contabilizados</strong> para você neste bolão.
            </p>
          </div>
        </div>

        <BonusTable />
      </div>
    )
  }

  // ── Estado 3: formulário disponível ───────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1625', margin: 0, letterSpacing: '-0.02em' }}>
          🌟 Palpite Final
        </h1>
        <p style={{ fontSize: 13, color: '#8a8490', marginTop: 4 }}>
          Registre antes de <strong style={{ color: '#ff2f69' }}>{deadlineStr} às {deadlineTime}</strong> — após isso, não há como registrar.
        </p>
      </div>

      {/* Aviso importante */}
      <div style={{
        padding: '14px 18px', borderRadius: 14,
        background: 'rgba(255,47,105,0.06)', border: '1.5px solid rgba(255,47,105,0.2)',
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: 13, color: '#4a4555', lineHeight: 1.6 }}>
          <strong style={{ color: '#ff2f69' }}>Atenção:</strong> ao salvar, o palpite fica bloqueado permanentemente
          e não pode ser alterado. Confira bem antes de confirmar.
        </p>
      </div>

      <BonusTable />

      {/* Formulário */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#4a4555', display: 'flex', alignItems: 'center', gap: 6 }}>
            🏆 Campeão
          </label>
          <select value={champion} onChange={(e) => setChampion(e.target.value)}
            required disabled={isPending} className="input-field">
            <option value="">Selecione um país...</option>
            {TEAMS_2026.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#4a4555', display: 'flex', alignItems: 'center', gap: 6 }}>
            🥈 Vice-campeão
          </label>
          <select value={runnerUp} onChange={(e) => setRunnerUp(e.target.value)}
            required disabled={isPending} className="input-field">
            <option value="">Selecione um país...</option>
            {TEAMS_2026.filter((t) => t !== champion).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {champion && runnerUp && champion === runnerUp && (
            <p style={{ fontSize: 12, color: '#ff2f69', margin: 0 }}>Campeão e vice não podem ser o mesmo país.</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#4a4555', display: 'flex', alignItems: 'center', gap: 6 }}>
            ⚽ Artilheiro
          </label>
          <input type="text" value={topScorer} onChange={(e) => setTopScorer(e.target.value)}
            required disabled={isPending} placeholder="Nome completo do jogador" className="input-field" />
          <p style={{ fontSize: 11, color: '#8a8490', margin: 0 }}>
            Ex: Vinicius Jr., Kylian Mbappé, Lionel Messi
          </p>
        </div>

        {error && <InfoBox variant="error">⚠ {error}</InfoBox>}

        <button type="submit" disabled={isPending || !isValid} className="btn-primary w-full"
          style={{ fontSize: 15, padding: '14px' }}>
          {isPending ? 'Salvando...' : '🔒 Confirmar Palpite Final'}
        </button>

        <p style={{ fontSize: 11, color: '#aaa8b0', textAlign: 'center', margin: 0 }}>
          Após confirmar, o palpite fica bloqueado permanentemente.
        </p>
      </form>
    </div>
  )
}

function BonusTable() {
  return (
    <div className="card p-5" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8a8490', margin: 0 }}>
        Pontuação de bônus
      </p>
      {[
        { label: '🏆 Campeão correto',      pts: '+50 pts' },
        { label: '⚽ Artilheiro correto',   pts: '+50 pts' },
        { label: '🥈 Vice-campeão correto', pts: '+25 pts' },
      ].map((row) => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#4a4555' }}>{row.label}</span>
          <span className="points-badge">{row.pts}</span>
        </div>
      ))}
    </div>
  )
}
