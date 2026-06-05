/**
 * Garante que os 3 usuários do RH estejam ativos no banco.
 * Uso: pnpm tsx src/db/add-rh-users.ts
 */

import * as bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

const DEFAULT_PWD = 'Copa@2026'

const RH_USERS = [
  { id: 'a08a7515-a85b-4e49-8676-f246a957b2b9', name: 'José da Costa Ferreira Netto', email: 'jnetto@vendemmia.com.br' },
  { id: 'ebdf2705-d381-4bf1-a4a3-0cf1aeb1bd3c', name: 'Ednalva Aparecida Matheus',     email: 'ematheus@vendemmia.com.br' },
  { id: null,                                   name: 'Danielle Moraes',                email: 'dmoraes@vendemmia.com.br' },
]

async function main() {
  const hash = await bcrypt.hash(DEFAULT_PWD, 10)

  for (const u of RH_USERS) {
    const existing = await db.select().from(users).where(eq(users.email, u.email))

    if (existing.length > 0) {
      await db.update(users)
        .set({ isActive: true })
        .where(eq(users.email, u.email))
      console.log(`✓ Reativado: ${u.name} (${u.email})`)
    } else {
      await db.insert(users).values({
        id:           u.id ?? randomUUID(),
        name:         u.name,
        email:        u.email,
        passwordHash: hash,
        role:         'user',
        department:   'RH',
        isActive:     true,
        totalPoints:  0,
      })
      console.log(`✓ Inserido:  ${u.name} (${u.email})`)
    }
  }

  console.log('\nConcluído.')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
