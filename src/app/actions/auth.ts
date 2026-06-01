'use server'

import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function loginAction(
  email: string,
  password: string,
): Promise<{ error?: string } | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  })

  const passwordValid =
    user && (await bcrypt.compare(password, user.passwordHash))

  // Constant-time rejection prevents user enumeration
  if (!user || !passwordValid || !user.isActive) {
    return { error: 'E-mail ou senha inválidos.' }
  }

  const token = await new SignJWT({
    userId: user.id,
    name:   user.name,
    email:  user.email,
    role:   user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   SESSION_MAX_AGE,
    path:     '/',
  })

  return null // success — caller redirects
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
