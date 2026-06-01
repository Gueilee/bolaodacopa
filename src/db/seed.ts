/**
 * Seed: cria o primeiro usuário admin.
 * Uso: pnpm db:seed
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
import { db } from '../lib/db'
import { users } from './schema'
import bcrypt from 'bcryptjs'

async function main() {
  const email    = process.env.ADMIN_EMAIL    ?? 'admin@vendemmia.com.br'
  const password = process.env.ADMIN_PASSWORD ?? 'Vendemmia@2026'
  const name     = process.env.ADMIN_NAME     ?? 'Administrador'

  const passwordHash = await bcrypt.hash(password, 12)

  await db
    .insert(users)
    .values({ name, email: email.toLowerCase(), passwordHash, role: 'admin' })
    .onConflictDoNothing()

  console.log(`✅  Admin criado: ${email}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
