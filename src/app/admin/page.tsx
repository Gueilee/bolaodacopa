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
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1a1625' }}>Painel Admin</h1>
        <p className="text-sm mt-1" style={{ color: '#8a8490' }}>
          Gerencie partidas, sync automático e pontuação
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Usuários',          value: stats.users,            accent: false },
          { label: 'Bloqueados',        value: stats.lockedUsers,      accent: false },
          { label: 'Partidas',          value: stats.matches,          accent: false },
          { label: 'Palpites',          value: stats.totalPredictions, accent: false },
          { label: 'Aguard. pontuação', value: pendingScoring,         accent: pendingScoring > 0 },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold tabular-nums ${s.accent ? 'text-brand-pink' : ''}`}
               style={s.accent ? undefined : { color: '#1a1625' }}>
              {s.value}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8a8490' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Atalhos rápidos ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/convites', icon: '✉️', label: 'Convites',  sub: 'Enviar links de acesso' },
          { href: '/admin/rh',       icon: '📊', label: 'Dashboard RH', sub: 'Engajamento por depto' },
          { href: '/admin/exportar', icon: '⬇️', label: 'Exportar',  sub: 'PDF e CSVs do bolão' },
        ].map(link => (
          <a key={link.href} href={link.href}
            className="flex items-center gap-3 card p-4 hover:bg-white/80 transition-all group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ background: '#f0ede8' }}>
              {link.icon}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm" style={{ color: '#1a1625' }}>{link.label}</p>
              <p className="text-xs truncate" style={{ color: '#8a8490' }}>{link.sub}</p>
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
