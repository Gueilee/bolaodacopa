import type { DeptRankEntry } from '@/lib/dept-ranking'

type Props = { top3: DeptRankEntry[] }

// ─── Paleta por posição ───────────────────────────────────────────────────────

const CFG = {
  1: {
    emoji:      '🥇',
    pos:        '1º',
    cardBg:     '#FFFBEB',
    cardBorder: '#FCD34D',
    stepBg:     'linear-gradient(160deg, #F59E0B 0%, #D97706 100%)',
    stepH:      120,
    nameColor:  '#92400E',
    ptsColor:   '#B45309',
    mutedColor: '#D97706',
    badgeBg:    '#F59E0B',
    badgeText:  '#fff',
    order:      2,
    offsetTop:  0,
    shadow:     '0 8px 32px rgba(245,158,11,0.25), 0 2px 8px rgba(0,0,0,0.08)',
  },
  2: {
    emoji:      '🥈',
    pos:        '2º',
    cardBg:     '#F8FAFC',
    cardBorder: '#CBD5E1',
    stepBg:     'linear-gradient(160deg, #94A3B8 0%, #64748B 100%)',
    stepH:      80,
    nameColor:  '#1e293b',
    ptsColor:   '#475569',
    mutedColor: '#64748B',
    badgeBg:    '#94A3B8',
    badgeText:  '#fff',
    order:      1,
    offsetTop:  32,
    shadow:     '0 4px 16px rgba(0,0,0,0.08)',
  },
  3: {
    emoji:      '🥉',
    pos:        '3º',
    cardBg:     '#FFFAF5',
    cardBorder: '#FED7AA',
    stepBg:     'linear-gradient(160deg, #CD7F32 0%, #A0522D 100%)',
    stepH:      48,
    nameColor:  '#7c2d12',
    ptsColor:   '#9a3412',
    mutedColor: '#C2410C',
    badgeBg:    '#CD7F32',
    badgeText:  '#fff',
    order:      3,
    offsetTop:  56,
    shadow:     '0 4px 16px rgba(0,0,0,0.08)',
  },
} as const

// ─── Card individual ──────────────────────────────────────────────────────────

function PodiumCard({ entry }: { entry: DeptRankEntry }) {
  const cfg = CFG[entry.position as 1 | 2 | 3]
  const firstName = entry.leader?.split(' ')[0] ?? null

  return (
    <div
      style={{
        order: cfg.order,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 150,
        flexShrink: 0,
        marginTop: cfg.offsetTop,
      }}
    >
      {/* ── Info card ── */}
      <div
        style={{
          width: '100%',
          background: cfg.cardBg,
          border: `2px solid ${cfg.cardBorder}`,
          borderRadius: 16,
          padding: '14px 12px 16px',
          textAlign: 'center',
          boxShadow: cfg.shadow,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Medalha */}
        <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 6 }}>{cfg.emoji}</div>

        {/* Nome do departamento */}
        <p
          style={{
            margin: '0 0 4px',
            fontSize: 13,
            fontWeight: 800,
            color: cfg.nameColor,
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}
        >
          {entry.department}
        </p>

        {/* Líder */}
        {firstName && (
          <p style={{ margin: '0 0 10px', fontSize: 11, color: cfg.mutedColor, fontWeight: 500 }}>
            Líder: {firstName}
          </p>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: cfg.cardBorder, margin: '10px 0' }} />

        {/* Pontuação */}
        <p
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 900,
            color: cfg.ptsColor,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {entry.avgPoints.toFixed(1)}
        </p>
        <p style={{ margin: '3px 0 8px', fontSize: 10, color: cfg.mutedColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          pts médios
        </p>

        {/* Participação */}
        <div
          style={{
            background: `${cfg.cardBorder}80`,
            borderRadius: 8,
            padding: '5px 8px',
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: cfg.ptsColor }}>
            {entry.lockedMembers}/{entry.totalMembers} membros
          </p>
          <p style={{ margin: '1px 0 0', fontSize: 10, color: cfg.mutedColor }}>
            {entry.participationRate}% participação
          </p>
        </div>
      </div>

      {/* ── Degrau do pódio ── */}
      <div
        style={{
          width: '100%',
          height: cfg.stepH,
          background: cfg.stepBg,
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -1,
          boxShadow: `0 8px 20px ${cfg.badgeBg}55`,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.06em',
          }}
        >
          {cfg.pos}
        </span>
      </div>
    </div>
  )
}

// ─── Pódio principal ──────────────────────────────────────────────────────────

export function DeptPodium({ top3 }: Props) {
  if (top3.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm" style={{ color: '#8a8490' }}>
          Nenhum departamento cadastrado ainda.
        </p>
        <p className="text-xs mt-1" style={{ color: '#aaa8b0' }}>
          Atribua departamentos aos colaboradores em Administração → Usuários.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Título */}
      <p
        style={{
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#8a8490',
          marginBottom: 28,
        }}
      >
        🏆 Top 3 Departamentos
      </p>

      {/* Cards em flex — alinhados pela base do degrau */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 12,
          padding: '0 8px',
        }}
      >
        {top3.map((entry) => (
          <PodiumCard key={entry.department} entry={entry} />
        ))}
      </div>
    </div>
  )
}
