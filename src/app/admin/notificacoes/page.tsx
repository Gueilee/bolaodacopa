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
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in" style={{ paddingBottom: 40 }}>

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d0920 0%, #1a0d36 60%, #0a1820 100%)',
        borderRadius: 24, padding: '24px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140,
          background: 'radial-gradient(circle, rgba(37,211,102,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28 }}>📱</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#faf9f5', letterSpacing: '-0.02em' }}>
              Notificações WhatsApp
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Lembretes automáticos via Z-API · Avisos para os colaboradores do bolão
            </p>
          </div>
        </div>
      </div>

      <NotificationsAdminPanel status={status} stats={stats} />

      {history.length > 0 && (
        <section className="space-y-3">
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
            color: '#8a8490', margin: '0 0 8px 4px' }}>
            Histórico recente ({history.length})
          </p>
          <NotifHistoryTable entries={history} />
        </section>
      )}
    </div>
  )
}
