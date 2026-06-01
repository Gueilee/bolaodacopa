/**
 * Serviço de notificações WhatsApp — orquestração de alto nível.
 *
 * Este módulo é o único ponto de entrada para enviar mensagens.
 * Todas as funções são fire-and-forget friendly (não lançam exceções).
 */

import { db } from '@/lib/db'
import { users, matches, predictions, notificationsLog } from '@/db/schema'
import { eq, and, isNotNull, desc, count, gte } from 'drizzle-orm'
import { getWhatsAppClient, isWhatsAppConfigured } from '@/lib/whatsapp'
import {
  templateReminderDaily,
  templateReminderMatch,
  templateMatchResult,
  templateCustom,
  templateTest,
} from '@/lib/whatsapp/templates'
import { getRanking }     from '@/lib/queries'
import { getDeptRanking } from '@/lib/dept-ranking'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type NotifResult = {
  sent:    number
  skipped: number   // sem telefone ou sem opt-in
  failed:  number
  errors:  string[]
}

// ─── Helper: gravar log ───────────────────────────────────────────────────────

async function logNotification(entry: {
  userId?:  string
  matchId?: string
  type:     typeof notificationsLog.$inferInsert['type']
  phone:    string
  message:  string
  status:   'sent' | 'failed' | 'skipped'
  error?:   string
}) {
  try {
    await db.insert(notificationsLog).values({
      userId:  entry.userId,
      matchId: entry.matchId,
      type:    entry.type,
      phone:   entry.phone,
      message: entry.message,
      status:  entry.status,
      error:   entry.error,
      sentAt:  new Date(),
    })
  } catch {
    // Log nunca deve quebrar o fluxo principal
  }
}

// ─── Deduplicação: evita envio duplicado dentro de X horas ───────────────────

async function alreadySentToday(
  userId:  string,
  type:    typeof notificationsLog.$inferInsert['type'],
  matchId?: string,
): Promise<boolean> {
  const since = new Date(Date.now() - 20 * 60 * 60 * 1000) // 20h
  const rows  = await db
    .select({ count: count() })
    .from(notificationsLog)
    .where(
      and(
        eq(notificationsLog.userId, userId),
        eq(notificationsLog.type, type),
        gte(notificationsLog.sentAt, since),
        eq(notificationsLog.status, 'sent'),
        matchId ? eq(notificationsLog.matchId, matchId) : undefined,
      ),
    )
  return Number(rows[0]?.count) > 0
}

// ─── 1. Lembrete diário (bulk) ────────────────────────────────────────────────

/**
 * Envia lembrete para todos os usuários ativos com opt-in
 * que ainda NÃO finalizaram os palpites.
 */
export async function sendDailyReminders(): Promise<NotifResult> {
  if (!isWhatsAppConfigured()) {
    return { sent: 0, skipped: 0, failed: 0, errors: ['WhatsApp não configurado.'] }
  }

  const client = getWhatsAppClient()!

  const [matchTotal] = await db
    .select({ count: count() })
    .from(matches)

  const totalMatches = Number(matchTotal?.count ?? 104)

  const pending = await db.query.users.findMany({
    where: and(
      eq(users.isActive, true),
      eq(users.isPredictionLocked, false),
      eq(users.whatsappOptIn, true),
      isNotNull(users.phone),
    ),
  })

  const result: NotifResult = { sent: 0, skipped: 0, failed: 0, errors: [] }

  for (const user of pending) {
    if (!user.phone) { result.skipped++; continue }

    if (await alreadySentToday(user.id, 'reminder_daily')) {
      result.skipped++
      continue
    }

    const betCount = await db
      .select({ c: count() })
      .from(predictions)
      .where(eq(predictions.userId, user.id))
      .then((r) => Number(r[0]?.c ?? 0))

    const message = templateReminderDaily({ name: user.name, betCount, totalMatches })
    const res     = await client.sendText(user.phone, message)

    await logNotification({
      userId:  user.id,
      type:    'reminder_daily',
      phone:   user.phone,
      message,
      status:  res.success ? 'sent' : 'failed',
      error:   res.error,
    })

    if (res.success) result.sent++
    else { result.failed++; result.errors.push(`${user.name}: ${res.error}`) }
  }

  return result
}

// ─── 2. Resultado da partida (por usuário) ────────────────────────────────────

export type UserMatchResult = {
  userId:     string
  points:     number
  breakdown:  string
  predHome:   number
  predAway:   number
}

/**
 * Envia a notificação de resultado para todos os usuários com palpite neste jogo.
 * Chamado após scoreMatchInternal concluir.
 */
export async function sendMatchResultNotifications(
  matchId:     string,
  homeScore:   number,
  awayScore:   number,
  userResults: UserMatchResult[],
): Promise<NotifResult> {
  if (!isWhatsAppConfigured()) return { sent: 0, skipped: 0, failed: 0, errors: [] }

  const client = getWhatsAppClient()!

  const match = await db.query.matches.findFirst({ where: eq(matches.id, matchId) })
  if (!match) return { sent: 0, skipped: 0, failed: 0, errors: ['Partida não encontrada.'] }

  // Busca ranking uma vez para todos
  const ranking    = await getRanking()
  const deptRanking = await getDeptRanking()

  const result: NotifResult = { sent: 0, skipped: 0, failed: 0, errors: [] }

  for (const ur of userResults) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, ur.userId),
      columns: { id: true, name: true, phone: true, whatsappOptIn: true, department: true, totalPoints: true },
    })

    if (!user?.phone || !user.whatsappOptIn) { result.skipped++; continue }
    if (await alreadySentToday(ur.userId, 'result', matchId)) { result.skipped++; continue }

    const rankEntry  = ranking.find((r) => r.id === ur.userId)
    const deptEntry  = user.department
      ? deptRanking.find((d) => d.department === user.department)
      : null

    const message = templateMatchResult({
      name:        user.name,
      homeTeam:    match.homeTeam,
      awayTeam:    match.awayTeam,
      homeScore,
      awayScore,
      predHome:    ur.predHome,
      predAway:    ur.predAway,
      points:      ur.points,
      breakdown:   ur.breakdown,
      ranking:     rankEntry?.position ?? 0,
      totalPoints: user.totalPoints,
      deptName:    user.department ?? undefined,
      deptRanking: deptEntry?.position ?? undefined,
    })

    const res = await client.sendText(user.phone, message)

    await logNotification({
      userId:  user.id,
      matchId: match.id,
      type:    'result',
      phone:   user.phone,
      message,
      status:  res.success ? 'sent' : 'failed',
      error:   res.error,
    })

    if (res.success) result.sent++
    else { result.failed++; result.errors.push(`${user.name}: ${res.error}`) }
  }

  return result
}

// ─── 3. Mensagem custom (admin) ───────────────────────────────────────────────

export async function sendCustomMessage(
  userIds: string[],
  message: string,
): Promise<NotifResult> {
  if (!isWhatsAppConfigured()) {
    return { sent: 0, skipped: 0, failed: 0, errors: ['WhatsApp não configurado.'] }
  }

  const client = getWhatsAppClient()!
  const result: NotifResult = { sent: 0, skipped: 0, failed: 0, errors: [] }

  for (const userId of userIds) {
    const user = await db.query.users.findFirst({
      where: and(eq(users.id, userId), eq(users.isActive, true)),
      columns: { id: true, name: true, phone: true, whatsappOptIn: true },
    })

    if (!user?.phone || !user.whatsappOptIn) { result.skipped++; continue }

    const msg = templateCustom({ name: user.name, message })
    const res = await client.sendText(user.phone, msg)

    await logNotification({
      userId:  user.id,
      type:    'custom',
      phone:   user.phone,
      message: msg,
      status:  res.success ? 'sent' : 'failed',
      error:   res.error,
    })

    if (res.success) result.sent++
    else { result.failed++; result.errors.push(`${user.name}: ${res.error}`) }
  }

  return result
}

// ─── 4. Teste de conexão ──────────────────────────────────────────────────────

export async function sendTestMessage(
  phone:      string,
  adminName:  string,
): Promise<{ success: boolean; error?: string }> {
  const client = getWhatsAppClient()
  if (!client) return { success: false, error: 'WhatsApp não configurado.' }

  const message = templateTest(adminName)
  return client.sendText(phone, message)
}

// ─── 5. Histórico recente ─────────────────────────────────────────────────────

export async function getRecentNotifications(limit = 50) {
  return db.query.notificationsLog.findMany({
    orderBy: [desc(notificationsLog.sentAt)],
    limit,
    with: {
      // Se quiser joins futuros pode expandir aqui
    },
  })
}

// ─── 6. Estatísticas de notificações ─────────────────────────────────────────

export async function getNotificationStats() {
  const [totalOptIn] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.isActive, true), eq(users.whatsappOptIn, true)))

  const [withPhone] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.isActive, true), isNotNull(users.phone)))

  const [sentToday] = await db
    .select({ count: count() })
    .from(notificationsLog)
    .where(
      and(
        eq(notificationsLog.status, 'sent'),
        gte(notificationsLog.sentAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
      ),
    )

  return {
    optedIn:   Number(totalOptIn?.count ?? 0),
    withPhone: Number(withPhone?.count ?? 0),
    sentToday: Number(sentToday?.count ?? 0),
  }
}
