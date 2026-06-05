/**
 * Aplica a migration 0006: adiciona colunas de eventos ao matches
 * e a coluna unit ao users (se ainda não existirem).
 * Uso: pnpm tsx --env-file=.env.local src/db/migrate-events.ts
 */
import { createClient } from '@libsql/client'

const client = createClient({
  url:       process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const migrations = [
  `ALTER TABLE matches ADD COLUMN goals_json TEXT`,
  `ALTER TABLE matches ADD COLUMN bookings_json TEXT`,
  `ALTER TABLE matches ADD COLUMN subs_json TEXT`,
  `ALTER TABLE users ADD COLUMN unit TEXT`,
]

async function main() {
  for (const sql of migrations) {
    try {
      await client.execute(sql)
      console.log(`✓ ${sql}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('duplicate column')) {
        console.log(`· já existe: ${sql.split(' ').slice(-2).join(' ')}`)
      } else {
        console.error(`✗ ${sql}\n  ${msg}`)
      }
    }
  }
  console.log('\nConcluído.')
  process.exit(0)
}

main()
