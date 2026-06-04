'use client'

import { useState } from 'react'
import type { TvScorer } from '@/lib/tv-data'
import { getFlagUrl } from '@/lib/flags'

// Top 10 prováveis sempre preenchidos
const PRE_COPA: TvScorer[] = [
  { playerName: 'Kylian Mbappé',      country: 'França',       goals: 0 },
  { playerName: 'Erling Haaland',     country: 'Noruega',      goals: 0 },
  { playerName: 'Vinícius Júnior',    country: 'Brasil',       goals: 0 },
  { playerName: 'Lautaro Martínez',   country: 'Argentina',    goals: 0 },
  { playerName: 'Harry Kane',         country: 'Inglaterra',   goals: 0 },
  { playerName: 'Raphinha',           country: 'Brasil',       goals: 0 },
  { playerName: 'Bukayo Saka',        country: 'Inglaterra',   goals: 0 },
  { playerName: 'Jamal Musiala',      country: 'Alemanha',     goals: 0 },
  { playerName: 'Victor Osimhen',     country: 'Nigéria',      goals: 0 },
  { playerName: 'Viktor Gyökeres',    country: 'Suécia',       goals: 0 },
]

const MEDALS = ['🥇', '🥈', '🥉']

function PlayerPhoto({ url, name }: { url: string; name: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src={url} alt={name} width={44} height={44}
      style={{ objectFit: 'cover', borderRadius: '50%', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
      onError={() => setFailed(true)} />
  )
}

function Flag({ country }: { country: string }) {
  const [failed, setFailed] = useState(false)
  const url = getFlagUrl(country, 80)
  if (!url || failed) return <span style={{ fontSize: 28, lineHeight: 1 }}>🏳</span>
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src={url} alt={country} width={44} height={29}
      style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
      onError={() => setFailed(true)} />
  )
}

export function SlideArtilheiros({ scorers }: { scorers: TvScorer[] }) {
  const hasReal = scorers.some(s => s.goals > 0)
  // Garante sempre 10 entradas: dados reais se houver, senão pré-Copa
  const list = hasReal
    ? [...scorers.slice(0, 10), ...PRE_COPA].slice(0, 10)
    : PRE_COPA

  return (
    <div style={{ height: '100%', padding: '4px 60px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>

      {!hasReal && (
        <p style={{ margin: '0 0 4px', textAlign: 'center', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.18em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
          Prováveis artilheiros · Copa do Mundo 2026
        </p>
      )}

      {/* Lista única de 10 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
        {list.map((s, i) => {
          const isTop3 = i < 3
          return (
            <div key={`${s.playerName}-${i}`} style={{
              display: 'grid',
              gridTemplateColumns: '44px 56px 1fr 130px 64px',
              alignItems: 'center', gap: 14,
              padding: '10px 18px',
              borderRadius: 12,
              background: isTop3
                ? 'rgba(255,255,255,0.09)'
                : 'rgba(255,255,255,0.04)',
              border: isTop3
                ? '1px solid rgba(255,255,255,0.14)'
                : '1px solid rgba(255,255,255,0.06)',
            }}>
              {/* Posição */}
              <div style={{ textAlign: 'center' }}>
                {isTop3
                  ? <span style={{ fontSize: 22 }}>{MEDALS[i]}</span>
                  : <span style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>{i + 1}º</span>}
              </div>

              {/* Foto ou bandeira */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {s.photoUrl ? (
                  <PlayerPhoto url={s.photoUrl} name={s.playerName} />
                ) : (
                  <Flag country={s.country} />
                )}
              </div>

              {/* Nome + bandeira inline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                {s.photoUrl && <Flag country={s.country} />}
                <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'rgba(255,255,255,0.9)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.playerName}
                </p>
              </div>

              {/* País */}
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
                {s.country}
              </p>

              {/* Gols */}
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: hasReal && s.goals > 0 ? 24 : 18,
                  fontWeight: 900,
                  color: hasReal && s.goals > 0 ? '#01E18E' : 'rgba(255,255,255,0.2)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {s.goals}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 3 }}>
                  {s.goals === 1 ? 'gol' : 'gols'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
