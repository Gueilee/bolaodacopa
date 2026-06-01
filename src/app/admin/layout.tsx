import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  return (
    <div className="space-y-6">
      {/* Admin banner */}
      <div className="flex items-center justify-between px-5 py-3 rounded-xl bg-brand-pink/10 border border-brand-pink/20">
        <div className="flex items-center gap-2">
          <span className="text-brand-pink text-sm">⚙</span>
          <p className="text-brand-pink text-sm font-semibold">Modo Administrador</p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-white/40 hover:text-white transition-colors"
        >
          ← Voltar ao Bolão
        </Link>
      </div>

      {children}
    </div>
  )
}
