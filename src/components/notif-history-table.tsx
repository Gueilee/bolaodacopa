import type { notificationsLog } from '@/db/schema'

type Entry = typeof notificationsLog.$inferSelect

type Props = { entries: Entry[] }

const TYPE_LABELS: Record<string, string> = {
  reminder_daily: '📅 Lembrete diário',
  reminder_match: '⏰ Lembrete jogo',
  result:         '⚽ Resultado',
  ranking_update: '📊 Ranking',
  custom:         '✍️ Custom',
}

export function NotifHistoryTable({ entries }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 text-[10px] font-semibold uppercase tracking-wider text-white/30">
            <th className="text-left px-4 py-3">Horário</th>
            <th className="text-left px-4 py-3">Tipo</th>
            <th className="text-left px-4 py-3 hidden sm:table-cell">Telefone</th>
            <th className="text-center px-4 py-3">Status</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">Erro</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {entries.map((e) => (
            <tr key={e.id} className="hover:bg-white/3 transition-colors">
              <td className="px-4 py-3 text-white/35 text-xs whitespace-nowrap">
                {new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit', month: '2-digit',
                  hour: '2-digit', minute: '2-digit',
                  timeZone: 'America/Sao_Paulo',
                }).format(e.sentAt)}
              </td>
              <td className="px-4 py-3 text-xs text-white/60">
                {TYPE_LABELS[e.type] ?? e.type}
              </td>
              <td className="px-4 py-3 text-xs text-white/35 font-mono hidden sm:table-cell">
                {e.phone.replace(/^55(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')}
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold ${
                  e.status === 'sent'
                    ? 'text-brand-neon bg-brand-neon/10 border-brand-neon/20'
                    : e.status === 'failed'
                    ? 'text-brand-pink bg-brand-pink/10 border-brand-pink/20'
                    : 'text-white/30 bg-white/5 border-white/10'
                }`}>
                  {e.status === 'sent' ? 'Enviado' : e.status === 'failed' ? 'Falha' : 'Ignorado'}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-brand-pink/60 truncate max-w-[200px] hidden md:table-cell">
                {e.error ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
