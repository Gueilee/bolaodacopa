import { getSession } from '@/lib/session'
import { redirect }   from 'next/navigation'
import Link           from 'next/link'
import Image          from 'next/image'
import { SidebarNav }           from '@/components/sidebar-nav'
import { SidebarScrollWrapper } from '@/components/sidebar-scroll-wrapper'
import { UserMenu }             from '@/components/user-menu'
import { SidebarCountdown }      from '@/components/sidebar-countdown'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0ede8' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-[260px] shrink-0"
        style={{
          background: 'linear-gradient(180deg, #0d0920 0%, #130a2a 60%, #0f0c20 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '16px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/dashboard" style={{ display: 'block' }}>
            <Image
              src="/logo2.png"
              alt="Bolão Vendemmia Copa 2026"
              width={236} height={110}
              unoptimized priority
              style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: 110 }}
            />
          </Link>
        </div>

        {/* Countdown strip */}
        <SidebarCountdown />

        {/* Navigation */}
        <SidebarScrollWrapper>
          <SidebarNav role={session.role as 'admin' | 'rh' | 'user'} />
        </SidebarScrollWrapper>

        {/* User info */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '14px 12px' }}>
          <UserMenu user={session} />
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar (mobile) */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
          style={{
            background: 'linear-gradient(135deg, #0d0920, #1a0d36)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          }}
        >
          <Link href="/dashboard">
            <Image
              src="/logo2.png" alt="Bolão Vendemmia"
              width={160} height={56} unoptimized
              style={{ objectFit: 'contain', height: 44, width: 'auto' }}
            />
          </Link>
          <UserMenu user={session} compact />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
