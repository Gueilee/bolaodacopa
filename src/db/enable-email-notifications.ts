/**
 * Ativa emailOptIn para todos os usuários ativos.
 * Uso: npx tsx --env-file=.env.local src/db/enable-email-notifications.ts
 */
import { db }    from '@/lib/db'
import { users } from '@/db/schema'
import { eq }    from 'drizzle-orm'

async function main() {
  const result = await db
    .update(users)
    .set({ emailOptIn: true, updatedAt: new Date() })
    .where(eq(users.isActive, true))

  console.log('✓ emailOptIn ativado para todos os usuários ativos.')
  console.log(`  Registros atualizados: ${result.rowsAffected ?? '?'}`)
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
