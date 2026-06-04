'use client'

import type { TvManager } from '@/lib/tv-data'

export function SlideManagers({ managers }: { managers: TvManager[] }) {
  if (managers.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <span style={{ fontSize: 80 }}>👔</span>
        <p style={{ color: 'white', fontSize: 28, fontWeight: 700, margin: 0 }}>Nenhum gestor cadastrado</p>
      </div>
    )
  }

  const top3   = managers.slice(0, 3)
  const rest   = managers.slice(3, 13)  // até 10 linhas abaixo

  const medalColors = ['#f5c518', '#a0a0a0', '#cd7f32']

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 48px', gap: 16 }}>

      {/* Top 3 destaque */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {top3.map((m, i) => (
          <div
            key={m.manager}
            style={{
              background: i === 0
                ? 'linear-gradient(135deg, rgba(245,197,24,0.18), rgba(0,0,0,0.5))'
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${medalColors[i]}40`,
              borderRadius: 18,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: medalColors[i], lineHeight: 1 }}>
                {i + 1}º
              </span>
            </div>
            <p style={{
              fontSize: 15, fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {m.manager}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: medalColors[i], fontVariantNumeric: 'tabular-nums' }}>
                {m.totalPoints}
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 3 }}>pts</span>
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                {m.participants} colaboradores
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              ⭐ {m.leader.split(' ')[0]}
            </p>
          </div>
        ))}
      </div>

      {/* Demais posições */}
      {rest.length > 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {rest.map((m, i) => (
            <div
              key={m.manager}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr 80px 60px',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                padding: '8px 16px',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
                {i + 4}º
              </span>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: 0,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {m.manager}
              </p>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
                {m.participants} colabor.
              </span>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#01E18E', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {m.totalPoints}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
