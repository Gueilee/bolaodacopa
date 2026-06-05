import { getSession }   from '@/lib/session'
import { redirect }     from 'next/navigation'
import { db }           from '@/lib/db'
import { users }        from '@/db/schema'
import { eq, and, isNull, isNotNull, inArray } from 'drizzle-orm'
import { BulkInviteButton } from './bulk-invite-button'
import { PendingList }      from './pending-list'
import { AccessedList }     from './accessed-list'
import { InviteByEmail }   from './invite-by-email'

export const revalidate  = 0
export const maxDuration = 60
export const metadata    = { title: 'Convites | Admin Bolão Copa 2026' }

export default async function ConvitesPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  // Inclui 'user' e 'rh' — exclui apenas 'admin'
  const ROLES = ['user', 'rh'] as const

  const [pending, accessed, total] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, department: users.department, manager: users.manager })
      .from(users)
      .where(and(eq(users.isActive, true), inArray(users.role, ROLES), isNull(users.firstAccessAt))),
    db.select({ id: users.id, name: users.name, email: users.email, department: users.department, firstAccessAt: users.firstAccessAt })
      .from(users)
      .where(and(eq(users.isActive, true), inArray(users.role, ROLES), isNotNull(users.firstAccessAt)))
      .orderBy(users.firstAccessAt),
    db.select({ id: users.id })
      .from(users)
      .where(and(eq(users.isActive, true), inArray(users.role, ROLES))),
  ])

  const accessedPct = total.length > 0 ? Math.round((accessed.length / total.length) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in" style={{ paddingBottom: 40 }}>

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d0920 0%, #1a0d36 60%, #0a1020 100%)',
        borderRadius: 24, padding: '24px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150,
          background: 'radial-gradient(circle, rgba(66,44,118,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>✉️</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#faf9f5', letterSpacing: '-0.02em' }}>
                Convites de Acesso
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                Envie e-mails de primeiro acesso para os colaboradores
              </p>
            </div>
          </div>
          {/* Stats inline */}
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'Pendentes', value: pending.length, color: '#f5a623' },
              { label: 'Acessaram', value: accessed.length, color: '#01E18E' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: s.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quem já se cadastrou ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1a1625' }}>
              Quem já se cadastrou
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8a8490' }}>
              Colaboradores que criaram senha e acessaram o sistema
            </p>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
            background: 'rgba(1,168,102,0.1)', color: '#01a866',
            border: '1px solid rgba(1,168,102,0.25)',
          }}>
            ✓ {accessed.length} cadastrados
          </span>
        </div>
        <AccessedList users={accessed} />
      </section>

      {/* Envio por e-mail — qualquer conta */}
      <InviteByEmail />

      {/* Barra de progresso */}
      <div className="card p-5" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#4a4555' }}>Adesão ao bolão</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#1a1625' }}>{accessedPct}%</span>
        </div>
        <div style={{ height: 10, borderRadius: 10, background: '#f0ede8', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 10,
            width: `${accessedPct}%`,
            background: 'linear-gradient(90deg, #422c76, #01E18E)',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p style={{ margin: 0, fontSize: 12, color: '#aaa8b0' }}>
          {accessed.length} de {total.length} colaboradores já criaram senha e acessaram o sistema.
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="card p-12" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🎉</span>
          <p style={{ fontWeight: 700, fontSize: 17, color: '#1a1625', margin: '0 0 6px' }}>Todos já acessaram!</p>
          <p style={{ fontSize: 13, color: '#8a8490', margin: 0 }}>
            Os {total.length} colaboradores ativos já criaram sua senha.
          </p>
        </div>
      ) : (
        <>
          {/* ── CONVITE INDIVIDUAL (destaque principal) ── */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1a1625' }}>
                  Convidar individualmente
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8a8490' }}>
                  Busque pelo nome, e-mail ou departamento e envie um convite por vez
                </p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                background: 'rgba(245,166,35,0.1)', color: '#d97706',
                border: '1px solid rgba(245,166,35,0.25)',
              }}>
                {pending.length} aguardando
              </span>
            </div>

            <PendingList users={pending} />
          </section>

          {/* ── ENVIO EM MASSA (secundário) ── */}
          <section>
            <details style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <summary style={{
                padding: '16px 20px', cursor: 'pointer', userSelect: 'none',
                fontSize: 14, fontWeight: 700, color: '#1a1625',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', listStyle: 'none',
              }}>
                <span>📢 Enviar convites em massa ({pending.length} colaboradores)</span>
                <span style={{ fontSize: 11, color: '#8a8490', fontWeight: 400 }}>clique para expandir</span>
              </summary>

              <div style={{ padding: '16px 20px 20px', borderTop: '1px solid #f0ede8' }}>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#4a4555', lineHeight: 1.6 }}>
                  Cada colaborador receberá um e-mail personalizado com link único válido por 7 dias para criar sua senha e acessar o sistema.
                </p>
                <BulkInviteButton pendingCount={pending.length} />
              </div>
            </details>
          </section>
        </>
      )}

    </div>
  )
}
