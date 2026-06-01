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
    <div className="flex h-screen bg-[#0f0d17] overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-sidebar-gradient border-r border-white/8">

        {/* Brand */}
        <div className="px-4 py-4 border-b border-white/8">
          <Link href="/dashboard">
            <Image
              src="/vendemmia-logo.png"
              alt="Bolão Vendemmia Copa 2026"
              width={180}
              height={60}
              unoptimized
              style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: 60 }}
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <SidebarNav isAdmin={session.role === 'admin'} />
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-white/8">
          <UserMenu user={session} />
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#0f0d17]/90 backdrop-blur-sm sticky top-0 z-30">
          <Link href="/dashboard">
            <Image
              src="/vendemmia-logo.png"
              alt="Bolão Vendemmia"
              width={120}
              height={40}
              unoptimized
              style={{ objectFit: 'contain', height: 36, width: 'auto' }}
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
