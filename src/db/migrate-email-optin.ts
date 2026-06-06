import { createClient } from '@libsql/client'
const client = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
client.execute('ALTER TABLE users ADD COLUMN email_opt_in INTEGER NOT NULL DEFAULT 0')
  .then(() => { console.log('✓ email_opt_in adicionado'); process.exit(0) })
  .catch(e => { console.log('·', e.message); process.exit(0) })
