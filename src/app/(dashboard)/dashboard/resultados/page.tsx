import { getSession }     from '@/lib/session'
import { redirect }        from 'next/navigation'
import { db }              from '@/lib/db'
import { matches }         from '@/db/schema'
import { eq, desc }        from 'drizzle-orm'
import { ResultadosView }  from '@/components/resultados-view'
import type { Metadata }   from 'next'

export const metadata: Metadata = { title: 'Histórico de Jogos | Bolão Copa 2026' }
export const revalidate = 60

export default async function ResultadosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const finishedMatches = await db.query.matches.findMany({
    where: eq(matches.status, 'finished'),
    orderBy: [desc(matches.matchDate)],
  })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1a1625', margin: 0 }}>
          Histórico de Jogos
        </h1>
        <p style={{ fontSize: 13, color: '#8a8490', margin: '4px 0 0' }}>
          Todos os resultados da Copa do Mundo 2026 com gols, cartões e substituições
        </p>
      </div>
      <ResultadosView matches={finishedMatches} />
    </div>
  )
}
