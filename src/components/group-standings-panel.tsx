import type { GroupStandings } from '@/lib/bracket'
import { TeamFlag } from '@/components/team-flag'

// Cabeçalhos das colunas da tabela
const COLS = ['J', 'V', 'E', 'D', 'SG', 'Pts']

function GroupTable({ gs }: { gs: GroupStandings }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e8e4df',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Cabeçalho do grupo */}
      <div
        style={{
          background: '#422c76',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 800, color: '#01E18E', letterSpacing: '0.08em' }}>
          GRUPO {gs.group}
        </span>
      </div>

      {/* Linhas das colunas */}
      <div style={{ padding: '4px 10px 6px' }}>
        {/* Header colunas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '20px 1fr 24px 24px 24px 24px 28px 28px',
            gap: 2,
            padding: '4px 0 2px',
            marginBottom: 2,
          }}
        >
          <span />
          <span />
          {COLS.map(c => (
            <span
              key={c}
              style={{ fontSize: 9, fontWeight: 700, color: '#aaa', textAlign: 'center', textTransform: 'uppercase' }}
            >
              {c}
            </span>
          ))}
        </div>

        {gs.teams.map((team, idx) => {
          const isQualified   = idx < 2                              // top 2 → verde
          const isMaybeThird  = idx === 2                            // 3º → pode avançar
          const isEliminated  = idx === 3                            // 4º → eliminado

          const rowBg =
            isQualified  ? 'rgba(1,225,142,0.06)'  :
            isMaybeThird ? 'rgba(255,180,0,0.06)'  :
            'transparent'

          const posColor =
            isQualified  ? '#01E18E' :
            isMaybeThird ? '#f5a623' :
            '#c4bfba'

          const teamColor = isEliminated ? '#b0acb5' : '#1a1625'

          return (
            <div
              key={team.team}
              style={{
                display: 'grid',
                gridTemplateColumns: '20px 1fr 24px 24px 24px 24px 28px 28px',
                gap: 2,
                alignItems: 'center',
                padding: '5px 4px',
                borderRadius: 8,
                background: rowBg,
                marginBottom: idx < 3 ? 1 : 0,
                borderBottom: idx < 3 ? '1px solid #f5f2ef' : 'none',
              }}
            >
              {/* Posição */}
              <span style={{ fontSize: 10, fontWeight: 800, color: posColor, textAlign: 'center' }}>
                {idx + 1}
              </span>

              {/* Bandeira + nome */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                <TeamFlag teamName={team.team} size={18} />
                <span style={{
                  fontSize: 11, fontWeight: isQualified ? 700 : 500,
                  color: teamColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {team.team}
                </span>
              </div>

              {/* J V E D SG Pts */}
              {[team.played, team.won, team.drawn, team.lost,
                team.gd >= 0 ? `+${team.gd}` : `${team.gd}`,
                team.pts,
              ].map((val, ci) => (
                <span
                  key={ci}
                  style={{
                    fontSize: ci === 5 ? 12 : 10,
                    fontWeight: ci === 5 ? 800 : 400,
                    color:
                      ci === 5 && isQualified  ? '#01E18E' :
                      ci === 5 && isMaybeThird ? '#f5a623' :
                      isEliminated             ? '#c4bfba' :
                      '#4a4555',
                    textAlign: 'center',
                    tabularNums: 'tabular-nums',
                  } as React.CSSProperties}
                >
                  {val}
                </span>
              ))}
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div style={{
        display: 'flex', gap: 10, padding: '6px 14px',
        borderTop: '1px solid #f0ede8',
        background: '#faf9f7',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#01E18E' }} />
          <span style={{ fontSize: 9, color: '#8a8490' }}>Classificado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f5a623' }} />
          <span style={{ fontSize: 9, color: '#8a8490' }}>3º (possível)</span>
        </div>
      </div>
    </div>
  )
}

type Props = {
  standings: GroupStandings[]
}

export function GroupStandingsPanel({ standings }: Props) {
  return (
    <section className="space-y-3">
      {/* Título da seção */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 4px',
      }}>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#6b6672' }}>
            📊 Classificação dos Grupos
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#aaa8b0' }}>
            Calculada a partir dos seus palpites
          </p>
        </div>
      </div>

      {/* Grid de grupos: 3 cols em desktop, 2 em tablet, 1 em mobile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {standings.map((gs) => (
          <GroupTable key={gs.group} gs={gs} />
        ))}
      </div>

      {/* Nota informativa */}
      <p style={{ fontSize: 11, color: '#aaa8b0', textAlign: 'center', paddingTop: 4 }}>
        Os 8 melhores 3ºs colocados também avançam para a 1ª Fase Eliminatória
      </p>
    </section>
  )
}
