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
          <h1 className="text-2xl font-bold text-brand-cream">Gestão de Usuários</h1>
          <p className="text-white/40 text-sm mt-1">
            Adicione colaboradores e atribua departamentos
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black text-white">{allUsers.filter((u) => u.isActive).length}</p>
          <p className="text-white/30 text-xs">ativos</p>
        </div>
      </div>

      {/* ── Criar usuário ── */}
      <section className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
          Adicionar Colaborador
        </h2>
        <CreateUserForm existingDepartments={departments} />
      </section>

      {/* ── Lista ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
          Colaboradores ({allUsers.length})
        </h2>

        <div className="card overflow-hidden divide-y divide-white/5">
          {allUsers.length === 0 ? (
            <p className="text-white/25 text-sm text-center py-10">Nenhum colaborador cadastrado.</p>
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
