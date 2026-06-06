'use client'

import { useState, useTransition } from 'react'
import { savePhoneAction, saveEmailOptInAction } from '@/app/actions/notifications'
import { isValidBrPhone } from '@/lib/whatsapp'

type Props = {
  currentPhone:    string
  currentWhatsApp: boolean
  currentEmail:    boolean
  userEmail:       string
}

function Toggle({ on, disabled, onChange }: { on: boolean; disabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      role="switch"
      aria-checked={on}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center',
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: on ? '#422c76' : '#e2dff0', transition: 'background 0.2s',
        opacity: disabled ? 0.4 : 1, flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
        transform: on ? 'translateX(22px)' : 'translateX(3px)',
      }} />
    </button>
  )
}

export function NotificationsPrefs({ currentPhone, currentWhatsApp, currentEmail, userEmail }: Props) {
  const [phone,      setPhone]      = useState(currentPhone)
  const [waOptIn,    setWaOptIn]    = useState(currentWhatsApp)
  const [emailOptIn, setEmailOptIn] = useState(currentEmail)
  const [saving,     startTransition] = useTransition()
  const [feedback,   setFeedback]   = useState<{ ok: boolean; msg: string } | null>(null)

  const phoneOk = !phone.trim() || isValidBrPhone(phone)

  function save() {
    if (!phoneOk) { setFeedback({ ok: false, msg: 'Número de WhatsApp inválido. Ex: (11) 9 9999-9999' }); return }
    setFeedback(null)
    startTransition(async () => {
      const [r1, r2] = await Promise.all([
        savePhoneAction(phone, waOptIn),
        saveEmailOptInAction(emailOptIn),
      ])
      if (!r1.success || !r2.success) {
        setFeedback({ ok: false, msg: r1.error ?? r2.error ?? 'Erro ao salvar.' })
      } else {
        setFeedback({ ok: true, msg: '✓ Preferências de notificação salvas!' })
      }
    })
  }

  return (
    <div className="card p-5 space-y-5">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8a8490' }}>
          Notificações
        </h2>
        <p className="text-sm mt-1" style={{ color: '#6b6672' }}>
          Escolha como quer ser avisado sobre resultados e ranking
        </p>
      </div>

      {/* ── E-mail ── */}
      <div style={{
        borderRadius: 12, border: '1px solid',
        borderColor: emailOptIn ? 'rgba(66,44,118,0.25)' : '#e8e4df',
        background: emailOptIn ? 'rgba(66,44,118,0.03)' : '#fafafa',
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: emailOptIn ? 'rgba(66,44,118,0.1)' : '#f0ede8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>📧</div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1625' }}>
                Notificações por E-mail
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8a8490' }}>
                Enviado para <strong>{userEmail}</strong>
              </p>
            </div>
          </div>
          <Toggle on={emailOptIn} disabled={saving} onChange={() => setEmailOptIn(v => !v)} />
        </div>
        {emailOptIn && (
          <div style={{
            marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(66,44,118,0.1)',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {['⚽ Resultado + seus pontos após cada jogo', '📊 Sua posição no ranking após atualização'].map(item => (
              <p key={item} style={{ margin: 0, fontSize: 11, color: '#6b6672' }}>{item}</p>
            ))}
          </div>
        )}
      </div>

      {/* ── WhatsApp ── */}
      <div style={{
        borderRadius: 12, border: '1px solid',
        borderColor: waOptIn && phone ? 'rgba(37,211,102,0.3)' : '#e8e4df',
        background: waOptIn && phone ? 'rgba(37,211,102,0.03)' : '#fafafa',
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: waOptIn && phone ? 'rgba(37,211,102,0.1)' : '#f0ede8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>💬</div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1625' }}>
                Notificações por WhatsApp
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8a8490' }}>
                {phone ? `(${phone})` : 'Informe seu número abaixo'}
              </p>
            </div>
          </div>
          <Toggle on={waOptIn && Boolean(phone)} disabled={saving || !phone.trim()} onChange={() => setWaOptIn(v => !v)} />
        </div>

        {/* Número */}
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="(11) 9 9999-9999"
          disabled={saving}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '9px 12px',
            border: `1px solid ${!phone || phoneOk ? '#e8e4df' : '#ff2f69'}`,
            borderRadius: 8, fontSize: 13, color: '#1a1625', background: '#fff',
            outline: 'none',
          }}
        />
        {phone && !phoneOk && (
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ff2f69' }}>
            Formato inválido. Ex: (11) 9 9999-9999
          </p>
        )}

        {waOptIn && phone && phoneOk && (
          <div style={{
            marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(37,211,102,0.15)',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {[
              '📅 Lembrete quando você não finalizou os palpites',
              '⚽ Resultado + pontuação após cada jogo apostado',
              '📊 Sua posição no ranking após atualização',
            ].map(item => (
              <p key={item} style={{ margin: 0, fontSize: 11, color: '#6b6672' }}>{item}</p>
            ))}
          </div>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <p style={{ margin: 0, fontSize: 13, color: feedback.ok ? '#01a866' : '#ff2f69' }}>
          {feedback.msg}
        </p>
      )}

      <button
        onClick={save}
        disabled={saving || !phoneOk}
        className="btn-primary w-full"
        style={{ marginTop: 4 }}
      >
        {saving ? 'Salvando...' : 'Salvar Notificações'}
      </button>
    </div>
  )
}
