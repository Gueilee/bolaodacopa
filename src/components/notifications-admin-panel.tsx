'use client'

import { useState, useTransition } from 'react'
import {
  sendBulkReminderAction,
  sendCustomMessageAction,
  sendTestMessageAction,
} from '@/app/actions/notifications'
import type { NotifResult } from '@/lib/notifications'
import type { ConnectionStatus } from '@/lib/whatsapp'

type Props = {
  status:     ConnectionStatus | null  // null = não configurado
  stats: {
    optedIn:   number
    withPhone: number
    sentToday: number
  }
}

function ResultBox({ result }: { result: NotifResult }) {
  return (
    <div className={`rounded-xl p-4 text-sm border animate-fade-in ${
      result.failed > 0
        ? 'bg-brand-pink/8 border-brand-pink/20'
        : 'bg-brand-neon/8 border-brand-neon/20'
    }`}>
      <div className="flex gap-6 mb-2">
        <span className="text-brand-neon font-bold">{result.sent} enviados</span>
        {result.skipped > 0 && <span className="text-white/40">{result.skipped} ignorados</span>}
        {result.failed  > 0 && <span className="text-brand-pink font-bold">{result.failed} falhas</span>}
      </div>
      {result.errors.slice(0, 3).map((e, i) => (
        <p key={i} className="text-brand-pink/60 text-xs font-mono truncate">{e}</p>
      ))}
    </div>
  )
}

export function NotificationsAdminPanel({ status, stats }: Props) {
  const [isPending,   startTransition] = useTransition()
  const [lastResult,  setLastResult]   = useState<NotifResult | null>(null)
  const [testPhone,   setTestPhone]    = useState('')
  const [testResult,  setTestResult]   = useState<{ ok: boolean; msg: string } | null>(null)
  const [customMsg,   setCustomMsg]    = useState('')
  const [customTarget, setCustomTarget]= useState<'all_optin' | 'pending_only'>('pending_only')
  const [activeTab,   setActiveTab]    = useState<'reminder' | 'custom' | 'test'>('reminder')

  const configured = status !== null
  const connected  = status?.connected ?? false

  // ── Lembrete em massa ──
  function handleBulkReminder() {
    setLastResult(null)
    startTransition(async () => {
      const res = await sendBulkReminderAction()
      if (res.success && res.result) setLastResult(res.result)
    })
  }

  // ── Mensagem custom ──
  function handleCustom() {
    if (!customMsg.trim()) return
    setLastResult(null)
    startTransition(async () => {
      const res = await sendCustomMessageAction(customTarget, customMsg)
      if (res.success && res.result) setLastResult(res.result)
    })
  }

  // ── Teste ──
  function handleTest() {
    if (!testPhone) return
    setTestResult(null)
    startTransition(async () => {
      const res = await sendTestMessageAction(testPhone)
      setTestResult({ ok: res.success, msg: res.success ? 'Mensagem enviada! Verifique o WhatsApp.' : res.error ?? 'Erro desconhecido.' })
    })
  }

  return (
    <div className="card p-6 space-y-6">

      {/* ── Header + Status ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-widest">
            Notificações WhatsApp
          </h2>
          <p className="text-white/35 text-xs mt-0.5">
            Powered by Z-API · zapi.io
          </p>
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${
          !configured ? 'bg-white/5 border-white/10 text-white/30' :
          connected   ? 'bg-brand-neon/10 border-brand-neon/20 text-brand-neon' :
                        'bg-brand-pink/10 border-brand-pink/20 text-brand-pink'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            !configured ? 'bg-white/25' :
            connected   ? 'bg-brand-neon animate-pulse' : 'bg-brand-pink'
          }`}/>
          {!configured ? 'Não configurado' : connected ? 'Conectado' : 'Desconectado'}
        </div>
      </div>

      {/* ── Aviso de configuração ── */}
      {!configured && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
          <p className="text-white/50 text-sm font-medium">Como configurar:</p>
          <ol className="text-white/35 text-xs space-y-1 list-decimal list-inside">
            <li>Crie uma instância em <strong className="text-white/50">app.z-api.io</strong></li>
            <li>Escaneie o QR Code com seu número WhatsApp</li>
            <li>Adicione ao <code className="text-brand-neon/70">.env</code>:
              <code className="block mt-1 text-brand-neon/60 pl-3">ZAPI_INSTANCE_ID=...<br/>ZAPI_INSTANCE_TOKEN=...</code>
            </li>
            <li>Reinicie o servidor</li>
          </ol>
        </div>
      )}

      {/* ── Métricas ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Com opt-in',    value: stats.optedIn,   color: 'text-brand-neon' },
          { label: 'Com telefone',  value: stats.withPhone, color: 'text-white' },
          { label: 'Enviados hoje', value: stats.sentToday, color: 'text-white' },
        ].map((s) => (
          <div key={s.label} className="bg-white/4 rounded-xl p-3 text-center">
            <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-white/25 text-[10px] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2">
        {[
          { key: 'reminder', label: '📢 Lembrete em massa' },
          { key: 'custom',   label: '✍️ Mensagem custom' },
          { key: 'test',     label: '🧪 Testar' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as typeof activeTab); setLastResult(null) }}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-brand-purple text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Conteúdo das tabs ── */}

      {activeTab === 'reminder' && (
        <div className="space-y-4">
          <p className="text-white/50 text-sm">
            Envia o lembrete padrão para todos os colaboradores com opt-in que
            <strong className="text-white/70"> ainda não finalizaram</strong> os palpites.
            Mensagens já enviadas hoje são ignoradas automaticamente.
          </p>

          <button
            onClick={handleBulkReminder}
            disabled={isPending || !configured}
            className="btn-primary text-sm"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Enviando...
              </span>
            ) : `📢 Enviar lembrete para ${stats.optedIn} opt-ins`}
          </button>

          {lastResult && <ResultBox result={lastResult} />}
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {[
              { k: 'pending_only', l: 'Apenas pendentes' },
              { k: 'all_optin',   l: 'Todos com opt-in' },
            ].map((o) => (
              <button
                key={o.k}
                onClick={() => setCustomTarget(o.k as typeof customTarget)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  customTarget === o.k
                    ? 'bg-brand-purple/60 text-white border border-brand-purple/50'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>

          <textarea
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            placeholder="Digite sua mensagem... (o nome do colaborador será inserido automaticamente no início)"
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-brand-cream placeholder-white/25 focus:outline-none focus:border-brand-purple resize-none"
          />

          <button
            onClick={handleCustom}
            disabled={isPending || !configured || !customMsg.trim()}
            className="btn-primary text-sm"
          >
            {isPending ? 'Enviando...' : 'Enviar mensagem'}
          </button>

          {lastResult && <ResultBox result={lastResult} />}
        </div>
      )}

      {activeTab === 'test' && (
        <div className="space-y-4">
          <p className="text-white/50 text-sm">
            Envia uma mensagem de teste para verificar se a integração está funcionando.
          </p>

          <div className="flex gap-3">
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="(11) 9 9999-9999"
              className="input-field text-sm flex-1"
            />
            <button
              onClick={handleTest}
              disabled={isPending || !configured || !testPhone}
              className="btn-primary text-sm shrink-0"
            >
              {isPending ? '...' : 'Testar'}
            </button>
          </div>

          {testResult && (
            <p className={`text-sm ${testResult.ok ? 'text-brand-neon' : 'text-brand-pink'}`}>
              {testResult.ok ? '✓ ' : '✗ '}{testResult.msg}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
