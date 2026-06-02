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
} from '@/lib/hr-analytics'

import { HrKpiCards }          from '@/components/hr/kpi-cards'
import { HrDeptChart }         from '@/components/hr/dept-chart'
import { HrLockTimeline }      from '@/components/hr/lock-timeline'
import { HrPointsDistribution }from '@/components/hr/points-distribution'
import { HrPendingUsers }      from '@/components/hr/pending-users'
import { HrTopPerformers }     from '@/components/hr/top-performers'
import { HrExportButton }      from '@/components/hr/export-button'

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
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const [overview, depts, timeline, distribution, pending, topPerformers] =
    await Promise.all([
      getHrOverview(),
      getDeptEngagement(),
      getLockTimeline(),
      getPointsDistribution(),
      getPendingUsers(),
      getTopPerformers(10),
    ])

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{color:'#1a1625'}}>Dashboard RH</h1>
          <p className="text-sm mt-1" style={{color:'#8a8490'}}>
            Engajamento corporativo · Copa do Mundo 2026 · Vendemmia
          </p>
        </div>
        <HrExportButton />
      </div>

      {/* ── KPIs ── */}
      <Suspense fallback={<Skeleton h="h-28" />}>
        <HrKpiCards data={overview} />
      </Suspense>

      {/* ── Linha 2: Departamentos + Top Performers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Section
            title="Engajamento por Departamento"
            subtitle="Taxa de colaboradores que finalizaram os palpites"
          >
            <Suspense fallback={<Skeleton />}>
              <HrDeptChart data={depts} />
            </Suspense>
          </Section>
        </div>

        <div>
          <Section
            title="Top 10 Performers"
            subtitle="Por pontuação acumulada"
          >
            <Suspense fallback={<Skeleton />}>
              <HrTopPerformers data={topPerformers} />
            </Suspense>
          </Section>
        </div>
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
