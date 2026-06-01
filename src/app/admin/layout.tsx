import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Image
            src="/vendemmia-logo.png"
            alt="Bolão Vendemmia Copa 2026"
            width={160} height={54}
            unoptimized
            style={{ objectFit: 'contain', height: 48, width: 'auto' }}
          />
        </Link>
      </div>

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
