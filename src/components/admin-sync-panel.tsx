'use client'

import { useState, useTransition } from 'react'
import { triggerSyncAction } from '@/app/actions/admin'
import type { SyncResult } from '@/lib/sync-fixtures'

export type SyncMeta = {
  lastSyncAt:        string | null
  lastSyncStatus:    string | null
  lastSyncPlanError: boolean
  lastSyncFetched:   number
  lastSyncUpdated:   number
  lastSyncScored:    number
  lastSyncTeams:     number
  lastSyncRateLimit: string | null
  lastSyncErrors:    string | null
}

type Props = { meta: SyncMeta }

export function AdminSyncPanel({ meta }: Props) {
  const [isPending,  startTransition] = useTransition()
  const [lastResult, setLastResult]   = useState<SyncResult | null>(null)
  const [error,      setError]        = useState<string | null>(null)

  const isPlanError  = lastResult?.planError ?? meta.lastSyncPlanError
  const isOk         = !isPlanError && (lastResult?.ok ?? meta.lastSyncStatus === 'success')
  const rateRemaining = lastResult?.rateLimitDaily ?? (meta.lastSyncRateLimit ? Number(meta.lastSyncRateLimit) : null)
  const rateWarning   = rateRemaining !== null && rateRemaining < 15

  function handleSync() {
    setError(null)
    setLastResult(null)
    startTransition(async () => {
      const res = await triggerSyncAction()
      if (res.success) setLastResult(res.result)
      else setError(res.error)
    })
  }

  return (
    <div className="card p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-widest">
            Sincronização API-Football
          </h2>
          <p className="text-white/35 text-xs mt-0.5">
            Vercel Cron · a cada 15 min · league=1 · season=2026
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isPending}
          className="btn-primary text-sm py-2 px-4 shrink-0 flex items-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Sincronizando...
            </>
          ) : '⟳ Sync Manual'}
        </button>
      </div>

      {/* ── Aviso de plano — DESTAQUE ── */}
      {isPlanError && (
        <div className="rounded-xl p-4 bg-brand-pink/10 border border-brand-pink/30 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-brand-pink text-lg">⚠</span>
            <p className="text-brand-pink font-semibold text-sm">
              Plano Free não acessa Copa 2026
            </p>
          </div>
          <p className="text-white/50 text-xs leading-relaxed">
            A temporada 2026 requer o plano <strong className="text-white">Starter</strong> (≈ $9/mês)
            ou superior. A Copa dura 11/Jun–19/Jul — 2 meses de assinatura resolvem.
          </p>
          <div className="flex gap-3 pt-1">
            <a
              href="https://dashboard.api-sports.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-brand-pink/20 hover:bg-brand-pink/30 border border-brand-pink/40 text-brand-pink font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Fazer Upgrade →
            </a>
            <span className="text-white/25 text-xs self-center">
              Após upgrade, o sync funciona automaticamente — sem alterar código.
            </span>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Fixtures buscados',   value: lastResult ? lastResult.fixturesFetched  : meta.lastSyncFetched  },
          { label: 'Partidas atualizadas',value: lastResult ? lastResult.matchesUpdated   : meta.lastSyncUpdated  },
          { label: 'Palpites pontuados',  value: lastResult ? lastResult.predictionsScored: meta.lastSyncScored, highlight: true },
          { label: 'Req. restantes/dia',  value: rateRemaining ?? '—', warn: rateWarning },
        ].map((s) => (
          <div key={s.label} className="bg-white/4 rounded-xl p-3 text-center">
            <p className={`text-xl font-bold tabular-nums ${
              s.warn      ? 'text-brand-pink' :
              s.highlight ? 'text-brand-neon' :
              'text-white'
            }`}>{s.value}</p>
            <p className="text-white/30 text-[10px] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Status do último sync ── */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            isPlanError ? 'bg-brand-pink animate-pulse' :
            isOk        ? 'bg-brand-neon'               : 'bg-brand-pink'
          }`}/>
          <span className="text-white/40">
            {isPlanError  ? 'Aguardando upgrade do plano' :
             isOk         ? 'Último sync OK'              : 'Último sync com erros'}
          </span>
        </div>
        {meta.lastSyncAt && (
          <span className="text-white/25">
            {new Intl.DateTimeFormat('pt-BR', {
              day: '2-digit', month: 'short',
              hour: '2-digit', minute: '2-digit',
              timeZone: 'America/Sao_Paulo',
            }).format(new Date(meta.lastSyncAt))}
          </span>
        )}
      </div>

      {/* ── Resultado do sync manual ── */}
      {lastResult && !lastResult.planError && (
        <div className={`rounded-xl p-4 text-sm border animate-fade-in ${
          lastResult.ok
            ? 'bg-brand-neon/8 border-brand-neon/20'
            : 'bg-brand-pink/8 border-brand-pink/20'
        }`}>
          <p className={`font-semibold mb-2 ${lastResult.ok ? 'text-brand-neon' : 'text-brand-pink'}`}>
            {lastResult.ok ? '✓ Sync completo' : '⚠ Sync com erros'}
          </p>
          <ul className="space-y-1 text-white/50 text-xs">
            <li>{lastResult.fixturesFetched} fixtures retornados pela API</li>
            <li>{lastResult.matchesUpdated} partidas com status atualizado</li>
            <li>{lastResult.predictionsScored} palpites pontuados automaticamente</li>
            {lastResult.teamsUpdated > 0 && (
              <li>{lastResult.teamsUpdated} times de knockout identificados pela API</li>
            )}
            {lastResult.rateLimitDaily !== null && (
              <li className={lastResult.rateLimitDaily < 15 ? 'text-brand-pink' : ''}>
                Saldo: {lastResult.rateLimitDaily} requisições/dia restantes
              </li>
            )}
          </ul>
          {lastResult.errors.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-brand-pink text-xs font-medium mb-1">Erros:</p>
              {lastResult.errors.map((e, i) => (
                <p key={i} className="text-brand-pink/70 text-xs font-mono truncate">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Aviso de rate limit ── */}
      {rateWarning && !isPlanError && (
        <p className="text-brand-pink text-xs bg-brand-pink/10 border border-brand-pink/20 rounded-xl px-4 py-3">
          ⚠ Saldo baixo ({rateRemaining} req/dia). Considere aumentar o intervalo do cron em vercel.json.
        </p>
      )}

      {error && <p className="text-brand-pink text-sm">{error}</p>}
    </div>
  )
}
