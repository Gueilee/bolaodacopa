'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { redeemInviteToken } from '@/app/actions/invite'

export function FirstAccessForm({ token }: { token: string }) {
  const [pwd, setPwd]         = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)
  const [isPending, start]    = useTransition()
  const router                = useRouter()

  const strength = pwd.length === 0 ? 0 : pwd.length < 6 ? 1 : pwd.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Fraca', 'Média', 'Forte']
  const strengthColor = ['', '#ff2f69', '#f5a623', '#01E18E']

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (pwd.length < 8) { setError('A senha deve ter pelo menos 8 caracteres.'); return }
    if (pwd !== confirm)  { setError('As senhas não coincidem.'); return }

    start(async () => {
      const result = await redeemInviteToken(token, pwd)
      if (!result.success) { setError(result.error ?? 'Erro ao definir senha.'); return }
      setDone(true)
      setTimeout(() => router.push('/login?primeiro-acesso=1'), 2000)
    })
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <span style={{ fontSize: 48 }}>🎉</span>
        <p style={{ margin: '12px 0 4px', fontSize: 18, fontWeight: 800, color: '#1a1625' }}>Senha criada!</p>
        <p style={{ margin: 0, fontSize: 14, color: '#8a8490' }}>Redirecionando para o login…</p>
      </div>
    )
  }

  const inputStyle = {
    width: '100%', height: 48, borderRadius: 12, border: '1.5px solid #d0cbc5',
    padding: '0 14px', fontSize: 15, color: '#1a1625', background: '#fff',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b6672', marginBottom: 6 }}>
          Nova senha
        </label>
        <input
          type="password"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          required
          style={inputStyle}
        />
        {pwd.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <div style={{ flex: 1, height: 4, background: '#f0ede8', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${(strength / 3) * 100}%`, height: '100%', background: strengthColor[strength], transition: 'width 0.3s, background 0.3s', borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
          </div>
        )}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b6672', marginBottom: 6 }}>
          Confirmar senha
        </label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Repita a senha"
          required
          style={{ ...inputStyle, borderColor: confirm && confirm !== pwd ? '#ff2f69' : '#d0cbc5' }}
        />
      </div>

      {error && (
        <div style={{ background: '#fff0f3', border: '1px solid #ffd0da', borderRadius: 10, padding: '10px 14px' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#ff2f69', fontWeight: 600 }}>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !pwd || !confirm}
        style={{
          height: 50, borderRadius: 14, border: 'none', cursor: isPending ? 'wait' : 'pointer',
          background: isPending ? '#c4bfba' : '#422c76',
          color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: '0.02em',
          transition: 'background 0.2s',
        }}
      >
        {isPending ? 'Criando senha…' : '🔐 Criar senha e entrar'}
      </button>

      <p style={{ margin: 0, fontSize: 11, color: '#aaa8b0', textAlign: 'center', lineHeight: 1.5 }}>
        Use uma senha que você não utilize em outros sistemas.
      </p>
    </form>
  )
}
