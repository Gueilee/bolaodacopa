'use client'

import { useEffect, useRef } from 'react'

const STORAGE_KEY = 'sidebar-scroll-pos'

export function SidebarScrollWrapper({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  // Restaura posição ao montar (troca de layout)
  useEffect(() => {
    if (!ref.current) return
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) ref.current.scrollTop = parseInt(saved, 10)
    } catch {}
  }, [])

  // Salva posição ao rolar
  useEffect(() => {
    const el = ref.current
    if (!el) return
    function save() {
      try { sessionStorage.setItem(STORAGE_KEY, String(el!.scrollTop)) } catch {}
    }
    el.addEventListener('scroll', save, { passive: true })
    return () => el.removeEventListener('scroll', save)
  }, [])

  return (
    <nav
      ref={ref as React.RefObject<HTMLElement>}
      className="flex-1 px-2 py-3 sidebar-scroll"
      style={{ minHeight: 0 }}
    >
      {children}
    </nav>
  )
}
