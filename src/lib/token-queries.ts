// Consultas de leitura para tokens de convite — sem 'use server', sem Resend.
// Importado diretamente por Server Components (não é uma Server Action).

import { db } from '@/lib/db'
import { users, userTokens } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function getUserByToken(token: string) {
  const record = await db.query.userTokens.findFirst({
    where: eq(userTokens.token, token),
  })
  if (!record) return null

  const user = await db.query.users.findFirst({
    where: eq(users.id, record.userId),
    columns: { id: true, name: true, email: true, firstAccessAt: true },
  })

  return {
    user,
    expired: record.expiresAt < new Date(),
    used:    !!record.usedAt,
  }
}
