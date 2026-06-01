import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SidebarNav } from '@/components/sidebar-nav'
import { UserMenu } from '@/components/user-menu'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0ede8' }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0"
        style={{ background: '#ffffff', borderRight: '1px solid #e5e2dd', boxShadow: '2px 0 12px rgba(0,0,0,0.06)' }}>

        {/* Logo */}
        <div className="px-4 py-4" style={{ borderBottom: '1px solid #e5e2dd' }}>
          <Link href="/dashboard">
            <Image
              src="/vendemmia-logo.png"
              alt="Bolão Vendemmia Copa 2026"
              width={220}
              height={74}
              unoptimized
              priority
              style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: 74 }}
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <SidebarNav isAdmin={session.role === 'admin'} />
        </nav>

        {/* User info */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid #e5e2dd' }}>
          <UserMenu user={session} />
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
          style={{ background: '#ffffff', borderBottom: '1px solid #e5e2dd', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <Link href="/dashboard">
            <Image
              src="/vendemmia-logo.png"
              alt="Bolão Vendemmia"
              width={130}
              height={44}
              unoptimized
              style={{ objectFit: 'contain', height: 40, width: 'auto' }}
            />
          </Link>
          <UserMenu user={session} compact />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
