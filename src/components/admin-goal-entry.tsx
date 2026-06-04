'use client'

import { useState, useTransition, useEffect } from 'react'
import { addGoal, removeGoal, getMatchGoals } from '@/app/actions/goals'
import type { MatchGoal } from '@/db/schema'
import { getFlagUrl } from '@/lib/flags'

// Jogadores conhecidos para autocomplete
const KNOWN_PLAYERS = [
  'Cristiano Ronaldo','Lionel Messi','Kylian Mbappé','Neymar','Harry Kane',
  'Erling Haaland','Robert Lewandowski','Romelu Lukaku','Mohamed Salah',
  'Son Heung-min','Memphis Depay','Lautaro Martínez','Julián Álvarez',
  'Victor Osimhen','Vinícius Júnior','Endrick','Raphinha',
  'Ousmane Dembélé','Randal Kolo Muani','Marcus Rashford','Bukayo Saka',
  'Jude Bellingham','Gonçalo Ramos','Rafael Leão','Dušan Vlahović',
  'Jonathan David','Sadio Mané','Nicolas Jackson','Christian Pulisic',
  'Takefusa Kubo','Mohammed Kudus','Cole Palmer','Kai Havertz',
  'Florian Wirtz','Jamal Musiala','Viktor Gyökeres','Alexander Isak',
  'Ayase Ueda','Cody Gakpo','Mehdi Taremi','Sardar Azmoun',
]

function FlagImg({ country, size = 20 }: { country: string; size?: number }) {
  const url = getFlagUrl(country, size)
  if (!url) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={country} style={{ width: size, height: Math.round(size * 0.67), objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
}

type Props = {
  matchId:  string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
}

export function AdminGoalEntry({ matchId, homeTeam, awayTeam, homeScore, awayScore }: Props) {
  const [goals, setGoals]     = useState<MatchGoal[]>([])
  const [loaded, setLoaded]   = useState(false)
  const [isPending, start]    = useTransition()

  // Form state
  const [player,   setPlayer]  = useState('')
  const [team,     setTeam]    = useState<'home' | 'away'>('home')
  const [minute,   setMinute]  = useState('')
  const [ownGoal,  setOwnGoal] = useState(false)
  const [error,    setError]   = useState<string | null>(null)

  const country = team === 'home' ? homeTeam : awayTeam
  // Gols registrados por time
  const homeGoals = goals.filter(g => g.country === homeTeam && !g.isOwnGoal).length
              + goals.filter(g => g.country === awayTeam && g.isOwnGoal).length
  const awayGoals = goals.filter(g => g.country === awayTeam && !g.isOwnGoal).length
              + goals.filter(g => g.country === homeTeam && g.isOwnGoal).length

  useEffect(() => {
    getMatchGoals(matchId).then(data => {
      setGoals(data)
      setLoaded(true)
    })
  }, [matchId])

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!player.trim()) { setError('Informe o nome do jogador.'); return }
    setError(null)
    start(async () => {
      const res = await addGoal({
        matchId,
        playerName: player.trim(),
        country:    ownGoal ? (team === 'home' ? awayTeam : homeTeam) : country,
        isOwnGoal:  ownGoal,
        minute:     minute ? Number(minute) : null,
      })
      if (res.success) {
        const updated = await getMatchGoals(matchId)
        setGoals(updated)
        setPlayer(''); setMinute(''); setOwnGoal(false)
      } else {
        setError(res.error ?? 'Erro ao adicionar gol.')
      }
    })
  }

  async function handleRemove(id: string) {
    await removeGoal(id)
    const updated = await getMatchGoals(matchId)
    setGoals(updated)
  }

  return (
    <div style={{ marginTop: 12, borderTop: '1px solid #f0ede8', paddingTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8a8490' }}>
          ⚽ Artilharia da partida
        </p>
        {/* Contador */}
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#6b6672' }}>
          <span style={{ color: homeGoals === homeScore ? '#01a866' : '#ff2f69', fontWeight: 700 }}>
            {homeTeam}: {homeGoals}/{homeScore} gols
          </span>
          <span style={{ color: awayGoals === awayScore ? '#01a866' : '#ff2f69', fontWeight: 700 }}>
            {awayTeam}: {awayGoals}/{awayScore} gols
          </span>
        </div>
      </div>

      {/* Lista de gols registrados */}
      {loaded && goals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          {goals.map(g => (
            <div key={g.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
              borderRadius: 8, background: g.isOwnGoal ? 'rgba(255,47,105,0.05)' : 'rgba(1,168,102,0.05)',
              border: `1px solid ${g.isOwnGoal ? 'rgba(255,47,105,0.15)' : 'rgba(1,168,102,0.15)'}`,
            }}>
              <FlagImg country={g.country} size={18} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1625', flex: 1 }}>
                {g.playerName}
                {g.isOwnGoal && <span style={{ fontSize: 10, color: '#ff2f69', marginLeft: 4 }}>(contra)</span>}
              </span>
              {g.minute && (
                <span style={{ fontSize: 11, color: '#aaa8b0' }}>{g.minute}&apos;</span>
              )}
              <span style={{ fontSize: 11, color: '#8a8490' }}>{g.country}</span>
              <button onClick={() => handleRemove(g.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#c4bfba',
                fontSize: 16, lineHeight: 1, padding: '0 2px',
              }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Formulário para adicionar gol */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>

        {/* Selecionar time */}
        <select value={team} onChange={e => setTeam(e.target.value as 'home' | 'away')}
          style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, border: '1px solid #e0dbd5',
            background: '#fff', color: '#1a1625', cursor: 'pointer' }}>
          <option value="home">{homeTeam}</option>
          <option value="away">{awayTeam}</option>
        </select>

        {/* Nome do jogador */}
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <input
            list={`players-${matchId}`}
            value={player}
            onChange={e => setPlayer(e.target.value)}
            placeholder="Nome do jogador"
            style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '6px 10px',
              borderRadius: 8, border: '1px solid #e0dbd5', background: '#fff', color: '#1a1625', outline: 'none' }}
          />
          <datalist id={`players-${matchId}`}>
            {KNOWN_PLAYERS.map(p => <option key={p} value={p} />)}
          </datalist>
        </div>

        {/* Minuto (opcional) */}
        <input
          type="number" min="1" max="120"
          value={minute}
          onChange={e => setMinute(e.target.value)}
          placeholder="Min"
          style={{ width: 60, fontSize: 12, padding: '6px 8px', borderRadius: 8,
            border: '1px solid #e0dbd5', background: '#fff', color: '#1a1625', outline: 'none' }}
        />

        {/* Gol contra */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b6672', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={ownGoal} onChange={e => setOwnGoal(e.target.checked)}
            style={{ width: 14, height: 14, cursor: 'pointer' }} />
          Gol contra
        </label>

        <button type="submit" disabled={isPending || !player.trim()} style={{
          padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
          background: isPending || !player.trim() ? '#e8e4df' : '#422c76',
          color: isPending || !player.trim() ? '#aaa8b0' : '#fff',
          transition: 'all 0.15s',
        }}>
          {isPending ? '…' : '+ Gol'}
        </button>
      </form>

      {error && (
        <p style={{ fontSize: 11, color: '#ff2f69', margin: '6px 0 0' }}>{error}</p>
      )}
    </div>
  )
}
