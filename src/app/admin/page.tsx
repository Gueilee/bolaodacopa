import { getAllMatchesForAdmin, getAdminStats } from '@/lib/queries'
import { AdminMatchRow }              from '@/components/admin-match-row'
import { AdminSyncPanel, SyncMeta }  from '@/components/admin-sync-panel'
import { db }                        from '@/lib/db'
import { settings }                  from '@/db/schema'
import { inArray }                   from 'drizzle-orm'

export const revalidate = 0

// ─── Busca metadados de sync ──────────────────────────────────────────────────

async function getSyncMeta() {
  const rows = await db
    .select()
    .from(settings)
    .where(
      inArray(settings.key, [
        'last_sync_at',
        'last_sync_status',
        'last_sync_fetched',
        'last_sync_updated',
        'last_sync_scored',
        'last_sync_teams',
        'last_sync_rate_limit',
        'last_sync_errors',
      ]),
    )

  const kv = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  return {
    lastSyncAt:         kv['last_sync_at']          ?? null,
    lastSyncStatus:     kv['last_sync_status']       ?? null,
    lastSyncPlanError:  kv['last_sync_plan_error'] === '1',
    lastSyncFetched:    Number(kv['last_sync_fetched']  ?? 0),
    lastSyncUpdated:    Number(kv['last_sync_updated']  ?? 0),
    lastSyncScored:     Number(kv['last_sync_scored']   ?? 0),
    lastSyncTeams:      Number(kv['last_sync_teams']    ?? 0),
    lastSyncRateLimit:  kv['last_sync_rate_limit']  ?? null,
    lastSyncErrors:     kv['last_sync_errors']       ?? null,
  } satisfies SyncMeta
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const [stats, allMatches, syncMeta] = await Promise.all([
    getAdminStats(),
    getAllMatchesForAdmin(),
    getSyncMeta(),
  ])

  const pending  = allMatches.filter((m) => m.status !== 'finished')
  const finished = allMatches.filter((m) => m.status === 'finished')

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-brand-cream">Painel Admin</h1>
        <p className="text-white/40 text-sm mt-1">Gerencie partidas, sync automático e pontuação</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Usuários',         value: stats.users,            accent: false },
          { label: 'Bloqueados',       value: stats.lockedUsers,      accent: false },
          { label: 'Partidas',         value: stats.matches,          accent: false },
          { label: 'Palpites',         value: stats.totalPredictions, accent: false },
          { label: 'Aguard. pontuação',value: stats.pendingScoring,   accent: stats.pendingScoring > 0 },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold tabular-nums ${s.accent ? 'text-brand-pink' : 'text-brand-cream'}`}>
              {s.value}
            </p>
            <p className="text-white/35 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Atalhos rápidos ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            href:  '/admin/rh',
            icon:  '📊',
            label: 'Dashboard de Engajamento RH',
            sub:   'Taxa por departamento, timeline, top performers',
            color: 'brand-neon',
          },
          {
            href:  '/admin/exportar',
            icon:  '⬇️',
            label: 'Exportar Relatórios',
            sub:   'PDF com branding + CSVs para Excel',
            color: 'brand-purple',
          },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex items-center justify-between card p-5 hover:border-white/20 hover:bg-white/3 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                {link.icon}
              </div>
              <div>
                <p className="font-semibold text-brand-cream">{link.label}</p>
                <p className="text-white/35 text-sm mt-0.5">{link.sub}</p>
              </div>
            </div>
            <span className="text-white/20 group-hover:text-white/60 transition-colors text-xl">→</span>
          </a>
        ))}
      </div>

      {/* ── (manter o bloco antigo de Dashboard RH por compatibilidade) ── */}
      <a
        href="/admin/rh"
        className="hidden flex items-center justify-between card p-5 hover:border-brand-neon/30 hover:bg-brand-neon/5 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-neon/15 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            📊
          </div>
          <div>
            <p className="font-semibold text-brand-cream">Dashboard de Engajamento RH</p>
            <p className="text-white/35 text-sm mt-0.5">
              Taxa de participação por departamento, timeline de adesão, top performers e exportação CSV
            </p>
          </div>
        </div>
        <span className="text-white/30 group-hover:text-brand-neon transition-colors text-xl">→</span>
      </a>

      {/* ── Sync automático ── */}
      <AdminSyncPanel meta={syncMeta} />

      {/* ── Partidas em aberto (manual override) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
            Partidas em aberto ({pending.length})
          </h2>
          <p className="text-white/25 text-xs">
            Use o sync automático ou registre manualmente abaixo
          </p>
        </div>

        {pending.length === 0 ? (
          <p className="text-white/25 text-sm py-6 text-center">
            Todas as partidas foram pontuadas.
          </p>
        ) : (
          <div className="space-y-2">
            {pending.map((match) => (
              <AdminMatchRow key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>

      {/* ── Partidas encerradas ── */}
      {finished.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
            Partidas encerradas ({finished.length})
          </h2>
          <div className="space-y-2">
            {finished.map((match) => (
              <AdminMatchRow key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
