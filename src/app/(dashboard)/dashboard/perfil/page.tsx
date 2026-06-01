import { getSession } from '@/lib/session'
import { db }         from '@/lib/db'
import { users }      from '@/db/schema'
import { eq }         from 'drizzle-orm'
import { redirect }   from 'next/navigation'
import { WhatsAppOptInForm } from '@/components/whatsapp-optin-form'

export const revalidate = 0
export const metadata   = { title: 'Meu Perfil | Bolão Copa 2026' }

export default async function PerfilPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: {
      id:               true,
      name:             true,
      email:            true,
      department:       true,
      phone:            true,
      whatsappOptIn:    true,
      totalPoints:      true,
      isPredictionLocked: true,
    },
  })

  if (!user) redirect('/login')

  // Formata o número armazenado (5511999999999) para exibição ((11) 9 9999-9999)
  const displayPhone = user.phone
    ? user.phone.replace(/^55(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')
    : ''

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-brand-cream">Meu Perfil</h1>
        <p className="text-white/40 text-sm mt-1">Configurações da sua conta</p>
      </div>

      {/* ── Informações básicas ── */}
      <div className="card p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Dados da Conta
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Nome',         value: user.name },
            { label: 'E-mail',       value: user.email },
            { label: 'Departamento', value: user.department ?? '—' },
            { label: 'Pontos',       value: `${user.totalPoints} pts` },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">{f.label}</p>
              <p className="text-white/80 text-sm font-medium truncate">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── WhatsApp Opt-in ── */}
      <WhatsAppOptInForm
        currentPhone={displayPhone}
        currentOptIn={user.whatsappOptIn}
      />
    </div>
  )
}
