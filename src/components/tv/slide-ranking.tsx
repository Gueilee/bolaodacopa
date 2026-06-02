'use client'

import type { TvRankingEntry } from '@/lib/tv-data'

const MEDALS = ['🥇', '🥈', '🥉']
const PODIUM_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']

export function SlideRanking({ entries }: { entries: TvRankingEntry[] }) {
  const top3  = entries.slice(0, 3)
  const rest  = entries.slice(3, 12)

  function initials(name: string) {
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      padding: '0 60px', gap: 32,
    }}>
      <h2 style={{ fontSize: 36, fontWeight: 900, color: 'white', margin: 0, textAlign: 'center', letterSpacing: '-0.01em' }}>
        🏆 Ranking Individual
      </h2>

      <div style={{ display: 'flex', gap: 48, flex: 1, minHeight: 0 }}>

        {/* Podium — top 3 */}
        <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
          {top3.map((entry, i) => (
            <div key={entry.position} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: `rgba(${i === 0 ? '255,215,0' : i === 1 ? '192,192,192' : '205,127,50'},0.08)`,
              border: `2px solid rgba(${i === 0 ? '255,215,0' : i === 1 ? '192,192,192' : '205,127,50'},0.3)`,
              borderRadius: 16, padding: '16px 20px',
            }}>
              <span style={{ fontSize: 32 }}>{MEDALS[i]}</span>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: `rgba(${i === 0 ? '255,215,0' : i === 1 ? '192,192,192' : '205,127,50'},0.2)`,
                border: `2px solid ${PODIUM_COLORS[i]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, color: PODIUM_COLORS[i],
              }}>
                {initials(entry.name)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>{entry.name}</p>
                {entry.department && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{entry.department}</p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: PODIUM_COLORS[i], margin: 0 }}>{entry.totalPoints}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>pontos</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rest — positions 4-12 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
          {rest.map((entry) => (
            <div key={entry.position} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.3)', width: 28, textAlign: 'right' }}>
                {entry.position}º
              </span>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(66,44,118,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#c4aff8',
              }}>
                {initials(entry.name)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>{entry.name}</p>
                {entry.department && (
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{entry.department}</p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {entry.exactCount > 0 && (
                  <span style={{ fontSize: 12, color: '#01E18E' }}>⚡ {entry.exactCount}</span>
                )}
                <span style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>
                  {entry.totalPoints}
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>pts</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
