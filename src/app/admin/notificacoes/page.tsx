import { getSession }              from '@/lib/session'
import { redirect }                from 'next/navigation'
import { getWhatsAppClient,
         isWhatsAppConfigured }    from '@/lib/whatsapp'
import { getNotificationStats,
         getRecentNotifications }  from '@/lib/notifications'
import { NotificationsAdminPanel } from '@/components/notifications-admin-panel'
import { NotifHistoryTable }       from '@/components/notif-history-table'

export const revalidate = 0
export const metadata   = { title: 'Notificações WhatsApp | Bolão Copa 2026' }

export default async function NotificacoesPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/dashboard')

  const configured = isWhatsAppConfigured()

  // Status da conexão Z-API
  let status = null
  if (configured) {
    try {
      const client = getWhatsAppClient()!
      status = await client.getStatus()
    } catch {
      status = { connected: false, smartphoneConnected: false, error: 'Erro ao verificar status' }
    }
  }

  const [stats, history] = await Promise.all([
    getNotificationStats(),
    getRecentNotifications(30),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">

      <div>
        <h1 className="text-2xl font-bold text-brand-cream">Notificações WhatsApp</h1>
        <p className="text-white/40 text-sm mt-1">
          Lembretes automáticos e mensagens para os colaboradores
        </p>
      </div>

      <NotificationsAdminPanel status={status} stats={stats} />

      {/* ── Histórico ── */}
      {history.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">
            Histórico recente ({history.length})
          </h2>
          <NotifHistoryTable entries={history} />
        </section>
      )}
    </div>
  )
}
