'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ClipboardList, Target, Star, Radio, MapPin, Building2,
  Trophy, MessageCircle, User, LayoutDashboard, Monitor,
  Settings, Users, Mail, Search, Download, Award, ExternalLink, History,
  type LucideIcon,
} from 'lucide-react'

type Role = 'admin' | 'rh' | 'user'

type NavItem = {
  href:     string
  label:    string
  icon:     LucideIcon
  roles?:   Role[]
  newTab?:  boolean
  section?: string
}

const navItems: NavItem[] = [
  { href: '/dashboard/regras',        label: 'Regras',              icon: ClipboardList,   section: 'Bolão' },
  { href: '/dashboard/palpites',      label: 'Meus Palpites',       icon: Target },
  { href: '/dashboard/finais',        label: 'Palpite Final',       icon: Star },
  { href: '/dashboard/copa-ao-vivo',  label: 'Copa ao Vivo',        icon: Radio },
  { href: '/resultados',              label: 'Histórico de Jogos',  icon: History, newTab: true },
  { href: '/dashboard/unidades',      label: 'Por Unidade',         icon: MapPin,          section: 'Ranking' },
  { href: '/dashboard/departamentos', label: 'Por Departamento',    icon: Building2 },
  { href: '/dashboard',               label: 'Individual',          icon: Trophy },
  { href: '/dashboard/mural',         label: 'Central da Torcida', icon: MessageCircle,   section: 'Comunidade' },
  { href: '/dashboard/perfil',        label: 'Meu Perfil',          icon: User },
  { href: '/admin/rh',                label: 'Dashboard RH',        icon: LayoutDashboard, roles: ['rh', 'admin'], section: 'Gestão' },
  { href: '/tv',                      label: 'TV Corporativa',      icon: Monitor,         roles: ['rh', 'admin'], newTab: true },
  { href: '/admin',                   label: 'Painel Admin',        icon: Settings,        roles: ['admin'] },
  { href: '/admin/usuarios',          label: 'Colaboradores',       icon: Users,           roles: ['admin'] },
  { href: '/admin/convites',          label: 'Convites',            icon: Mail,            roles: ['admin'] },
  { href: '/admin/auditoria',         label: 'Auditoria',           icon: Search,          roles: ['rh', 'admin'] },
  { href: '/admin/exportar',          label: 'Exportar',            icon: Download,        roles: ['rh', 'admin'] },
  { href: '/admin/artilheiros',       label: 'Artilheiros',         icon: Award,           roles: ['admin'] },
]

type Props = { role: Role }

export function SidebarNav({ role }: Props) {
  const pathname = usePathname()
  const visible  = navItems.filter(item => !item.roles || item.roles.includes(role))

  let lastSection = ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {visible.map((item) => {
        const exactMatch = item.href === '/dashboard' || item.href === '/admin'
        const isActive = !item.newTab && (
          exactMatch
            ? pathname === item.href
            : pathname.startsWith(item.href)
        )

        const showSection = item.section && item.section !== lastSection
        if (item.section) lastSection = item.section

        const Icon = item.icon

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
              <Icon
                size={15}
                strokeWidth={isActive ? 2.5 : 2}
                style={{ flexShrink: 0, opacity: isActive ? 1 : 0.75 }}
              />
              <span style={{ flex: 1, fontSize: 13 }}>{item.label}</span>
              {item.newTab && (
                <ExternalLink size={10} style={{ opacity: 0.3, flexShrink: 0 }} />
              )}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
