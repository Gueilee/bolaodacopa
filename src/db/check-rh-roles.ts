import { config } from 'dotenv'
config({ path: '.env.local' })
import { db } from '../lib/db'
import { users } from './schema'
import { inArray, eq } from 'drizzle-orm'

const RH_EMAILS = ['ematheus@vendemmia.com.br', 'dmoraes@vendemmia.com.br', 'jnetto@vendemmia.com.br']

async function main() {
  const rhUsers = await db
    .select({ name: users.name, email: users.email, role: users.role, isActive: users.isActive })
    .from(users)
    .where(inArray(users.email, RH_EMAILS))

  console.log('\n── Usuários RH esperados ──────────────────────────')
  for (const email of RH_EMAILS) {
    const u = rhUsers.find(r => r.email === email)
    if (!u) {
      console.log(`  ❌ NÃO ENCONTRADO: ${email}`)
    } else {
      const roleOk   = u.role === 'rh'
      const activeOk = u.isActive
      console.log(`  ${roleOk && activeOk ? '✅' : '⚠️ '} ${u.name} | role=${u.role} | ativo=${u.isActive} | ${email}`)
    }
  }

  const [allUsers] = await db
    .select({ count: db.$count(users) })
    .from(users)
    .where(eq(users.isActive, true))

  const wrongRole = await db
    .select({ name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(inArray(users.email, RH_EMAILS))

  console.log('\n── Resumo de roles no sistema ─────────────────────')
  const allRoles = await db.select({ role: users.role }).from(users).where(eq(users.isActive, true))
  const counts: Record<string, number> = {}
  for (const r of allRoles) counts[r.role] = (counts[r.role] ?? 0) + 1
  for (const [role, count] of Object.entries(counts)) {
    console.log(`  ${role.padEnd(8)} → ${count} usuários`)
  }

  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
