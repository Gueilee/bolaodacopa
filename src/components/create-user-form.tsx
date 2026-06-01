'use client'

import { useState, useTransition } from 'react'
import { createUser } from '@/app/actions/users'

type Props = { existingDepartments: string[] }

export function CreateUserForm({ existingDepartments }: Props) {
  const [isPending, startTransition] = useTransition()
  const [feedback,  setFeedback]     = useState<{ ok: boolean; msg: string } | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFeedback(null)

    const fd   = new FormData(e.currentTarget)
    const form = e.currentTarget

    startTransition(async () => {
      const result = await createUser({
        name:       fd.get('name') as string,
        email:      fd.get('email') as string,
        password:   fd.get('password') as string,
        role:       fd.get('role') as 'admin' | 'user',
        department: (fd.get('department') as string) || null,
      })

      if (result.success) {
        setFeedback({ ok: true, msg: 'Colaborador adicionado com sucesso.' })
        form.reset()
      } else {
        setFeedback({ ok: false, msg: result.error ?? 'Erro ao criar usuário.' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

      {/* Nome */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50">Nome completo</label>
        <input name="name" required disabled={isPending}
          className="input-field text-sm" placeholder="João Silva" />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50">E-mail corporativo</label>
        <input name="email" type="email" required disabled={isPending}
          className="input-field text-sm" placeholder="joao@vendemmia.com.br" />
      </div>

      {/* Senha */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50">Senha inicial</label>
        <input name="password" type="password" required minLength={6} disabled={isPending}
          className="input-field text-sm" placeholder="mínimo 6 caracteres" />
      </div>

      {/* Departamento */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50">Departamento</label>
        <input
          name="department"
          list="dept-list-new"
          disabled={isPending}
          className="input-field text-sm"
          placeholder="ex: Comercial, Operações…"
        />
        <datalist id="dept-list-new">
          {existingDepartments.map((d) => <option key={d} value={d} />)}
        </datalist>
      </div>

      {/* Role */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50">Perfil</label>
        <select name="role" disabled={isPending} className="input-field text-sm">
          <option value="user">Colaborador</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      {/* Submit */}
      <div className="sm:col-span-2 flex items-center gap-4">
        <button type="submit" disabled={isPending} className="btn-primary text-sm">
          {isPending ? 'Adicionando...' : '+ Adicionar Colaborador'}
        </button>

        {feedback && (
          <p className={`text-sm ${feedback.ok ? 'text-brand-neon' : 'text-brand-pink'}`}>
            {feedback.msg}
          </p>
        )}
      </div>
    </form>
  )
}
