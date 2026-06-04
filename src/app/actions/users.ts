'use server'

import { db }          from '@/lib/db'
import { users }       from '@/db/schema'
import { eq }          from 'drizzle-orm'
import { getSession }  from '@/lib/session'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

// ─── Atualizar departamento ────────────────────────────────────────────────────

export async function updateUserDepartment(
  userId:     string,
  department: string | null,
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { success: false, error: 'Acesso negado.' }

  await db
    .update(users)
    .set({ department: department || null, updatedAt: new Date() })
    .where(eq(users.id, userId))

  revalidatePath('/admin/usuarios')
  revalidatePath('/dashboard/departamentos')
  revalidatePath('/dashboard')
  return { success: true }
}

// ─── Criar usuário (admin) ────────────────────────────────────────────────────

export async function createUser(data: {
  name:       string
  email:      string
  password:   string
  role:       'admin' | 'rh' | 'user'
  department: string | null
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { success: false, error: 'Acesso negado.' }

  const exists = await db.query.users.findFirst({
    where: eq(users.email, data.email.toLowerCase().trim()),
  })
  if (exists) return { success: false, error: 'E-mail já cadastrado.' }

  const passwordHash = await bcrypt.hash(data.password, 12)

  await db.insert(users).values({
    name:         data.name.trim(),
    email:        data.email.toLowerCase().trim(),
    passwordHash,
    role:         data.role,
    department:   data.department || null,
  })

  revalidatePath('/admin/usuarios')
  revalidatePath('/dashboard/departamentos')
  return { success: true }
}

// ─── Atualizar perfil (role) ──────────────────────────────────────────────────

export async function updateUserRole(
  userId: string,
  role:   'admin' | 'rh' | 'user',
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { success: false, error: 'Acesso negado.' }

  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId))

  revalidatePath('/admin/usuarios')
  revalidatePath('/dashboard')
  return { success: true }
}

// ─── Ativar / desativar usuário ───────────────────────────────────────────────

export async function toggleUserActive(
  userId:   string,
  isActive: boolean,
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { success: false, error: 'Acesso negado.' }

  await db
    .update(users)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(users.id, userId))

  revalidatePath('/admin/usuarios')
  return { success: true }
}
