'use client'

import type { TvDept } from '@/lib/tv-data'

export function SlideDepartments({ departments }: { departments: TvDept[] }) {
  if (departments.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 24 }}>Nenhum departamento cadastrado ainda.</p>
      </div>
    )
  }

  const maxPoints = departments[0]?.totalPoints || 1

  const DEPT_COLORS = [
    '#FFD700', '#01E18E', '#ff2f69', '#7c3aed', '#0ea5e9',
    '#f97316', '#ec4899', '#84cc16', '#14b8a6', '#a855f7',
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 60px', gap: 16 }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: departments.length > 5 ? '1fr 1fr' : '1fr', gap: 12, alignContent: 'center' }}>
        {departments.slice(0, 10).map((dept, i) => {
          const color = DEPT_COLORS[i % DEPT_COLORS.length]
          const barW  = (dept.totalPoints / maxPoints) * 100
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`

          return (
            <div key={dept.department} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${i < 3 ? color + '33' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 14, padding: '14px 20px',
            }}>
              <span style={{ fontSize: 24, width: 36, textAlign: 'center' }}>{medal}</span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {dept.department}
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 900, color, margin: 0, marginLeft: 12, flexShrink: 0 }}>
                    {dept.totalPoints} <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>pts</span>
                  </p>
                </div>

                {/* Bar */}
                <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: color, width: `${barW}%`,
                    boxShadow: `0 0 8px ${color}80`,
                    transition: 'width 0.8s ease',
                  }} />
                </div>

                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '6px 0 0', display: 'flex', gap: 12 }}>
                  <span>{dept.participants} participante{dept.participants !== 1 ? 's' : ''}</span>
                  <span>· Líder: {dept.leader.split(' ')[0]}</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
