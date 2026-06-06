import { getSession }    from '@/lib/session'
import { redirect }      from 'next/navigation'
import { getTopScorers } from '@/app/actions/goals'
import { FlagImg }       from '@/components/flag-img'

export const revalidate = 60
export const metadata   = { title: 'Artilheiros | Admin Bolão Copa 2026' }

function Medal({ pos }: { pos: number }) {
  if (pos === 1) return <span style={{ fontSize: 20 }}>🥇</span>
  if (pos === 2) return <span style={{ fontSize: 20 }}>🥈</span>
  if (pos === 3) return <span style={{ fontSize: 20 }}>🥉</span>
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color: '#aaa8b0',
      minWidth: 24, textAlign: 'center', display: 'inline-block' }}>
      {pos}º
    </span>
  )
}

export default async function ArtilheirosPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const scorers    = await getTopScorers()
  const totalGoals = scorers.reduce((s, p) => s + p.goals, 0)

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in" style={{ paddingBottom: 40 }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0d0920 0%, #1a0a2e 60%, #0a1520 100%)',
        borderRadius: 24, padding: '24px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140,
          background: 'radial-gradient(circle, rgba(1,225,142,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>⚽</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#faf9f5', letterSpacing: '-0.02em' }}>
                Artilheiros da Copa
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                Atualizado automaticamente via football-data.org
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: '#01E18E', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {totalGoals}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 10, color: 'rgba(1,225,142,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              gols na copa
            </p>
          </div>
        </div>
      </div>

      {/* Info da fonte */}
      <div className="card p-4" style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(1,168,102,0.04)', border: '1px solid rgba(1,168,102,0.15)',
      }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>🔄</span>
        <p style={{ margin: 0, fontSize: 12, color: '#4a4555', lineHeight: 1.5 }}>
          Os gols são importados automaticamente a cada sync com a <strong style={{ color: '#065f46' }}>football-data.org</strong>.
          O ranking atualiza conforme os jogos são encerrados. Gols contra não contam.
        </p>
      </div>

      {/* Ranking */}
      {scorers.length === 0 ? (
        <div className="card p-12" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>⏳</span>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#1a1625', margin: '0 0 6px' }}>
            Nenhum gol registrado ainda
          </p>
          <p style={{ fontSize: 13, color: '#8a8490', margin: 0 }}>
            Os artilheiros aparecerão aqui conforme os jogos forem sendo encerrados.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '48px 1fr 140px 64px 64px',
            padding: '10px 20px', background: '#faf9f7',
            borderBottom: '1px solid #f0ede8',
          }}>
            {['#', 'Jogador', 'País', 'Gols', 'Pênaltis'].map((h, i) => (
              <span key={h} style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: '#aaa8b0',
                textAlign: i >= 3 ? 'center' : 'left',
              }}>{h}</span>
            ))}
          </div>

          {scorers.map((s, i) => (
            <div key={`${s.playerName}-${s.country}-${i}`} style={{
              display: 'grid', gridTemplateColumns: '48px 1fr 140px 64px 64px',
              padding: '13px 20px', alignItems: 'center',
              borderBottom: i < scorers.length - 1 ? '1px solid #f5f2ef' : 'none',
              background: i === 0 ? 'rgba(212,160,23,0.04)'
                        : i === 1 ? 'rgba(156,163,175,0.04)'
                        : i === 2 ? 'rgba(180,120,70,0.04)'
                        : '#fff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Medal pos={i + 1} />
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1625' }}>
                {s.playerName}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FlagImg country={s.country} />
                <span style={{ fontSize: 12, color: '#6b6672',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.country}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: i === 0 ? '#d4a017' : '#1a1625' }}>
                  {s.goals}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                {s.penalties > 0 ? (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                    background: 'rgba(66,44,118,0.08)', color: '#422c76',
                    border: '1px solid rgba(66,44,118,0.15)',
                  }}>
                    {s.penalties}p
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: '#c4bfba' }}>—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
