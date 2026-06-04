import { db }         from '@/lib/db'
import { users }      from '@/db/schema'
import { eq, asc }   from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { redirect }   from 'next/navigation'
import { CreateUserForm }   from '@/components/create-user-form'
import { UserListFilter }  from '@/components/user-list-filter'

export const revalidate = 0
export const metadata   = { title: 'Gestão de Usuários | Bolão Copa 2026' }

export default async function UsuariosPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const allUsers = await db.query.users.findMany({
    orderBy: [asc(users.name)],
  })

  // Departamentos únicos para o select
  const departments = [
    ...new Set(allUsers.map((u) => u.department).filter(Boolean) as string[]),
  ].sort()

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in" style={{ paddingBottom: 40 }}>
      <div style={{
        background: 'linear-gradient(135deg, #150820 0%, #1a0a2e 60%, #0a1020 100%)',
        borderRadius: 24, padding: '24px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140,
          background: 'radial-gradient(circle, rgba(66,44,118,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>👥</span>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#faf9f5', letterSpacing: '-0.02em' }}>
                Gestão de Usuários
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Adicione colaboradores e atribua departamentos
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 36, fontWeight: 900, color: '#01E18E', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {allUsers.filter((u) => u.isActive).length}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 10, color: 'rgba(1,225,142,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>ativos</p>
          </div>
        </div>
      </div>

      {/* ── Criar usuário ── */}
      <section className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest" style={{color:'#8a8490'}}>
          Adicionar Colaborador
        </h2>
        <CreateUserForm existingDepartments={departments} />
      </section>

      {/* ── Lista com busca e filtros ── */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
          color: '#8a8490', margin: '0 0 12px 4px' }}>
          Colaboradores ({allUsers.length})
        </p>

        {allUsers.length === 0 ? (
          <div className="card p-10" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#8a8490' }}>Nenhum colaborador cadastrado.</p>
          </div>
        ) : (
          <UserListFilter users={allUsers} departments={departments} />
        )}
      </section>
    </div>
  )
}
