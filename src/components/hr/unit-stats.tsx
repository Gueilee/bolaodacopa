import type { UnitRankEntry } from '@/lib/unit-ranking'
import { getUnitMeta } from '@/lib/unit-ranking'

type Props = { data: UnitRankEntry[] }

function rateColor(pct: number) {
  if (pct >= 80) return { bar: '#01E18E', badge: { bg: 'rgba(1,168,102,0.1)', color: '#01a866', border: 'rgba(1,168,102,0.25)' } }
  if (pct >= 50) return { bar: '#f59e0b', badge: { bg: 'rgba(245,158,11,0.1)', color: '#d97706', border: 'rgba(245,158,11,0.25)' } }
  return           { bar: '#ff2f69', badge: { bg: 'rgba(255,47,105,0.08)', color: '#ff2f69', border: 'rgba(255,47,105,0.2)' } }
}

export function HrUnitStats({ data }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <p style={{ fontSize: 14, color: '#8a8490', margin: 0 }}>Nenhuma unidade configurada ainda.</p>
      </div>
    )
  }

  const maxAvg     = Math.max(...data.map(d => d.avgPoints), 1)
  const maxMembers = Math.max(...data.map(d => d.totalMembers), 1)
  const totalPts   = data.reduce((a, d) => a + d.totalPoints, 0)
  const totalMembers = data.reduce((a, d) => a + d.totalMembers, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── KPIs resumidos das unidades ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Unidades',       value: data.length,                                icon: '📍' },
          { label: 'Total colaboradores', value: totalMembers,                          icon: '👥' },
          { label: 'Finalizaram',    value: data.reduce((a, d) => a + d.lockedMembers, 0), icon: '🔒' },
          { label: 'Total de pontos',value: totalPts.toLocaleString('pt-BR'),           icon: '⚡' },
        ].map(k => (
          <div key={k.label} style={{
            padding: '12px 14px', borderRadius: 12,
            background: '#faf9f7', border: '1px solid #f0ede8',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>{k.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa8b0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {k.label}
              </span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#1a1625', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {k.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Cards de unidades (ranking) ───────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

        {/* Cabeçalho */}
        <div style={{
          display: 'grid', gridTemplateColumns: '28px 1fr 80px 90px 80px 90px',
          padding: '8px 16px', gap: 8,
          background: '#f5f2ef', borderRadius: '10px 10px 0 0',
        }}>
          {['#', 'Unidade', 'Membros', 'Finalizaram', 'Adesão', 'Média pts'].map((h, i) => (
            <span key={h} style={{
              fontSize: 10, fontWeight: 700, color: '#aaa8b0',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              textAlign: i > 1 ? 'center' : 'left',
            }}>{h}</span>
          ))}
        </div>

        {/* Linhas */}
        <div style={{ border: '1px solid #f0ede8', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
          {data.map((unit, i) => {
            const meta = getUnitMeta(unit.unit)
            const rate = rateColor(unit.participationRate)
            const ptsPct = maxAvg > 0 ? (unit.avgPoints / maxAvg) * 100 : 0
            const memPct = (unit.totalMembers / maxMembers) * 100

            return (
              <div key={unit.unit} style={{
                display: 'grid', gridTemplateColumns: '28px 1fr 80px 90px 80px 90px',
                alignItems: 'center', padding: '14px 16px', gap: 8,
                background: i % 2 === 0 ? '#fff' : '#faf9f7',
                borderBottom: i < data.length - 1 ? '1px solid #f5f2ef' : 'none',
                borderLeft: `3px solid ${meta.color}`,
              }}>

                {/* Posição */}
                <span style={{ fontSize: 13, fontWeight: 800, color: meta.color, textAlign: 'center' }}>
                  {unit.position}º
                </span>

                {/* Unidade + líder + barras */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16 }}>{meta.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1a1625' }}>{unit.unit}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                      background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30`,
                    }}>{meta.state}</span>
                  </div>

                  {unit.leader && (
                    <p style={{ margin: '0 0 6px', fontSize: 11, color: '#8a8490' }}>
                      🏆 <strong style={{ color: '#4a4555' }}>{unit.leader}</strong> · {unit.leaderPoints} pts
                    </p>
                  )}

                  {/* Duas barras: participantes e pontos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 9, color: '#aaa8b0', width: 32, flexShrink: 0 }}>Colabs</span>
                      <div style={{ flex: 1, height: 5, borderRadius: 5, background: '#f0ede8', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 5, width: `${memPct}%`, background: meta.color + 'aa' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 9, color: '#aaa8b0', width: 32, flexShrink: 0 }}>Pontos</span>
                      <div style={{ flex: 1, height: 5, borderRadius: 5, background: '#f0ede8', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 5, width: `${ptsPct}%`, background: meta.color, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Membros */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#1a1625', fontVariantNumeric: 'tabular-nums' }}>
                    {unit.totalMembers}
                  </span>
                </div>

                {/* Finalizados */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#4a4555', fontVariantNumeric: 'tabular-nums' }}>
                    {unit.lockedMembers}
                  </span>
                  <p style={{ margin: '1px 0 0', fontSize: 10, color: '#aaa8b0' }}>
                    {unit.totalMembers - unit.lockedMembers} pendentes
                  </p>
                </div>

                {/* Adesão % */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 20, display: 'inline-block',
                    background: rate.badge.bg, color: rate.badge.color, border: `1px solid ${rate.badge.border}`,
                  }}>
                    {unit.participationRate}%
                  </span>
                </div>

                {/* Média pts */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: meta.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                    {unit.avgPoints > 0 ? unit.avgPoints.toFixed(1) : '—'}
                  </span>
                  {unit.totalPoints > 0 && (
                    <p style={{ margin: '2px 0 0', fontSize: 10, color: '#aaa8b0' }}>
                      {unit.totalPoints.toLocaleString('pt-BR')} total
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Gráfico de barras horizontal comparativo ─────────────────────────── */}
      <div style={{ padding: '18px', borderRadius: 12, background: '#faf9f7', border: '1px solid #f0ede8' }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: '#8a8490', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Comparativo de Adesão por Unidade
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...data].sort((a, b) => b.participationRate - a.participationRate).map(unit => {
            const meta = getUnitMeta(unit.unit)
            const rate = rateColor(unit.participationRate)
            return (
              <div key={unit.unit} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 130, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 14 }}>{meta.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#4a4555',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {unit.unit}
                  </span>
                </div>
                <div style={{ flex: 1, height: 18, borderRadius: 9, background: '#edeae6', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%', borderRadius: 9, width: `${unit.participationRate}%`,
                    background: rate.bar,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    paddingRight: 8, minWidth: unit.participationRate > 5 ? 0 : undefined,
                    transition: 'width 0.6s ease',
                  }}>
                    {unit.participationRate >= 10 && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>
                        {unit.participationRate}%
                      </span>
                    )}
                  </div>
                  {unit.participationRate < 10 && (
                    <span style={{ position: 'absolute', left: `${unit.participationRate + 1}%`, top: 0, lineHeight: '18px', fontSize: 10, fontWeight: 800, color: '#6b6672' }}>
                      {unit.participationRate}%
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: '#aaa8b0', flexShrink: 0, width: 60, textAlign: 'right' }}>
                  {unit.lockedMembers}/{unit.totalMembers}
                </span>
              </div>
            )
          })}
        </div>

        {/* Legenda */}
        <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
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
    </div>
  )
}
