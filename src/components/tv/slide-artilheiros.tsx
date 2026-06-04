'use client'

import { useState } from 'react'
import type { TvScorer } from '@/lib/tv-data'
import { getFlagUrl } from '@/lib/flags'

function Flag({ country }: { country: string }) {
  const [failed, setFailed] = useState(false)
  const url = getFlagUrl(country, 40)
  if (!url || failed) return <span style={{ fontSize: 22 }}>🏳</span>
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={country} width={44} height={29} style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} onError={() => setFailed(true)} />
}

const MEDALS = ['🥇', '🥈', '🥉']

export function SlideArtilheiros({ scorers }: { scorers: TvScorer[] }) {
  const top10 = scorers.slice(0, 10)
  const hasRealData = scorers.some(s => s.goals > 0)
  const half = Math.ceil(top10.length / 2)
  const left = top10.slice(0, half)
  const right = top10.slice(half)

  return (
    <div style={{ height: '100%', padding: '0 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {!hasRealData && (
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
            Prováveis artilheiros · Copa do Mundo 2026
          </span>
        </div>
      )}

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignContent: 'center' }}>
        {[left, right].map((col, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {col.map((s, i) => {
              const pos = ci * half + i
              const isTop3 = pos < 3

              return (
                <div key={s.playerName} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: isTop3 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                  border: isTop3 ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14, padding: '10px 16px',
                  transition: 'all 0.2s',
                }}>
                  {/* Posição */}
                  <div style={{ minWidth: 32, textAlign: 'center' }}>
                    {isTop3 ? (
                      <span style={{ fontSize: 22 }}>{MEDALS[pos]}</span>
                    ) : (
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.35)' }}>{pos + 1}º</span>
                    )}
                  </div>

                  {/* Flag */}
                  <Flag country={s.country} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.playerName}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.country}</p>
                  </div>

                  {/* Gols */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: hasRealData ? '#01E18E' : 'rgba(255,255,255,0.3)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                      {s.goals}
                    </p>
                    <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {s.goals === 1 ? 'gol' : 'gols'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
