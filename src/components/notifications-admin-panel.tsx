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
  status: ConnectionStatus | null
  stats: {
    optedIn:   number
    withPhone: number
    sentToday: number
  }
}

function ResultBox({ result }: { result: NotifResult }) {
  const hasError = result.failed > 0
  return (
    <div style={{
      padding: '14px 18px', borderRadius: 14,
      background: hasError ? 'rgba(255,47,105,0.06)' : 'rgba(1,168,102,0.06)',
      border: `1px solid ${hasError ? 'rgba(255,47,105,0.2)' : 'rgba(1,168,102,0.2)'}`,
    }}>
      <div style={{ display: 'flex', gap: 20, marginBottom: result.errors.length ? 8 : 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#01a866' }}>✓ {result.sent} enviados</span>
        {result.skipped > 0 && <span style={{ fontSize: 13, color: '#8a8490' }}>{result.skipped} ignorados</span>}
        {result.failed  > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: '#ff2f69' }}>✗ {result.failed} falhas</span>}
      </div>
      {result.errors.slice(0, 3).map((e, i) => (
        <p key={i} style={{ fontSize: 11, color: '#ff2f69', fontFamily: 'monospace', margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e}</p>
      ))}
    </div>
  )
}

export function NotificationsAdminPanel({ status, stats }: Props) {
  const [isPending,    startTransition] = useTransition()
  const [lastResult,   setLastResult]   = useState<NotifResult | null>(null)
  const [testPhone,    setTestPhone]    = useState('')
  const [testResult,   setTestResult]   = useState<{ ok: boolean; msg: string } | null>(null)
  const [customMsg,    setCustomMsg]    = useState('')
  const [customTarget, setCustomTarget] = useState<'all_optin' | 'pending_only'>('pending_only')
  const [activeTab,    setActiveTab]    = useState<'reminder' | 'custom' | 'test'>('reminder')

  const configured = status !== null
  const connected  = status?.connected ?? false

  function handleBulkReminder() {
    setLastResult(null)
    startTransition(async () => {
      const res = await sendBulkReminderAction()
      if (res.success && res.result) setLastResult(res.result)
    })
  }

  function handleCustom() {
    if (!customMsg.trim()) return
    setLastResult(null)
    startTransition(async () => {
      const res = await sendCustomMessageAction(customTarget, customMsg)
      if (res.success && res.result) setLastResult(res.result)
    })
  }

  function handleTest() {
    if (!testPhone) return
    setTestResult(null)
    startTransition(async () => {
      const res = await sendTestMessageAction(testPhone)
      setTestResult({ ok: res.success, msg: res.success ? 'Mensagem enviada! Verifique o WhatsApp.' : res.error ?? 'Erro desconhecido.' })
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Status + Métricas ── */}
      <div className="card p-5" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header + Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1625' }}>
              Integração Z-API (WhatsApp)
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8a8490' }}>
              zapi.io — envio de lembretes automáticos via WhatsApp
            </p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 20,
            background: !configured ? '#f5f2ef' : connected ? 'rgba(1,168,102,0.1)' : 'rgba(255,47,105,0.1)',
            border: `1px solid ${!configured ? '#e0dbd5' : connected ? 'rgba(1,168,102,0.25)' : 'rgba(255,47,105,0.25)'}`,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: !configured ? '#c4bfba' : connected ? '#01a866' : '#ff2f69',
            }} />
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: !configured ? '#8a8490' : connected ? '#01a866' : '#ff2f69',
            }}>
              {!configured ? 'Não configurado' : connected ? 'WhatsApp conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        {/* Aviso de configuração */}
        {!configured && (
          <div style={{
            padding: '16px 18px', borderRadius: 14,
            background: '#faf9f7', border: '1px solid #e8e4df',
          }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#1a1625' }}>
              ⚙️ Como configurar o WhatsApp:
            </p>
            <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                <>Crie uma instância em <strong>app.z-api.io</strong></>,
                <>Escaneie o QR Code com o número WhatsApp da empresa</>,
                <>Adicione ao arquivo <code style={{ background: '#f0ede8', padding: '1px 6px', borderRadius: 5, fontSize: 11 }}>.env.docker.prod</code> e faça um novo deploy:</>,
                <><code style={{ display: 'block', background: '#f0ede8', padding: '8px 12px', borderRadius: 8, fontSize: 11, fontFamily: 'monospace', marginTop: 4, lineHeight: 1.8, color: '#422c76' }}>{'ZAPI_INSTANCE_ID=sua-instancia\nZAPI_INSTANCE_TOKEN=seu-token'}</code></>,
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 13, color: '#4a4555', lineHeight: 1.6 }}>{item}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { label: 'Com opt-in',    value: stats.optedIn,   icon: '✅', color: '#01a866' },
            { label: 'Com telefone',  value: stats.withPhone, icon: '📱', color: '#422c76' },
            { label: 'Enviados hoje', value: stats.sentToday, icon: '📤', color: '#d4a017' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#f9f7f5', borderRadius: 12, padding: '12px',
              textAlign: 'center', border: '1px solid #edeae6',
            }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <p style={{ margin: '4px 0 2px', fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>
                {s.value}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: '#8a8490', fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Ações ── */}
      <div className="card overflow-hidden">
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f0ede8' }}>
          {[
            { key: 'reminder', label: '📢 Lembrete em massa' },
            { key: 'custom',   label: '✍️ Mensagem custom' },
            { key: 'test',     label: '🧪 Testar' },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => { setActiveTab(tab.key as typeof activeTab); setLastResult(null) }}
              style={{
                flex: 1, padding: '12px 8px', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                background: activeTab === tab.key ? '#fff' : '#faf9f7',
                color: activeTab === tab.key ? '#422c76' : '#8a8490',
                borderBottom: activeTab === tab.key ? '2px solid #422c76' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {activeTab === 'reminder' && (
            <>
              <p style={{ margin: 0, fontSize: 13, color: '#4a4555', lineHeight: 1.6 }}>
                Envia o lembrete padrão para todos os colaboradores com opt-in que
                <strong style={{ color: '#1a1625' }}> ainda não finalizaram</strong> os palpites.
                Mensagens já enviadas hoje são ignoradas automaticamente.
              </p>
              <button onClick={handleBulkReminder} disabled={isPending || !configured}
                className="btn-primary" style={{ fontSize: 13, alignSelf: 'flex-start' }}>
                {isPending ? 'Enviando...' : `📢 Enviar lembrete para ${stats.optedIn} opt-ins`}
              </button>
              {!configured && (
                <p style={{ fontSize: 12, color: '#ff2f69', margin: 0 }}>
                  ⚠ Configure o Z-API primeiro para enviar mensagens.
                </p>
              )}
              {lastResult && <ResultBox result={lastResult} />}
            </>
          )}

          {activeTab === 'custom' && (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { k: 'pending_only', l: '🎯 Apenas pendentes' },
                  { k: 'all_optin',   l: '📋 Todos com opt-in' },
                ].map(o => (
                  <button key={o.k} onClick={() => setCustomTarget(o.k as typeof customTarget)}
                    style={{
                      padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      background: customTarget === o.k ? '#422c76' : '#f0ede8',
                      color: customTarget === o.k ? '#fff' : '#6b6672',
                      transition: 'all 0.15s',
                    }}>
                    {o.l}
                  </button>
                ))}
              </div>
              <textarea
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Digite sua mensagem... (o nome do colaborador será inserido automaticamente no início)"
                rows={4}
                className="input-field"
                style={{ resize: 'none', fontFamily: 'inherit' }}
              />
              <button onClick={handleCustom} disabled={isPending || !configured || !customMsg.trim()}
                className="btn-primary" style={{ fontSize: 13, alignSelf: 'flex-start' }}>
                {isPending ? 'Enviando...' : 'Enviar mensagem'}
              </button>
              {lastResult && <ResultBox result={lastResult} />}
            </>
          )}

          {activeTab === 'test' && (
            <>
              <p style={{ margin: 0, fontSize: 13, color: '#4a4555', lineHeight: 1.6 }}>
                Envia uma mensagem de teste para verificar se a integração Z-API está funcionando corretamente.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="tel" value={testPhone} onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="(11) 9 9999-9999" className="input-field"
                  style={{ flex: 1, fontSize: 13 }} />
                <button onClick={handleTest} disabled={isPending || !configured || !testPhone}
                  className="btn-primary" style={{ fontSize: 13, flexShrink: 0 }}>
                  {isPending ? '...' : 'Testar'}
                </button>
              </div>
              {testResult && (
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600,
                  color: testResult.ok ? '#01a866' : '#ff2f69' }}>
                  {testResult.ok ? '✓ ' : '✗ '}{testResult.msg}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
