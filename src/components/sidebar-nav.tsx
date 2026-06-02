'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Role = 'admin' | 'rh' | 'user'

type NavItem = {
  href:    string
  label:   string
  icon:    string
  roles?:  Role[]
  newTab?: boolean
}

const navItems: NavItem[] = [
  { href: '/dashboard/regras',        label: 'Regras',                   icon: '📋' },
  { href: '/dashboard/palpites',      label: 'Meus Palpites',            icon: '🎯' },
  { href: '/dashboard/finais',        label: 'Palpite Final',            icon: '🌟' },
  { href: '/dashboard',               label: 'Ranking Individual',       icon: '🏆' },
  { href: '/dashboard/departamentos', label: 'Ranking por Departamento', icon: '🏢' },
  { href: '/dashboard/mural',         label: 'Central da Torcida',      icon: '💬' },
  { href: '/admin/rh',                label: 'Dashboard RH',             icon: '📊', roles: ['rh', 'admin'] },
  { href: '/tv',                      label: 'TV Corporativa',           icon: '📺', roles: ['rh', 'admin'], newTab: true },
  { href: '/dashboard/perfil',        label: 'Meu Perfil',               icon: '👤' },
  { href: '/admin',                   label: 'Administração',            icon: '⚙️', roles: ['admin'] },
  { href: '/admin/usuarios',          label: 'Colaboradores',            icon: '👥', roles: ['admin'] },
  { href: '/admin/exportar',          label: 'Exportar',                 icon: '⬇️', roles: ['admin'] },
]

type Props = { role: Role }

export function SidebarNav({ role }: Props) {
  const pathname = usePathname()

  const visible = navItems.filter(item =>
    !item.roles || item.roles.includes(role),
  )

  return (
    <>
      {visible.map((item) => {
        const isActive = !item.newTab && (
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
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
