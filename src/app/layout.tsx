import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bolão Copa 2026 | Vendemmia',
  description: 'Bolão corporativo da Copa do Mundo 2026 — Vendemmia Comércio Internacional',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased">
        {children}
        {/* API-Sports Widgets — carregado globalmente, lazy, não bloqueia renderização */}
        <Script
          src="https://widgets.api-sports.io/3.1.0/widgets.js"
          strategy="lazyOnload"
          type="module"
        />
      </body>
    </html>
  )
}
