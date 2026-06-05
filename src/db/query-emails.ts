import { createClient } from '@libsql/client'

async function main() {
  const client = createClient({
    url:       process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })

  // 1. Sem email ou email inválido
  const r1 = await client.execute(`
    SELECT name, email, department FROM users
    WHERE is_active = 1 AND role = 'user'
    AND (email IS NULL OR email = '' OR email NOT LIKE '%@%')
    ORDER BY name
  `)

  // 2. Domínios suspeitos (não-Vendemmia)
  const r2 = await client.execute(`
    SELECT name, email, department FROM users
    WHERE is_active = 1 AND role = 'user'
    AND email LIKE '%@%'
    AND email NOT LIKE '%@vendemmia%'
    AND email NOT LIKE '%@vdm%'
    ORDER BY email, name
  `)

  // 3. E-mails duplicados
  const r3 = await client.execute(`
    SELECT email, COUNT(*) as cnt, GROUP_CONCAT(name, ' / ') as names
    FROM users
    WHERE is_active = 1 AND role = 'user'
    GROUP BY LOWER(email)
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `)

  console.log(`\n=== 1. SEM EMAIL OU EMAIL INVÁLIDO: ${r1.rows.length} ===`)
  r1.rows.forEach(r => {
    const n = String(r[0]||''), e = String(r[1]||'(vazio)'), d = String(r[2]||'-')
    console.log(`  ${n} | ${e} | ${d}`)
  })

  console.log(`\n=== 2. DOMÍNIO FORA DO VENDEMMIA: ${r2.rows.length} ===`)
  r2.rows.forEach(r => {
    const n = String(r[0]||''), e = String(r[1]||''), d = String(r[2]||'-')
    console.log(`  ${n} | ${e} | ${d}`)
  })

  console.log(`\n=== 3. E-MAILS DUPLICADOS: ${r3.rows.length} ===`)
  r3.rows.forEach(r => {
    const e = String(r[0]||''), cnt = String(r[1]||''), names = String(r[2]||'')
    console.log(`  ${e} (${cnt}x): ${names}`)
  })

  await client.close()
}

main().catch(console.error)
