/**
 * Importa unidades da planilha unidades.xlsx para o banco.
 * Cruza pelo nome do colaborador (case-insensitive, sem espaços extras).
 * NÃO cria novos usuários — apenas atualiza os existentes.
 * Uso: pnpm exec tsx --env-file=.env.local src/db/import-units.ts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })
import * as XLSX   from 'xlsx'
import * as path   from 'path'
import { db }      from '../lib/db'
import { users }   from './schema'
import { eq }      from 'drizzle-orm'

function normalize(s: string) {
  return s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

async function main() {
  // ── 1. Ler planilha ───────────────────────────────────────────────────────
  const wb   = XLSX.readFile(path.join(process.cwd(), 'unidades.xlsx'))
  const ws   = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<{ 'Nome do colaborador': string; UNIDADE: string }>(ws, { defval: '' })

  console.log(`📋 Planilha: ${rows.length} linhas`)

  // Mapa normalizado: nome → unidade
  const unitMap = new Map<string, string>()
  for (const row of rows) {
    const nome   = normalize(row['Nome do colaborador'])
    const unidade = row['UNIDADE'].trim()
    if (nome && unidade) unitMap.set(nome, unidade)
  }

  // ── 2. Buscar todos os usuários do banco ──────────────────────────────────
  const allUsers = await db.select({ id: users.id, name: users.name, unit: users.unit }).from(users)
  console.log(`👥 Usuários no banco: ${allUsers.length}`)

  // ── 3. Cruzar e atualizar ─────────────────────────────────────────────────
  let updated = 0
  let notFound = 0

  for (const user of allUsers) {
    const key  = normalize(user.name)
    const unit = unitMap.get(key)

    if (unit) {
      if (user.unit !== unit) {
        await db.update(users).set({ unit }).where(eq(users.id, user.id))
        updated++
      }
    } else {
      notFound++
    }
  }

  // ── 4. Verificação por unidade ────────────────────────────────────────────
  const withUnit    = await db.select({ unit: users.unit }).from(users)
  const unitCounts  = new Map<string, number>()
  for (const { unit } of withUnit) {
    if (unit) unitCounts.set(unit, (unitCounts.get(unit) ?? 0) + 1)
  }

  console.log(`\n✅ ${updated} usuários atualizados | ⚠️  ${notFound} sem correspondência na planilha`)
  console.log('\n📊 Distribuição por unidade:')
  for (const [unit, count] of [...unitCounts.entries()].sort()) {
    console.log(`   ${unit.padEnd(22)} → ${count} usuários`)
  }

  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
