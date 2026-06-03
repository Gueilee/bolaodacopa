import { getAllMatchesForAdmin, getAdminStats } from '@/lib/queries'
import { AdminMatchRow }              from '@/components/admin-match-row'
import { AdminGroupStandings }        from '@/components/admin-group-standings'
import { AdminSyncPanel, SyncMeta }  from '@/components/admin-sync-panel'
import { db }                        from '@/lib/db'
import { settings }                  from '@/db/schema'
import { inArray }                   from 'drizzle-orm'
import { getSession }                from '@/lib/session'
import { redirect }                  from 'next/navigation'
import { phaseLabels, phaseOrder }   from '@/lib/utils'

export const revalidate = 0

// ─── Sync metadata ────────────────────────────────────────────────────────────

async function getSyncMeta() {
  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, [
      'last_sync_at', 'last_sync_status', 'last_sync_fetched',
      'last_sync_updated', 'last_sync_scored', 'last_sync_teams',
      'last_sync_rate_limit', 'last_sync_errors',
    ]))

  const kv = Object.fromEntries(rows.map(r => [r.key, r.value]))
  return {
    lastSyncAt:        kv['last_sync_at']        ?? null,
    lastSyncStatus:    kv['last_sync_status']     ?? null,
    lastSyncPlanError: kv['last_sync_plan_error'] === '1',
    lastSyncFetched:   Number(kv['last_sync_fetched']  ?? 0),
    lastSyncUpdated:   Number(kv['last_sync_updated']  ?? 0),
    lastSyncScored:    Number(kv['last_sync_scored']   ?? 0),
    lastSyncTeams:     Number(kv['last_sync_teams']    ?? 0),
    lastSyncRateLimit: kv['last_sync_rate_limit'] ?? null,
    lastSyncErrors:    kv['last_sync_errors']     ?? null,
  } satisfies SyncMeta
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/admin/rh')

  const [stats, allMatches, syncMeta] = await Promise.all([
    getAdminStats(),
    getAllMatchesForAdmin(),
    getSyncMeta(),
  ])

  // ── Agrupar por fase → grupo ──────────────────────────────────────────────
  const phaseMap = new Map<string, typeof allMatches>()
  for (const m of allMatches) {
    if (!phaseMap.has(m.phase)) phaseMap.set(m.phase, [])
    phaseMap.get(m.phase)!.push(m)
  }
  const sortedPhases = [...phaseMap.keys()].sort(
    (a, b) => (phaseOrder[a] ?? 99) - (phaseOrder[b] ?? 99),
  )

  const pendingScoring = stats.pendingScoring

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in" style={{ paddingBottom: 40 }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #150820 0%, #1a0a2e 60%, #200a15 100%)',
        borderRadius: 24, padding: '24px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -20, width: 160, height: 160,
          background: 'radial-gradient(circle, rgba(255,47,105,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>⚙️</span>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#faf9f5', letterSpacing: '-0.02em' }}>
              Painel Admin
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Gerencie partidas, sync automático e pontuação
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Usuários',          value: stats.users,            icon: '👥', accent: false },
          { label: 'Bloqueados',        value: stats.lockedUsers,      icon: '🔒', accent: false },
          { label: 'Partidas',          value: stats.matches,          icon: '⚽', accent: false },
          { label: 'Palpites',          value: stats.totalPredictions, icon: '🎯', accent: false },
          { label: 'Aguard. pontuação', value: pendingScoring,         icon: '⏳', accent: pendingScoring > 0 },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center" style={{
            borderTop: s.accent ? '2px solid #ff2f69' : '2px solid transparent',
          }}>
            <p style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</p>
            <p style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 800,
              color: s.accent ? '#ff2f69' : '#1a1625', letterSpacing: '-0.02em' }}>
              {s.value}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: '#8a8490', fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Atalhos rápidos ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: '/admin/convites', icon: '✉️', label: 'Convites',     sub: 'Enviar links de acesso',   color: '#422c76' },
          { href: '/admin/rh',       icon: '📊', label: 'Dashboard RH', sub: 'Engajamento por depto',    color: '#01a866' },
          { href: '/admin/exportar', icon: '⬇️', label: 'Exportar',     sub: 'PDF e CSVs do bolão',      color: '#1a6aff' },
        ].map(link => (
          <a key={link.href} href={link.href} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: '#fff', borderRadius: 16, padding: '16px 18px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            textDecoration: 'none', transition: 'all 0.15s',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: `${link.color}14`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              border: `1px solid ${link.color}22`,
            }}>
              {link.icon}
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14, color: '#1a1625' }}>{link.label}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#8a8490' }}>{link.sub}</p>
            </div>
          </a>
        ))}
      </div>

      {/* ── Sync automático ── */}
      <AdminSyncPanel meta={syncMeta} />

      {/* ══ RESULTADOS ══ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: '#1a1625' }}>
            Resultados
          </h2>
          <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
            style={{
              background: pendingScoring > 0 ? '#fff0f3' : 'rgba(1,225,142,0.1)',
              color:      pendingScoring > 0 ? '#ff2f69' : '#01a866',
            }}>
            {pendingScoring > 0
              ? `${pendingScoring} aguardando pontuação`
              : 'Tudo pontuado ✓'}
          </span>
        </div>

        <div className="space-y-8">
          {sortedPhases.map(phase => {
            const phaseMatches = phaseMap.get(phase)!
            const isGroup = phase === 'group'

            // Para fase de grupos: subagrupamos por groupName
            if (isGroup) {
              const groupMap = new Map<string, typeof allMatches>()
              for (const m of phaseMatches) {
                const g = m.groupName ?? '?'
                if (!groupMap.has(g)) groupMap.set(g, [])
                groupMap.get(g)!.push(m)
              }
              const sortedGroups = [...groupMap.keys()].sort()

              return (
                <section key={phase}>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3 px-1"
                    style={{ color: '#8a8490' }}>
                    {phaseLabels[phase]}
                  </h3>

                  <div className="space-y-4">
                    {sortedGroups.map(groupName => {
                      const gMatches = groupMap.get(groupName)!
                      const groupLetter = groupName.replace('Grupo ', '')
                      const done   = gMatches.filter(m => m.isScored).length
                      const total  = gMatches.length
                      const allDone = done === total

                      return (
                        <div key={groupName}>
                          {/* Cabeçalho do grupo */}
                          <div className="flex items-center justify-between px-1 mb-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider"
                              style={{ color: '#422c76' }}>
                              {groupName}
                            </span>
                            <span className="text-[10px] tabular-nums"
                              style={{ color: allDone ? '#01a866' : '#8a8490' }}>
                              {done}/{total} pontuados
                            </span>
                          </div>

                          {/* Partidas do grupo */}
                          <div className="card overflow-hidden" style={{ padding: 0 }}>
                            {gMatches.map(m => (
                              <AdminMatchRow key={m.id} match={m} />
                            ))}
                          </div>

                          {/* Classificação do grupo (aparece quando há resultados) */}
                          <AdminGroupStandings
                            matches={gMatches}
                            group={groupLetter}
                          />
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            }

            // ── Fases eliminatórias ──────────────────────────────────────────
            const done  = phaseMatches.filter(m => m.isScored).length
            const total = phaseMatches.length

            return (
              <section key={phase}>
                <div className="flex items-center justify-between px-1 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: '#8a8490' }}>
                    {phaseLabels[phase] ?? phase}
                  </h3>
                  <span className="text-[10px] tabular-nums" style={{ color: '#8a8490' }}>
                    {done}/{total} pontuados
                  </span>
                </div>
                <div className="card overflow-hidden" style={{ padding: 0 }}>
                  {phaseMatches.map(m => (
                    <AdminMatchRow key={m.id} match={m} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
