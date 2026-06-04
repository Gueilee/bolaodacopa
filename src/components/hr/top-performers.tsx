import type { TopPerformer } from '@/lib/hr-analytics'
import { UserAvatar } from '@/components/user-avatar'

const MEDALS = ['🥇', '🥈', '🥉']

type Props = { data: TopPerformer[] }

export function HrTopPerformers({ data }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>🏆</span>
        <p style={{ fontSize: 14, color: '#8a8490', margin: 0 }}>
          Nenhum palpite pontuado ainda.
        </p>
        <p style={{ fontSize: 12, color: '#c4bfba', margin: '4px 0 0' }}>
          Os top performers aparecerão aqui conforme os jogos forem encerrados.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((p, i) => {
        const isTop3 = p.position <= 3
        return (
          <div
            key={p.position}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 14,
              background: isTop3 ? 'rgba(66,44,118,0.05)' : '#faf9f7',
              border: isTop3 ? '1px solid rgba(66,44,118,0.15)' : '1px solid #f0ede8',
              transition: 'all 0.15s',
            }}
          >
            {/* Posição */}
            <div style={{ minWidth: 32, textAlign: 'center', flexShrink: 0 }}>
              {isTop3 ? (
                <span style={{ fontSize: 22 }}>{MEDALS[i]}</span>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 700, color: '#aaa8b0' }}>{p.position}º</span>
              )}
            </div>

            {/* Avatar real */}
            <UserAvatar
              name={p.name}
              avatarUrl={p.avatarUrl}
              size={40}
              bgColor="#422c76"
              textColor="white"
            />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1625',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </p>
              {p.department && (
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8a8490',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.department}
                </p>
              )}
            </div>

            {/* Badge exatos */}
            {p.exactCount > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, flexShrink: 0,
                background: 'rgba(1,168,102,0.1)', color: '#01a866', border: '1px solid rgba(1,168,102,0.2)',
              }}>
                ⚡ {p.exactCount}
              </span>
            )}

            {/* Pontos */}
            <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 52 }}>
              <p style={{ margin: 0, fontSize: isTop3 ? 20 : 16, fontWeight: 900, color: isTop3 ? '#422c76' : '#1a1625',
                fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {p.points}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 10, color: '#aaa8b0' }}>pts</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
