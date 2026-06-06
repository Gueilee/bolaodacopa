'use client'

import { useState, useTransition } from 'react'
import { triggerSyncAction } from '@/app/actions/admin'
import type { SyncResult } from '@/lib/sync-fixtures'

export type SyncMeta = {
  lastSyncAt:        string | null
  lastSyncStatus:    string | null
  lastSyncPlanError: boolean        // mantido por compatibilidade — sempre false
  lastSyncFetched:   number
  lastSyncUpdated:   number
  lastSyncScored:    number
  lastSyncTeams:     number
  lastSyncRateLimit: string | null  // não usado pela football-data.org
  lastSyncErrors:    string | null
}

type Props = { meta: SyncMeta }

export function AdminSyncPanel({ meta }: Props) {
  const [isPending,  startTransition] = useTransition()
  const [lastResult, setLastResult]   = useState<SyncResult | null>(null)
  const [error,      setError]        = useState<string | null>(null)

  const isOk = lastResult?.ok ?? meta.lastSyncStatus === 'success'
  const hasErrors = !isOk && (meta.lastSyncStatus !== null)

  function handleSync() {
    setError(null)
    setLastResult(null)
    startTransition(async () => {
      const res = await triggerSyncAction()
      if (res.success) setLastResult(res.result)
      else setError(res.error)
    })
  }

  // Valores a exibir: usa resultado do sync manual se disponível, senão o último gravado
  const fetched  = lastResult ? lastResult.fixturesFetched   : meta.lastSyncFetched
  const updated  = lastResult ? lastResult.matchesUpdated    : meta.lastSyncUpdated
  const scored   = lastResult ? lastResult.predictionsScored : meta.lastSyncScored
  const teams    = lastResult ? lastResult.teamsUpdated      : meta.lastSyncTeams

  return (
    <div className="card p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#1a1625' }}>
              Sincronização football-data.org
            </h2>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: 'rgba(1,168,102,0.1)', color: '#065f46',
              border: '1px solid rgba(1,168,102,0.2)', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Gratuito
            </span>
          </div>
          <p className="text-xs" style={{ color: '#8a8490' }}>
            Vercel Cron · a cada 15 min · /competitions/WC · season=2026
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

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Partidas buscadas',    value: fetched,  highlight: false },
          { label: 'Partidas atualizadas', value: updated,  highlight: false },
          { label: 'Palpites pontuados',   value: scored,   highlight: true  },
          { label: 'Times identificados',  value: teams,    highlight: false },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: '#f5f2ef' }}>
            <p
              className={`text-xl font-bold tabular-nums ${s.highlight && s.value > 0 ? 'text-brand-neon' : ''}`}
              style={s.highlight && s.value > 0 ? undefined : { color: '#1a1625' }}
            >
              {s.value}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: '#8a8490' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Status do último sync ── */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            isOk      ? 'bg-brand-neon' :
            hasErrors ? 'bg-brand-pink' :
            'bg-gray-300'
          }`}/>
          <span style={{ color: '#8a8490' }}>
            {meta.lastSyncAt === null ? 'Nenhum sync realizado ainda' :
             isOk                    ? 'Último sync OK'               : 'Último sync com erros'}
          </span>
        </div>
        {meta.lastSyncAt && (
          <span style={{ color: '#8a8490' }}>
            {new Intl.DateTimeFormat('pt-BR', {
              day: '2-digit', month: 'short',
              hour: '2-digit', minute: '2-digit',
              timeZone: 'America/Sao_Paulo',
            }).format(new Date(meta.lastSyncAt))}
          </span>
        )}
      </div>

      {/* ── Resultado do sync manual ── */}
      {lastResult && (
        <div className={`rounded-xl p-4 text-sm border animate-fade-in ${
          lastResult.ok
            ? 'bg-brand-neon/8 border-brand-neon/20'
            : 'bg-brand-pink/8 border-brand-pink/20'
        }`}>
          <p className={`font-semibold mb-2 ${lastResult.ok ? 'text-brand-neon' : 'text-brand-pink'}`}>
            {lastResult.ok ? '✓ Sync completo' : '⚠ Sync com erros'}
          </p>
          <ul className="space-y-1 text-xs" style={{ color: '#8a8490' }}>
            <li>⚽ {lastResult.fixturesFetched} partidas retornadas pela API</li>
            <li>🔄 {lastResult.matchesUpdated} partidas com status atualizado</li>
            <li>🎯 {lastResult.predictionsScored} palpites pontuados automaticamente</li>
            {lastResult.teamsUpdated > 0 && (
              <li>🏴 {lastResult.teamsUpdated} times de mata-mata identificados</li>
            )}
          </ul>
          {lastResult.errors.length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e8e4df' }}>
              <p className="text-brand-pink text-xs font-medium mb-1">Erros ({lastResult.errors.length}):</p>
              {lastResult.errors.slice(0, 5).map((e, i) => (
                <p key={i} className="text-brand-pink/70 text-xs font-mono truncate">{e}</p>
              ))}
              {lastResult.errors.length > 5 && (
                <p className="text-xs" style={{ color: '#8a8490' }}>+ {lastResult.errors.length - 5} mais...</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Erros gravados do último sync automático ── */}
      {!lastResult && meta.lastSyncErrors && meta.lastSyncErrors.trim() !== '' && (
        <div className="rounded-xl p-3 bg-brand-pink/8 border border-brand-pink/20">
          <p className="text-brand-pink text-xs font-medium mb-1">Último erro registrado:</p>
          <p className="text-brand-pink/70 text-xs font-mono truncate">{meta.lastSyncErrors}</p>
        </div>
      )}

      {error && (
        <p className="text-brand-pink text-sm bg-brand-pink/8 border border-brand-pink/20 rounded-xl px-4 py-3">
          ✗ {error}
        </p>
      )}

      {/* ── Info da API ── */}
      <div style={{
        background: 'rgba(1,168,102,0.04)', border: '1px solid rgba(1,168,102,0.12)',
        borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 16 }}>ℹ️</span>
        <p style={{ fontSize: 11, color: '#6b6672', margin: 0, lineHeight: 1.5 }}>
          <strong style={{ color: '#065f46' }}>football-data.org</strong> — plano gratuito.
          Traz gols, cartões e substituições em tempo real. 1 requisição por sync · 10 req/min no free.
        </p>
      </div>
    </div>
  )
}
