/**
 * Atualiza roles dos usuários conforme perfis definidos:
 *  admin: gppereira@vendemmia.com.br
 *  rh:    jnetto, ematheus, dmoraes @vendemmia.com.br
 *  user:  todos os demais (já é o default)
 *
 * Uso: pnpm db:set-roles
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from '../lib/db'
import { users } from './schema'
import { eq, inArray } from 'drizzle-orm'

const ADMIN_EMAILS = ['gppereira@vendemmia.com.br']
const RH_EMAILS    = ['jnetto@vendemmia.com.br', 'ematheus@vendemmia.com.br', 'dmoraes@vendemmia.com.br']

async function main() {
  console.log('🔧 Atualizando roles...\n')

  // ── Admin ─────────────────────────────────────────────────────────────────
  for (const email of ADMIN_EMAILS) {
    const result = await db
      .update(users)
      .set({ role: 'admin', updatedAt: new Date() })
      .where(eq(users.email, email))
    console.log(`✅  admin → ${email}`)
  }

  // ── RH ───────────────────────────────────────────────────────────────────
  for (const email of RH_EMAILS) {
    await db
      .update(users)
      .set({ role: 'rh', updatedAt: new Date() })
      .where(eq(users.email, email))
    console.log(`✅  rh    → ${email}`)
  }

  // ── Verificar resultado ───────────────────────────────────────────────────
  console.log('\n📋 Verificando banco...')
  const admins = await db.select({ name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(inArray(users.email, [...ADMIN_EMAILS, ...RH_EMAILS]))

  console.log('\nUsuários com roles especiais:')
  for (const u of admins) {
    console.log(`   [${u.role.padEnd(5)}] ${u.name} <${u.email}>`)
  }

  const notFound = [...ADMIN_EMAILS, ...RH_EMAILS].filter(
    e => !admins.find(u => u.email === e)
  )
  if (notFound.length) {
    console.log('\n⚠️  Emails não encontrados no banco (usuário ainda não cadastrado):')
    notFound.forEach(e => console.log(`   ${e}`))
    console.log('   → Rode pnpm db:seed-users para importar os colaboradores primeiro.')
  }

  console.log('\nConcluído.\n')
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Erro:', err)
  process.exit(1)
})
