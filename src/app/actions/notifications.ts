'use server'

import { db }              from '@/lib/db'
import { users }           from '@/db/schema'
import { eq, and, isNotNull } from 'drizzle-orm'
import { getSession }      from '@/lib/session'
import { revalidatePath }  from 'next/cache'
import {
  sendDailyReminders,
  sendCustomMessage,
  sendTestMessage,
} from '@/lib/notifications'
import { isValidBrPhone, normalizePhone } from '@/lib/whatsapp'

// ─── Admin: enviar lembrete em massa ─────────────────────────────────────────

export async function sendBulkReminderAction() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Acesso negado.' }
  }

  const result = await sendDailyReminders()
  revalidatePath('/admin/notificacoes')
  return { success: true, result }
}

// ─── Admin: mensagem personalizada ───────────────────────────────────────────

export async function sendCustomMessageAction(
  target:  'all_optin' | 'pending_only' | string[],
  message: string,
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Acesso negado.' }
  }

  if (!message.trim()) return { success: false, error: 'Mensagem não pode ser vazia.' }

  let userIds: string[]

  if (Array.isArray(target)) {
    userIds = target
  } else if (target === 'all_optin') {
    const allUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.isActive, true), eq(users.whatsappOptIn, true), isNotNull(users.phone)))
    userIds = allUsers.map((u) => u.id)
  } else {
    // pending_only — sem palpites finalizados
    const pendingUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.isActive, true),
        eq(users.isPredictionLocked, false),
        eq(users.whatsappOptIn, true),
        isNotNull(users.phone),
      ))
    userIds = pendingUsers.map((u) => u.id)
  }

  const result = await sendCustomMessage(userIds, message)
  revalidatePath('/admin/notificacoes')
  return { success: true, result }
}

// ─── Admin: mensagem de teste ─────────────────────────────────────────────────

export async function sendTestMessageAction(phone: string) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Acesso negado.' }
  }

  if (!isValidBrPhone(phone)) {
    return { success: false, error: 'Número inválido. Use formato (11) 9 9999-9999.' }
  }

  const result = await sendTestMessage(normalizePhone(phone), session.name)
  return result
}

// ─── Usuário: salvar telefone + opt-in ────────────────────────────────────────

export async function savePhoneAction(
  phone:     string,
  optIn:     boolean,
) {
  const session = await getSession()
  if (!session) return { success: false, error: 'Não autenticado.' }

  if (phone && !isValidBrPhone(phone)) {
    return { success: false, error: 'Número inválido. Ex: (11) 9 9999-9999.' }
  }

  await db
    .update(users)
    .set({
      phone:         phone ? normalizePhone(phone) : null,
      whatsappOptIn: optIn && Boolean(phone),
      updatedAt:     new Date(),
    })
    .where(eq(users.id, session.userId))

  revalidatePath('/dashboard/perfil')
  return { success: true }
}

// ─── Admin: e-mail de resultado de teste ─────────────────────────────────────

export async function sendTestResultEmailAction(
  to: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { success: false, error: 'Acesso negado.' }

  const { sendDirectResultEmail } = await import('@/lib/email')
  return sendDirectResultEmail({
    to,
    name:      to.split('@')[0],
    homeTeam:  'Brasil',
    awayTeam:  'Argentina',
    homeScore: 3,
    awayScore: 1,
    predHome:  2,
    predAway:  1,
    points:    7,
    total:     142,
  })
}

// ─── Usuário: ativar/desativar e-mail ─────────────────────────────────────────

export async function saveEmailOptInAction(
  optIn: boolean,
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Não autenticado.' }

  await db
    .update(users)
    .set({ emailOptIn: optIn, updatedAt: new Date() })
    .where(eq(users.id, session.userId))

  revalidatePath('/dashboard/perfil')
  return { success: true }
}
