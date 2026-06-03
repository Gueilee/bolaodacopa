'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Role = 'admin' | 'rh' | 'user'

type NavItem = {
  href:     string
  label:    string
  icon:     string
  roles?:   Role[]
  newTab?:  boolean
  section?: string
}

const navItems: NavItem[] = [
  { href: '/dashboard/palpites',      label: 'Meus Palpites',        icon: '🎯', section: 'Bolão' },
  { href: '/dashboard/finais',        label: 'Palpite Final',        icon: '🌟' },
  { href: '/dashboard/copa-ao-vivo',  label: 'Copa ao Vivo',         icon: '⚽' },
  { href: '/dashboard/regras',        label: 'Regras',               icon: '📋' },
  { href: '/dashboard',               label: 'Ranking Individual',   icon: '🏆', section: 'Ranking' },
  { href: '/dashboard/departamentos', label: 'Por Departamento',     icon: '🏢' },
  { href: '/dashboard/mural',         label: 'Central da Torcida',  icon: '💬', section: 'Comunidade' },
  { href: '/dashboard/perfil',        label: 'Meu Perfil',           icon: '👤' },
  { href: '/admin/rh',                label: 'Dashboard RH',         icon: '📊', roles: ['rh', 'admin'], section: 'Gestão' },
  { href: '/tv',                      label: 'TV Corporativa',       icon: '📺', roles: ['rh', 'admin'], newTab: true },
  { href: '/admin',                   label: 'Administração',        icon: '⚙️', roles: ['admin'] },
  { href: '/admin/usuarios',          label: 'Colaboradores',        icon: '👥', roles: ['admin'] },
  { href: '/admin/exportar',          label: 'Exportar',             icon: '⬇️', roles: ['admin'] },
]

type Props = { role: Role }

export function SidebarNav({ role }: Props) {
  const pathname = usePathname()
  const visible  = navItems.filter(item => !item.roles || item.roles.includes(role))

  let lastSection = ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {visible.map((item) => {
        const isActive = !item.newTab && (
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
        )

        const showSection = item.section && item.section !== lastSection
        if (item.section) lastSection = item.section

        return (
          <div key={item.href}>
            {showSection && (
              <p className="nav-section">{item.section}</p>
            )}
            <Link
              href={item.href}
              target={item.newTab ? '_blank' : undefined}
              rel={item.newTab ? 'noopener noreferrer' : undefined}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: 15, lineHeight: 1, minWidth: 20, textAlign: 'center' }}>
                {item.icon}
              </span>
              <span style={{ flex: 1, fontSize: 13 }}>{item.label}</span>
              {item.newTab && <span style={{ fontSize: 10, opacity: 0.35 }}>↗</span>}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
