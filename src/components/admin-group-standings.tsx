import { computeGroupStandings, type GroupStandings } from '@/lib/bracket'
import type { AdminMatch } from '@/lib/queries'

type Props = { matches: AdminMatch[]; group: string }

export function AdminGroupStandings({ matches, group }: Props) {
  // Apenas partidas encerradas com resultado real
  const finished = matches.filter(m => m.status === 'finished' && m.homeScore !== null)
  if (finished.length === 0) return null

  const matchData = matches.map(m => ({
    id:                 m.id,
    phase:              m.phase,
    groupName:          m.groupName,
    matchNumber:        m.matchNumber,
    homeTeam:           m.homeTeam,
    awayTeam:           m.awayTeam,
    status:             m.status,
    predictedHomeScore: null,   // admin usa só resultados reais
    predictedAwayScore: null,
    actualHomeScore:    m.homeScore ?? null,
    actualAwayScore:    m.awayScore ?? null,
  }))

  const standings: GroupStandings[] = computeGroupStandings(matchData)
  const groupData = standings.find(s => s.group === group)
  if (!groupData) return null

  const qualify = [1, 2]   // top-2 avançam no formato 12 grupos / 32 times

  return (
    <div style={{
      margin: '0 16px 8px',
      borderRadius: 10,
      border: '1px solid #e8e4df',
      overflow: 'hidden',
      background: '#faf9f8',
    }}>
      {/* Cabeçalho */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 28px 28px 28px 28px 28px 36px',
        gap: 0,
        padding: '6px 12px',
        background: '#f0ede8',
        borderBottom: '1px solid #e8e4df',
      }}>
        {['TIME', 'J', 'V', 'E', 'D', 'SG', 'PTS'].map(h => (
          <span key={h} style={{
            fontSize: 9, fontWeight: 800, color: '#8a8490',
            letterSpacing: '0.1em', textAlign: h === 'TIME' ? 'left' : 'center',
          }}>
            {h}
          </span>
        ))}
      </div>

      {/* Linhas */}
      {groupData.teams.map((t, i) => {
        const isQualified = qualify.includes(t.position)
        return (
          <div key={t.team} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 28px 28px 28px 28px 28px 36px',
            gap: 0,
            padding: '6px 12px',
            borderTop: i > 0 ? '1px solid #f0ede8' : 'none',
            background: isQualified ? 'rgba(1,225,142,0.04)' : 'transparent',
          }}>
            {/* Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isQualified && (
                <div style={{
                  width: 3, height: 16, borderRadius: 2,
                  background: '#01E18E', flexShrink: 0,
                }} />
              )}
              <span style={{
                fontSize: 11, fontWeight: isQualified ? 700 : 500,
                color: isQualified ? '#1a1625' : '#4a4555',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {t.team}
              </span>
            </div>

            {[t.played, t.won, t.drawn, t.lost, t.gd > 0 ? `+${t.gd}` : t.gd].map((v, j) => (
              <span key={j} style={{
                fontSize: 11, color: '#6b6672', textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {v}
              </span>
            ))}

            {/* PTS */}
            <span style={{
              fontSize: 12, fontWeight: 800,
              color: isQualified ? '#422c76' : '#1a1625',
              textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {t.pts}
            </span>
          </div>
        )
      })}

      <div style={{ padding: '4px 12px 5px', background: '#f0ede8' }}>
        <span style={{ fontSize: 9, color: '#aaa8b0' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#01E18E', marginRight: 4, verticalAlign: 'middle' }} />
          Classifica para a próxima fase
        </span>
      </div>
    </div>
  )
}
