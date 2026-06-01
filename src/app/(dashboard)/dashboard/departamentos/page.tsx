import { getSession }          from '@/lib/session'
import { getDeptRanking, getMyDeptStatus } from '@/lib/dept-ranking'
import { DeptPodium }           from '@/components/dept-podium'
import { DeptRankingTable }     from '@/components/dept-ranking-table'
import { MyDeptBanner }         from '@/components/my-dept-banner'
import { redirect }             from 'next/navigation'
import Link                     from 'next/link'

export const revalidate = 60
export const metadata   = { title: 'Ranking por Departamento | Bolão Copa 2026' }

function Skeleton({ h = 'h-32' }: { h?: string }) {
  return <div className={`${h} rounded-2xl bg-white/4 animate-pulse`} />
}

export default async function DepartamentosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [ranking, myStatus] = await Promise.all([
    getDeptRanking(),
    getMyDeptStatus(session.userId),
  ])

  const top3      = ranking.slice(0, 3)
  const hasAnyPts = ranking.some((d) => d.avgPoints > 0)

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-cream">Ranking por Departamento</h1>
          <p className="text-white/40 text-sm mt-1">
            Disputa coletiva · Copa do Mundo 2026 · Vendemmia
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-white/30 hover:text-brand-neon transition-colors self-center"
        >
          ← Ranking individual
        </Link>
      </div>

      {/* ── Meu departamento ── */}
      <MyDeptBanner status={myStatus} />

      {/* ── Stats globais ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Departamentos',  value: ranking.length },
          {
            label: 'Líder',
            value: ranking[0]?.department ?? '—',
            isText: true,
          },
          {
            label: 'Melhor média',
            value: ranking[0]?.avgPoints != null
              ? `${ranking[0].avgPoints.toFixed(1)} pts`
              : '0 pts',
            isText: true,
          },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`font-bold ${s.isText ? 'text-base' : 'text-2xl'} text-white/90 truncate`}>
              {s.value}
            </p>
            <p className="text-white/35 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Pódio ── */}
      {ranking.length > 0 && (
        <section className="card p-8 overflow-hidden relative">
          {/* Fundo decorativo */}
          <div className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(66,44,118,0.4) 0%, transparent 70%)' }}
          />

          <div className="relative z-10">
            <div className="text-center mb-8">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
                🏆 Top 3 Departamentos
              </p>
            </div>

            <DeptPodium top3={top3} />
          </div>
        </section>
      )}

      {/* ── Aviso se Copa ainda não começou ── */}
      {!hasAnyPts && ranking.length > 0 && (
        <div className="card p-5 border-brand-purple/20 bg-brand-purple/8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="text-white/70 font-medium text-sm">
                A Copa ainda não começou — todos os departamentos estão com 0 pts.
              </p>
              <p className="text-white/35 text-xs mt-0.5">
                O ranking será atualizado conforme os jogos forem encerrados e pontuados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabela completa ── */}
      {ranking.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 px-1">
            Classificação Completa ({ranking.length} departamentos)
          </h2>
          <DeptRankingTable
            entries={ranking}
            userDept={myStatus.department}
            startFromPos={0}
          />
        </section>
      ) : (
        <div className="card p-12 text-center space-y-3">
          <span className="text-4xl block">🏢</span>
          <p className="text-white/50 font-medium">Nenhum departamento configurado ainda</p>
          <p className="text-white/25 text-sm max-w-xs mx-auto">
            Peça ao administrador para atribuir departamentos aos colaboradores.
            O ranking coletivo ficará disponível automaticamente.
          </p>
        </div>
      )}

      {/* ── Explicação da mecânica ── */}
      {ranking.length > 0 && (
        <details className="card p-5 group">
          <summary className="flex items-center justify-between cursor-pointer text-sm text-white/50 hover:text-white/80 transition-colors select-none">
            <span>Como funciona o ranking por departamento?</span>
            <span className="text-white/25 group-open:rotate-180 transition-transform">▼</span>
          </summary>

          <div className="mt-4 space-y-3 text-white/40 text-sm leading-relaxed">
            <p>
              <strong className="text-white/60">Métrica:</strong> Média de pontos de todos os membros do departamento.
              Membros que não finalizaram os palpites contam com <strong className="text-white/60">0 pontos</strong> na média —
              isso incentiva 100% de participação da equipe.
            </p>
            <p>
              <strong className="text-white/60">Desempate:</strong> Taxa de participação (% que finalizou) e,
              em seguida, pontuação máxima individual do departamento.
            </p>
            <p>
              <strong className="text-white/60">Atualização:</strong> O ranking é recalculado automaticamente
              a cada jogo pontuado pelo administrador.
            </p>
            <p>
              <strong className="text-white/60">Estratégia:</strong> Para subir no ranking, sua equipe precisa
              tanto de alta participação (todo mundo finalizar os palpites) quanto de boas previsões.
            </p>
          </div>
        </details>
      )}
    </div>
  )
}
