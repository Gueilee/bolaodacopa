'use server'

import { db } from '@/lib/db'
import { users, userTokens } from '@/db/schema'
import { eq, isNull, and, gt } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { sendInviteEmail } from '@/lib/email'
import * as bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

const INVITE_TTL_DAYS = 7

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400 * 1000)
}

async function assertAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Acesso negado.')
  return session
}

// Gera token único para um usuário (invalida tokens antigos do mesmo tipo)
async function createToken(userId: string, type: 'invite' | 'password_reset'): Promise<string> {
  const token     = crypto.randomUUID()
  const expiresAt = addDays(new Date(), INVITE_TTL_DAYS)

  await db.insert(userTokens).values({ userId, token, type, expiresAt })
  return token
}

// ─── Enviar convite para um único usuário ─────────────────────────────────────

export async function sendInvite(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  await assertAdmin()

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) return { success: false, error: 'Usuário não encontrado.' }

  const token = await createToken(userId, 'invite')
  const result = await sendInviteEmail(user.email, user.name, token)

  revalidatePath('/admin/convites')
  return result
}

// ─── Enviar convites em massa (somente quem ainda não acessou) ────────────────

export async function sendBulkInvites(): Promise<{
  success: boolean
  sent: number
  failed: number
  skipped: number
  errors: string[]
}> {
  await assertAdmin()

  // Todos os usuários ativos que ainda não fizeram primeiro acesso
  const pending = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(and(eq(users.isActive, true), eq(users.role, 'user'), isNull(users.firstAccessAt)))

  let sent = 0, failed = 0, skipped = 0
  const errors: string[] = []

  for (const user of pending) {
    // Verificar se já tem token válido não expirado não usado
    const existing = await db.query.userTokens.findFirst({
      where: and(
        eq(userTokens.userId, user.id),
        eq(userTokens.type, 'invite'),
        isNull(userTokens.usedAt),
        gt(userTokens.expiresAt, new Date()),
      ),
    })

    // Se já tem token válido enviado há menos de 1h, pula
    if (existing) {
      const oneHourAgo = new Date(Date.now() - 3600 * 1000)
      if (existing.createdAt > oneHourAgo) { skipped++; continue }
    }

    const token  = await createToken(user.id, 'invite')
    const result = await sendInviteEmail(user.email, user.name, token)

    if (result.success) {
      sent++
    } else {
      failed++
      errors.push(`${user.email}: ${result.error}`)
    }

    // Pequena pausa para não sobrecarregar a API do Resend
    await new Promise(r => setTimeout(r, 50))
  }

  revalidatePath('/admin/convites')
  return { success: true, sent, failed, skipped, errors }
}

// ─── Validar token e definir senha (chamado na página de primeiro acesso) ──────

export async function redeemInviteToken(
  token:    string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  if (!password || password.length < 8) {
    return { success: false, error: 'A senha deve ter pelo menos 8 caracteres.' }
  }

  const record = await db.query.userTokens.findFirst({
    where: eq(userTokens.token, token),
  })

  if (!record)                        return { success: false, error: 'Link inválido.' }
  if (record.usedAt)                  return { success: false, error: 'Este link já foi utilizado.' }
  if (record.expiresAt < new Date())  return { success: false, error: 'Este link expirou. Solicite um novo convite.' }
  if (record.type !== 'invite' && record.type !== 'password_reset') {
    return { success: false, error: 'Tipo de token inválido.' }
  }

  const pwdHash = await bcrypt.hash(password, 10)

  await db
    .update(users)
    .set({
      passwordHash:  pwdHash,
      firstAccessAt: new Date(),
      updatedAt:     new Date(),
    })
    .where(eq(users.id, record.userId))

  await db
    .update(userTokens)
    .set({ usedAt: new Date() })
    .where(eq(userTokens.id, record.id))

  return { success: true }
}

// getUserByToken movido para src/lib/token-queries.ts (sem 'use server')
