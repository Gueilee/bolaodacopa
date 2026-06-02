import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// Páginas do admin que o perfil RH pode acessar
const RH_ALLOWED = ['/admin/rh']

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/dashboard')

  const isAdmin = session.role === 'admin'
  const isRH    = session.role === 'rh'

  if (!isAdmin && !isRH) redirect('/dashboard')

  // RH só pode acessar as rotas permitidas
  // (a verificação de pathname é feita no middleware de cada rota específica;
  //  aqui apenas controlamos o layout — o menu já filtra as opções visíveis)

  const bannerLabel = isAdmin ? 'Modo Administrador' : 'Dashboard RH'
  const bannerIcon  = isAdmin ? '⚙' : '📊'

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Image
            src="/logo2.png"
            alt="Bolão Vendemmia Copa 2026"
            width={220} height={80}
            unoptimized
            style={{ objectFit: 'contain', height: 64, width: 'auto' }}
          />
        </Link>
      </div>

      {/* Banner */}
      <div className="flex items-center justify-between px-5 py-3 rounded-xl bg-brand-pink/10 border border-brand-pink/20">
        <div className="flex items-center gap-2">
          <span className="text-brand-pink text-sm">{bannerIcon}</span>
          <p className="text-brand-pink text-sm font-semibold">{bannerLabel}</p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-brand-pink/70 hover:text-brand-pink transition-colors font-medium"
        >
          ← Voltar ao Bolão
        </Link>
      </div>

      {children}
    </div>
  )
}
