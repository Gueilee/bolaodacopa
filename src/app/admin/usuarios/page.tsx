import { db }         from '@/lib/db'
import { users }      from '@/db/schema'
import { eq, asc }   from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { redirect }   from 'next/navigation'
import { UserAdminRow }  from '@/components/user-admin-row'
import { CreateUserForm }from '@/components/create-user-form'

export const revalidate = 0
export const metadata   = { title: 'Gestão de Usuários | Bolão Copa 2026' }

export default async function UsuariosPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const allUsers = await db.query.users.findMany({
    orderBy: [asc(users.department), asc(users.name)],
  })

  // Departamentos únicos para o select
  const departments = [
    ...new Set(allUsers.map((u) => u.department).filter(Boolean) as string[]),
  ].sort()

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{color:'#1a1625'}}>Gestão de Usuários</h1>
          <p className="text-sm mt-1" style={{color:'#8a8490'}}>
            Adicione colaboradores e atribua departamentos
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black" style={{color:'#1a1625'}}>{allUsers.filter((u) => u.isActive).length}</p>
          <p className="text-xs" style={{color:'#8a8490'}}>ativos</p>
        </div>
      </div>

      {/* ── Criar usuário ── */}
      <section className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest" style={{color:'#8a8490'}}>
          Adicionar Colaborador
        </h2>
        <CreateUserForm existingDepartments={departments} />
      </section>

      {/* ── Lista ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest" style={{color:'#8a8490'}}>
          Colaboradores ({allUsers.length})
        </h2>

        <div className="card overflow-hidden" style={{borderBottom:'none'}}>
          {allUsers.length === 0 ? (
            <p className="text-sm text-center py-10" style={{color:'#8a8490'}}>Nenhum colaborador cadastrado.</p>
          ) : (
            allUsers.map((u) => (
              <UserAdminRow
                key={u.id}
                user={u}
                existingDepartments={departments}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}
