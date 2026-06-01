import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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
        <div className="px-6 py-5 border-b border-white/8">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-brand-neon/20 border border-brand-neon/30 flex items-center justify-center transition-all group-hover:shadow-neon">
              <span className="text-lg">⚽</span>
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-none">Bolão 2026</p>
              <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-widest">Vendemmia</p>
            </div>
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
          <div className="flex items-center gap-2">
            <span className="text-lg">⚽</span>
            <span className="text-white text-sm font-semibold">Bolão 2026</span>
          </div>
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
