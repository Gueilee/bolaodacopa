'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  href:      string
  label:     string
  icon:      string
  adminOnly?: boolean
  newTab?:   boolean
}

const navItems: NavItem[] = [
  { href: '/dashboard',                   label: 'Ranking',        icon: '🏆' },
  { href: '/dashboard/departamentos',     label: 'Por Departamento',icon: '🏢' },
  { href: '/dashboard/copa-ao-vivo',      label: 'Copa ao Vivo',   icon: '📡' },
  { href: '/dashboard/jogos',             label: 'Jogos',          icon: '⚽' },
  { href: '/dashboard/palpites',          label: 'Meus Palpites',  icon: '🎯' },
  { href: '/dashboard/mural',             label: 'Mural Social',   icon: '💬' },
  { href: '/dashboard/finais',            label: 'Palpite Final',  icon: '🌟' },
  { href: '/tv',                          label: 'TV Corporativa', icon: '📺', newTab: true },
  { href: '/dashboard/perfil',            label: 'Meu Perfil',     icon: '👤' },
  { href: '/admin',                       label: 'Administração',  icon: '⚙️', adminOnly: true },
  { href: '/admin/usuarios',              label: 'Colaboradores',  icon: '👥', adminOnly: true },
  { href: '/admin/rh',                    label: 'Dashboard RH',   icon: '📊', adminOnly: true },
  { href: '/admin/exportar',              label: 'Exportar',       icon: '⬇️', adminOnly: true },
]

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const items = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <>
      {items.map((item) => {
        const isActive = !item.newTab && (
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href))
        )
        return (
          <Link
            key={item.href}
            href={item.href}
            target={item.newTab ? '_blank' : undefined}
            rel={item.newTab ? 'noopener noreferrer' : undefined}
            className={`nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
            {item.newTab && (
              <span style={{ fontSize: 10, color: '#8a8490', marginLeft: 'auto' }}>↗</span>
            )}
            {isActive && !item.newTab && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-neon" />
            )}
          </Link>
        )
      })}
    </>
  )
}
