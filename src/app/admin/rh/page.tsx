import { Suspense }              from 'react'
import { getSession }             from '@/lib/session'
import { redirect }               from 'next/navigation'
import {
  getHrOverview,
  getDeptEngagement,
  getLockTimeline,
  getPointsDistribution,
  getPendingUsers,
  getTopPerformers,
  getAccessedUsers,
} from '@/lib/hr-analytics'
import { getUnitRanking }      from '@/lib/unit-ranking'

import { HrKpiCards }          from '@/components/hr/kpi-cards'
import { HrDeptChart }         from '@/components/hr/dept-chart'
import { HrUnitStats }         from '@/components/hr/unit-stats'
import { HrLockTimeline }      from '@/components/hr/lock-timeline'
import { HrPointsDistribution }from '@/components/hr/points-distribution'
import { HrPendingUsers }      from '@/components/hr/pending-users'
import { HrTopPerformers }     from '@/components/hr/top-performers'
import { HrExportButton }      from '@/components/hr/export-button'
import { HrAccessedUsers }     from '@/components/hr/accessed-users'

export const revalidate = 0
export const metadata   = { title: 'Dashboard RH | Bolão Copa 2026' }

// ─── Seção wrapper ────────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
  action,
}: {
  title:    string
  subtitle?: string
  children: React.ReactNode
  action?:  React.ReactNode
}) {
  return (
    <section className="card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest" style={{color:'#1a1625'}}>{title}</h2>
          {subtitle && <p className="text-xs mt-0.5" style={{color:'#8a8490'}}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ h = 'h-32' }: { h?: string }) {
  return <div className={`${h} rounded-xl animate-pulse`} style={{background:'#f5f2ef'}} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HrDashboardPage() {
  const session = await getSession()
  if (!session || (session.role !== 'admin' && session.role !== 'rh')) redirect('/dashboard')

  const [overview, depts, unitRanking, timeline, distribution, pending, topPerformers, accessedData] =
    await Promise.all([
      getHrOverview(),
      getDeptEngagement(),
      getUnitRanking(),
      getLockTimeline(),
      getPointsDistribution(),
      getPendingUsers(),
      getTopPerformers(10),
      getAccessedUsers(),
    ])

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" style={{ paddingBottom: 40 }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #150820 0%, #051a10 100%)',
        borderRadius: 24, padding: '24px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -10, width: 150, height: 150,
          background: 'radial-gradient(circle, rgba(1,225,142,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>📊</span>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#faf9f5', letterSpacing: '-0.02em' }}>
                Dashboard RH
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Engajamento corporativo · Copa do Mundo 2026 · Vendemmia
            </p>
          </div>
          <HrExportButton />
        </div>
      </div>

      {/* ── KPIs ── */}
      <Suspense fallback={<Skeleton h="h-28" />}>
        <HrKpiCards data={overview} />
      </Suspense>

      {/* ── Adesão: Quem já se cadastrou ── */}
      <Section
        title={`Adesão ao Sistema · ${accessedData.accessed.length} de ${accessedData.totalEligible} cadastrados`}
        subtitle="Colaboradores que criaram senha e acessaram o bolão pela primeira vez"
      >
        <HrAccessedUsers
          accessed={accessedData.accessed}
          totalEligible={accessedData.totalEligible}
        />
      </Section>

      {/* ── Engajamento por Departamento — full width para caber os nomes ── */}
      <Section
        title="Engajamento por Departamento"
        subtitle="Taxa de colaboradores que finalizaram os palpites"
      >
        <Suspense fallback={<Skeleton />}>
          <HrDeptChart data={depts} />
        </Suspense>
      </Section>

      {/* ── Ranking por Unidade ── */}
      <Section
        title="Ranking por Unidade"
        subtitle="Comparativo de adesão, pontuação média e líderes entre as 5 unidades"
      >
        <Suspense fallback={<Skeleton />}>
          <HrUnitStats data={unitRanking} />
        </Suspense>
      </Section>

      {/* ── Top Performers — 2 colunas lado a lado ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Top 10 Performers" subtitle="Por pontuação acumulada">
          <Suspense fallback={<Skeleton />}>
            <HrTopPerformers data={topPerformers.slice(0, 5)} />
          </Suspense>
        </Section>
        <Section title=" " subtitle=" ">
          <Suspense fallback={<Skeleton />}>
            <HrTopPerformers data={topPerformers.slice(5, 10)} />
          </Suspense>
        </Section>
      </div>

      {/* ── Linha 3: Timeline + Distribuição ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section
          title="Timeline de Adesão"
          subtitle="Quando os colaboradores finalizaram seus palpites"
        >
          <Suspense fallback={<Skeleton />}>
            <HrLockTimeline data={timeline} totalUsers={overview.totalUsers} />
          </Suspense>
        </Section>

        <Section
          title="Distribuição de Pontuação"
          subtitle="Como os pontos estão distribuídos entre os participantes"
        >
          <Suspense fallback={<Skeleton />}>
            <HrPointsDistribution data={distribution} />
          </Suspense>
        </Section>
      </div>

      {/* ── Pendentes ── */}
      <Section
        title={`Sem Registro Finalizado (${pending.length})`}
        subtitle="Colaboradores que ainda não finalizaram os palpites"
      >
        <Suspense fallback={<Skeleton />}>
          <HrPendingUsers users={pending} />
        </Suspense>
      </Section>

      {/* ── Nota de rodapé ── */}
      <p className="text-xs text-center pb-4" style={{color:'#8a8490'}}>
        Dados atualizados em tempo real · Acesso restrito a administradores · Vendemmia Comércio Internacional
      </p>
    </div>
  )
}
