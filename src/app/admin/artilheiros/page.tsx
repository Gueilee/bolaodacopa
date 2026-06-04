import { getSession }    from '@/lib/session'
import { redirect }      from 'next/navigation'
import { getTopScorers } from '@/app/actions/goals'
import { getFlagUrl }    from '@/lib/flags'

export const revalidate = 0
export const metadata   = { title: 'Artilheiros | Admin Bolão Copa 2026' }

function FlagImg({ country }: { country: string }) {
  const url = getFlagUrl(country, 24)
  if (!url) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={country} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
}

function Medal({ pos }: { pos: number }) {
  if (pos === 1) return <span style={{ fontSize: 20 }}>🥇</span>
  if (pos === 2) return <span style={{ fontSize: 20 }}>🥈</span>
  if (pos === 3) return <span style={{ fontSize: 20 }}>🥉</span>
  return <span style={{ fontSize: 12, fontWeight: 700, color: '#aaa8b0', minWidth: 24, textAlign: 'center', display: 'inline-block' }}>{pos}º</span>
}

export default async function ArtilheirosPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const scorers = await getTopScorers()

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
                Gols registrados manualmente por partida
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: '#01E18E', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {scorers.reduce((s, p) => s + p.goals, 0)}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 10, color: 'rgba(1,225,142,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              gols registrados
            </p>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="card p-5" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>ℹ️</span>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#1a1625' }}>
            Como registrar gols
          </p>
          <p style={{ margin: 0, fontSize: 13, color: '#4a4555', lineHeight: 1.6 }}>
            Acesse <strong>Painel Admin → Resultados</strong> e clique em qualquer jogo finalizado.
            Na seção <strong>⚽ Artilharia da partida</strong>, selecione o time, digite o nome do jogador
            e clique em <strong>+ Gol</strong>. O ranking abaixo atualiza automaticamente.
          </p>
        </div>
      </div>

      {/* Tabela */}
      {scorers.length === 0 ? (
        <div className="card p-12" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>⚽</span>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#1a1625', margin: '0 0 6px' }}>
            Nenhum gol registrado ainda
          </p>
          <p style={{ fontSize: 13, color: '#8a8490', margin: 0 }}>
            Os gols aparecerão aqui conforme você os registrar nas partidas.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '48px 1fr 100px 80px',
            padding: '10px 20px', background: '#faf9f7',
            borderBottom: '1px solid #f0ede8',
          }}>
            {['#', 'Jogador / País', 'País', 'Gols'].map((h, i) => (
              <span key={h} style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: '#aaa8b0',
                textAlign: i === 3 ? 'center' : 'left',
              }}>{h}</span>
            ))}
          </div>

          {scorers.map((s, i) => (
            <div key={`${s.playerName}-${s.country}`} style={{
              display: 'grid', gridTemplateColumns: '48px 1fr 100px 80px',
              padding: '13px 20px', alignItems: 'center',
              borderBottom: i < scorers.length - 1 ? '1px solid #f5f2ef' : 'none',
              background: i < 3 ? `rgba(${i === 0 ? '212,160,23' : i === 1 ? '156,163,175' : '180,120,70'},0.04)` : '#fff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Medal pos={i + 1} />
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1625' }}>
                {s.playerName}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FlagImg country={s.country} />
                <span style={{ fontSize: 12, color: '#6b6672' }}>{s.country}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  fontSize: 18, fontWeight: 900,
                  color: i === 0 ? '#d4a017' : '#1a1625',
                }}>
                  {s.goals}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
