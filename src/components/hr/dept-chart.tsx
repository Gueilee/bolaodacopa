import type { DeptStats } from '@/lib/hr-analytics'

type Props = { data: DeptStats[] }

function rateConfig(pct: number) {
  if (pct >= 80) return { bar: '#01E18E', badge: { bg: 'rgba(1,168,102,0.1)', color: '#01a866', border: 'rgba(1,168,102,0.25)' } }
  if (pct >= 50) return { bar: '#f59e0b', badge: { bg: 'rgba(245,158,11,0.1)', color: '#d97706', border: 'rgba(245,158,11,0.25)' } }
  return           { bar: '#ff2f69', badge: { bg: 'rgba(255,47,105,0.08)', color: '#ff2f69', border: 'rgba(255,47,105,0.2)' } }
}

export function HrDeptChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <p style={{ fontSize: 14, color: '#8a8490', margin: 0 }}>
          Nenhum departamento cadastrado ainda.
        </p>
      </div>
    )
  }

  const maxTotal = Math.max(...data.map(d => d.total), 1)

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 70px 90px 80px 80px',
        padding: '8px 16px', gap: 8,
        borderBottom: '1px solid #f0ede8',
      }}>
        {['Departamento', 'Colabs', 'Finalizaram', 'Taxa', 'Média pts'].map((h, i) => (
          <span key={h} style={{
            fontSize: 10, fontWeight: 700, color: '#aaa8b0',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            textAlign: i > 0 ? 'center' : 'left',
          }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      {data.map((dept, i) => {
        const cfg = rateConfig(dept.participationRate)
        return (
          <div
            key={dept.department}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 70px 90px 80px 80px',
              padding: '12px 16px', gap: 8, alignItems: 'center',
              borderBottom: i < data.length - 1 ? '1px solid #f5f2ef' : 'none',
              background: i % 2 === 0 ? '#ffffff' : '#faf9f7',
            }}
          >
            {/* Nome + líder + barra */}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1625' }}>
                  {dept.department}
                </span>
                {dept.leader && (
                  <span style={{ fontSize: 10, color: '#aaa8b0', flexShrink: 0 }}>
                    líder: {dept.leader.split(' ')[0]}
                  </span>
                )}
              </div>
              {/* Barra de progresso */}
              <div style={{
                height: 6, borderRadius: 6, overflow: 'hidden',
                width: `${Math.max(15, (dept.total / maxTotal) * 100)}%`,
                background: '#f0ede8', minWidth: 40,
              }}>
                <div style={{
                  height: '100%', borderRadius: 6,
                  width: `${dept.participationRate}%`,
                  background: cfg.bar,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>

            {/* Total */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1625', fontVariantNumeric: 'tabular-nums' }}>
                {dept.total}
              </span>
            </div>

            {/* Finalizados */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#4a4555', fontVariantNumeric: 'tabular-nums' }}>
                {dept.locked}
              </span>
            </div>

            {/* Taxa */}
            <div style={{ textAlign: 'center' }}>
              <span style={{
                fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 20, display: 'inline-block',
                background: cfg.badge.bg, color: cfg.badge.color, border: `1px solid ${cfg.badge.border}`,
              }}>
                {dept.participationRate}%
              </span>
            </div>

            {/* Média pts */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4a4555', fontVariantNumeric: 'tabular-nums' }}>
                {dept.avgPoints > 0 ? dept.avgPoints.toFixed(1) : '—'}
              </span>
            </div>
          </div>
        )
      })}

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 20, padding: '12px 16px', borderTop: '1px solid #f0ede8', flexWrap: 'wrap' }}>
        {[
          { color: '#01E18E', label: '≥ 80% — ótimo' },
          { color: '#f59e0b', label: '50–79% — atenção' },
          { color: '#ff2f69', label: '< 50% — crítico' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 6, borderRadius: 3, background: l.color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: '#8a8490' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
