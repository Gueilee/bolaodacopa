import { getSession }       from '@/lib/session'
import { redirect }          from 'next/navigation'
import { getFullReportData } from '@/lib/report-data'
import { ExportCenter }      from '@/components/export-center'

export const revalidate = 0
export const metadata   = { title: 'Exportar Relatórios | Bolão Copa 2026' }

export default async function ExportarPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const data = await getFullReportData()

  const stats = {
    totalUsers:   data.ranking.length,
    lockedUsers:  data.ranking.filter((u) => u.isPredictionLocked).length,
    totalDepts:   data.deptRanking.length,
    pendingCount: data.pendingUsers.length,
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-brand-cream">Exportar Relatórios</h1>
        <p className="text-white/40 text-sm mt-1">
          PDF com branding Vendemmia ou CSV para Excel · dados em tempo real
        </p>
      </div>

      {/* ── Preview dos dados atuais ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Participantes',  value: stats.totalUsers   },
          { label: 'Finalizados',    value: stats.lockedUsers  },
          { label: 'Departamentos',  value: stats.totalDepts   },
          { label: 'Pendentes',      value: stats.pendingCount },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-black text-brand-cream tabular-nums">{s.value}</p>
            <p className="text-white/35 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Centro de exportação ── */}
      <ExportCenter stats={stats} />

      {/* ── Notas ── */}
      <div className="card p-5 space-y-2 border-white/8">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
          Notas sobre os arquivos
        </p>
        <ul className="text-white/35 text-xs space-y-1.5 leading-relaxed">
          <li>📄 O PDF é gerado no servidor e reflete os dados no momento do clique.</li>
          <li>📊 Os CSVs usam ponto-e-vírgula <code className="text-brand-neon/60">;</code> como separador — compatível com Excel pt-BR.</li>
          <li>🔤 Encoding UTF-8 com BOM — acentos abrem corretamente no Excel sem conversão.</li>
          <li>🔒 Todos os downloads são restritos a administradores.</li>
          <li>📅 O nome do arquivo inclui a data de geração para controle de versão.</li>
        </ul>
      </div>
    </div>
  )
}
