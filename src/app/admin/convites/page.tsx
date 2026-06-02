import { getSession }   from '@/lib/session'
import { redirect }     from 'next/navigation'
import { db }           from '@/lib/db'
import { users }        from '@/db/schema'
import { eq, and, isNull, isNotNull } from 'drizzle-orm'
import { BulkInviteButton }   from './bulk-invite-button'
import { SingleInviteButton } from './single-invite-button'

export const revalidate  = 0
export const maxDuration = 60   // Vercel: até 60s para envio em massa
export const metadata    = { title: 'Convites | Admin Bolão Copa 2026' }

export default async function ConvitesPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const [pending, accessed, total] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, department: users.department, manager: users.manager })
      .from(users)
      .where(and(eq(users.isActive, true), eq(users.role, 'user'), isNull(users.firstAccessAt))),
    db.select({ id: users.id, name: users.name, email: users.email, firstAccessAt: users.firstAccessAt })
      .from(users)
      .where(and(eq(users.isActive, true), eq(users.role, 'user'), isNotNull(users.firstAccessAt))),
    db.select({ id: users.id })
      .from(users)
      .where(and(eq(users.isActive, true), eq(users.role, 'user'))),
  ])

  const accessedPct = total.length > 0 ? Math.round((accessed.length / total.length) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1a1625' }}>Convites de Acesso</h1>
        <p className="text-sm mt-1" style={{ color: '#8a8490' }}>
          Envie e-mails de primeiro acesso para os colaboradores
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total de colaboradores', value: total.length, color: '#1a1625' },
          { label: 'Aguardando acesso',       value: pending.length, color: '#f5a623' },
          { label: 'Já acessaram',            value: `${accessed.length} (${accessedPct}%)`, color: '#01E18E' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: '#8a8490' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Barra de progresso */}
      <div className="card p-5 space-y-3">
        <div className="flex justify-between text-sm font-medium" style={{ color: '#6b6672' }}>
          <span>Adesão ao bolão</span>
          <span style={{ color: '#1a1625' }}>{accessedPct}%</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: '#f0ede8' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${accessedPct}%`, background: 'linear-gradient(90deg,#422c76,#01E18E)' }}
          />
        </div>
        <p className="text-xs" style={{ color: '#aaa8b0' }}>
          {accessed.length} de {total.length} colaboradores já criaram sua senha e acessaram o sistema.
        </p>
      </div>

      {/* Envio em massa */}
      {pending.length > 0 && (
        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold" style={{ color: '#1a1625' }}>
              Enviar convites em massa
            </h2>
            <p className="text-sm mt-1" style={{ color: '#8a8490' }}>
              Envia e-mail para os <strong style={{ color: '#1a1625' }}>{pending.length}</strong> colaboradores
              que ainda não acessaram. Cada e-mail contém um link único válido por 7 dias.
            </p>
          </div>

          <div className="rounded-xl p-4 border" style={{ background: '#fff9f0', borderColor: '#fde8c0' }}>
            <p className="text-xs font-semibold" style={{ color: '#b07820' }}>
              ⚠️ Antes de enviar, verifique:
            </p>
            <ul className="mt-2 space-y-1 text-xs" style={{ color: '#8a6030' }}>
              <li>• A variável <code style={{ background: '#fde8c0', padding: '1px 4px', borderRadius: 4 }}>RESEND_API_KEY</code> está configurada no Vercel</li>
              <li>• A variável <code style={{ background: '#fde8c0', padding: '1px 4px', borderRadius: 4 }}>NEXT_PUBLIC_BASE_URL</code> aponta para o domínio do sistema</li>
              <li>• O domínio de envio está verificado no Resend (ou usando sandbox)</li>
            </ul>
          </div>

          <BulkInviteButton pendingCount={pending.length} />
        </div>
      )}

      {/* Lista de pendentes */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: '#8a8490' }}>
            Aguardando convite ({pending.length})
          </h2>
          <div className="card overflow-hidden divide-y" style={{ borderColor: '#f0ede8' }}>
            {pending.map(u => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: '#1a1625' }}>{u.name}</p>
                  <p className="text-xs truncate" style={{ color: '#8a8490' }}>
                    {u.email} · {u.department ?? '—'}
                  </p>
                </div>
                <SingleInviteButton userId={u.id} name={u.name} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lista de quem já acessou */}
      {accessed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: '#8a8490' }}>
            Já acessaram ({accessed.length})
          </h2>
          <div className="card overflow-hidden divide-y" style={{ borderColor: '#f0ede8' }}>
            {accessed.map(u => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: '#1a1625' }}>{u.name}</p>
                  <p className="text-xs truncate" style={{ color: '#8a8490' }}>{u.email}</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-1 rounded-lg shrink-0"
                  style={{ background: 'rgba(1,225,142,0.1)', color: '#01a866' }}>
                  ✓ Acessou
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {pending.length === 0 && (
        <div className="card p-12 text-center space-y-3">
          <span className="text-4xl block">🎉</span>
          <p className="font-semibold text-lg" style={{ color: '#1a1625' }}>Todos já acessaram o sistema!</p>
          <p className="text-sm" style={{ color: '#8a8490' }}>
            Os {total.length} colaboradores ativos já criaram sua senha.
          </p>
        </div>
      )}
    </div>
  )
}
