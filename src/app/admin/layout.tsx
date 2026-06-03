import { getSession } from '@/lib/session'
import { redirect }   from 'next/navigation'
import Link           from 'next/link'
import Image          from 'next/image'
import { AdminSidebarNav } from '@/components/admin-sidebar-nav'
import { UserMenu }   from '@/components/user-menu'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/dashboard')

  const isAdmin = session.role === 'admin'
  const isRH    = session.role === 'rh'

  if (!isAdmin && !isRH) redirect('/dashboard')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0ede8' }}>

      {/* ── Sidebar Admin ──────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-[260px] shrink-0"
        style={{
          background: 'linear-gradient(180deg, #150820 0%, #1a0a2e 60%, #0d1020 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '16px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/dashboard" style={{ display: 'block' }}>
            <Image
              src="/logo2.png" alt="Bolão Vendemmia Copa 2026"
              width={236} height={110} unoptimized priority
              style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: 110 }}
            />
          </Link>
        </div>

        {/* Badge de modo */}
        <div style={{
          margin: '10px 12px',
          padding: '10px 14px', borderRadius: 12,
          background: isAdmin ? 'rgba(255,47,105,0.1)' : 'rgba(1,225,142,0.07)',
          border: `1px solid ${isAdmin ? 'rgba(255,47,105,0.25)' : 'rgba(1,225,142,0.2)'}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>{isAdmin ? '⚙️' : '📊'}</span>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: isAdmin ? 'rgba(255,47,105,0.7)' : 'rgba(1,225,142,0.6)' }}>
              {isAdmin ? 'Modo Admin' : 'Modo RH'}
            </p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700,
              color: isAdmin ? '#ff2f69' : '#01E18E' }}>
              {isAdmin ? 'Acesso total' : 'Dashboard RH'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 overflow-y-auto">
          <AdminSidebarNav role={session.role as 'admin' | 'rh'} />
        </nav>

        {/* Voltar ao bolão */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            transition: 'all 0.15s',
          }}>
            <span>←</span>
            <span>Voltar ao Bolão</span>
          </Link>
        </div>

        {/* User */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <UserMenu user={session} />
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar (mobile) */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
          style={{
            background: 'linear-gradient(135deg, #150820, #1a0a2e)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Link href="/dashboard">
            <Image src="/logo2.png" alt="Bolão" width={140} height={50} unoptimized
              style={{ objectFit: 'contain', height: 40, width: 'auto' }} />
          </Link>
          <Link href="/dashboard" style={{ fontSize: 12, color: '#ff2f69', fontWeight: 600 }}>
            ← Bolão
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
