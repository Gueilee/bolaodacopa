import { getSession }     from '@/lib/session'
import { redirect }       from 'next/navigation'
import { getCopaLiveData } from '@/lib/copa-live-data'
import { CopaLiveView }   from '@/components/copa-live-view'

export const revalidate = 0
export const metadata   = { title: 'Copa ao Vivo | Bolão 2026' }

export default async function CopaAoVivoPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const data = await getCopaLiveData()

  return (
    <div className="max-w-4xl mx-auto animate-fade-in" style={{ paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1625', margin: 0, letterSpacing: '-0.02em' }}>
          ⚽ Copa ao Vivo
        </h1>
        <p style={{ fontSize: 13, color: '#8a8490', margin: '4px 0 0' }}>
          Dados em tempo real
        </p>
      </div>

      <CopaLiveView data={data} />
    </div>
  )
}
