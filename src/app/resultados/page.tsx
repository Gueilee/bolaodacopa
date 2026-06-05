import { db }             from '@/lib/db'
import { matches }         from '@/db/schema'
import { eq, desc }        from 'drizzle-orm'
import { ResultadosView }  from '@/components/resultados-view'
import Image               from 'next/image'
import type { Metadata }   from 'next'

export const metadata: Metadata = { title: 'Histórico de Jogos | Bolão Copa 2026 — Vendemmia' }
export const revalidate = 60

export default async function ResultadosPublicPage() {
  const finishedMatches = await db.query.matches.findMany({
    where: eq(matches.status, 'finished'),
    orderBy: [desc(matches.matchDate)],
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f0ede8' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #0d0920 0%, #1a0d36 100%)',
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Image src="/logo2.png" alt="Bolão Vendemmia" width={90} height={50} style={{ objectFit: 'contain' }} />
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#01E18E',
            letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Copa do Mundo 2026
          </p>
          <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            Bolão Corporativo Vendemmia
          </p>
        </div>
      </header>

      {/* Conteúdo */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1a1625', margin: 0 }}>
            Histórico de Jogos
          </h1>
          <p style={{ fontSize: 13, color: '#8a8490', margin: '4px 0 0' }}>
            Todos os resultados da Copa do Mundo 2026 · gols, cartões e substituições
          </p>
        </div>
        <ResultadosView matches={finishedMatches} />
      </main>
    </div>
  )
}
