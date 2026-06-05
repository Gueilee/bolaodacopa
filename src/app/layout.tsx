import type { Metadata } from 'next'
import { Inter, Anton, Barlow_Condensed } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
})

const barlow = Barlow_Condensed({
  weight: ['500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-barlow',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bolão Copa 2026 | Vendemmia',
  description: 'Bolão corporativo da Copa do Mundo 2026 — Vendemmia Comércio Internacional',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${anton.variable} ${barlow.variable}`}>
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
