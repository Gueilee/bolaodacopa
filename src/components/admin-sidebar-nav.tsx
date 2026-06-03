'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Role = 'admin' | 'rh'

type NavItem = {
  href:     string
  label:    string
  icon:     string
  roles?:   Role[]
  section?: string
}

const items: NavItem[] = [
  { href: '/admin',          label: 'Painel Admin',   icon: '🏠', roles: ['admin'], section: 'Administração' },
  { href: '/admin/usuarios', label: 'Colaboradores',  icon: '👥', roles: ['admin'] },
  { href: '/admin/convites', label: 'Convites',       icon: '✉️', roles: ['admin'] },
  { href: '/admin/exportar', label: 'Exportar',       icon: '⬇️', roles: ['admin'] },
  { href: '/admin/notificacoes', label: 'Notificações', icon: '🔔', roles: ['admin'] },
  { href: '/admin/rh',       label: 'Dashboard RH',  icon: '📊', section: 'Relatórios' },
]

export function AdminSidebarNav({ role }: { role: Role }) {
  const pathname = usePathname()
  const visible  = items.filter(i => !i.roles || i.roles.includes(role))

  let lastSection = ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {visible.map((item) => {
        const isActive = item.href === '/admin'
          ? pathname === '/admin'
          : pathname.startsWith(item.href)

        const showSection = item.section && item.section !== lastSection
        if (item.section) lastSection = item.section

        return (
          <div key={item.href}>
            {showSection && (
              <p className="nav-section">{item.section}</p>
            )}
            <Link href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
              <span style={{ fontSize: 15, lineHeight: 1, minWidth: 20, textAlign: 'center' }}>
                {item.icon}
              </span>
              <span style={{ flex: 1, fontSize: 13 }}>{item.label}</span>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
