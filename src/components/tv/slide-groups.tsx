'use client'

import type { TvGroup, TvGroupTeam } from '@/lib/tv-data'
import { getFlagUrl } from '@/lib/flags'
import { useState } from 'react'

function Flag({ team }: { team: string }) {
  const [failed, setFailed] = useState(false)
  const url = getFlagUrl(team, 40)
  if (!url || failed) return <span style={{ fontSize: 16 }}>🏳</span>
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={team} width={28} height={19} style={{ objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} onError={() => setFailed(true)} />
}

function GroupCard({ group }: { group: TvGroup }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '8px 14px', background: 'rgba(1,225,142,0.12)', borderBottom: '1px solid rgba(1,225,142,0.2)' }}>
        <span style={{ fontSize: 14, fontWeight: 900, color: '#01E18E', letterSpacing: '0.05em' }}>{group.name}</span>
      </div>
      {/* Col headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 22px 22px 22px 22px 22px 30px', padding: '4px 10px', gap: 3, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {['', 'J', 'V', 'E', 'D', 'SG', 'PTS'].map((h, i) => (
          <span key={i} style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textAlign: i > 0 ? 'center' : 'left', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
        ))}
      </div>
      {/* Teams */}
      {group.teams.map((t, i) => (
        <div key={t.name} style={{
          display: 'grid', gridTemplateColumns: '1fr 22px 22px 22px 22px 22px 30px',
          padding: '6px 10px', gap: 3, alignItems: 'center',
          borderBottom: i < group.teams.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          background: i < 2 ? 'rgba(1,225,142,0.04)' : 'transparent',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            <span style={{ fontSize: 10, color: i < 2 ? '#01E18E' : 'rgba(255,255,255,0.25)', fontWeight: 700, minWidth: 8 }}>{i + 1}</span>
            <Flag team={t.name} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
          </div>
          {[t.played, t.won, t.drawn, t.lost, t.goalDiff, t.points].map((v, j) => (
            <span key={j} style={{ fontSize: 12, fontWeight: j === 5 ? 800 : 400, color: j === 5 ? '#01E18E' : 'rgba(255,255,255,0.6)', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
              {j === 4 && v > 0 ? `+${v}` : v}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

export function SlideGroups({ groups }: { groups: TvGroup[] }) {
  if (groups.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 24 }}>Aguardando dados dos grupos…</p>
      </div>
    )
  }

  const cols = groups.length <= 4 ? 2 : groups.length <= 8 ? 3 : 4

  return (
    <div style={{ height: '100%', padding: '0 40px', display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, alignContent: 'start', overflow: 'hidden' }}>
      {groups.map(g => <GroupCard key={g.name} group={g} />)}
    </div>
  )
}
