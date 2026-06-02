/**
 * Importa colaboradores ativos do arquivo colaboradores.xlsx para o banco Turso.
 *
 * Lógica:
 *  1. Lê o xlsx e normaliza os dados
 *  2. Para cada colaborador: cria ou atualiza (by email) — preserva palpites existentes
 *  3. Desativa usuários que não estão na lista (demitidos), mas MANTÉM seus dados/palpites
 *  4. Senha padrão para contas novas: Copa@2026
 *
 * Uso: pnpm db:seed-users
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import * as XLSX from 'xlsx'
import * as bcrypt from 'bcryptjs'
import { db } from '../lib/db'
import { users } from './schema'
import { eq, not, inArray } from 'drizzle-orm'

// ─── Configurações ────────────────────────────────────────────────────────────
const XLSX_PATH   = 'colaboradores.xlsx'
const DEFAULT_PWD = 'Copa@2026'
const SALT_ROUNDS = 10

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  const stop = ['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'em', 'com']
  return str
    .toLowerCase()
    .split(' ')
    .map((w, i) => (i === 0 || !stop.includes(w)) ? w.charAt(0).toUpperCase() + w.slice(1) : w)
    .join(' ')
}

function slugName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join('.')
}

function generateEmail(name: string, index: number): string {
  const slug = slugName(name)
  return `${slug}.${index}@bolao.vendemmia.com.br`
}

// ─── Leitura do xlsx ──────────────────────────────────────────────────────────

type Row = {
  name:       string
  email:      string
  department: string
  manager:    string
  generated:  boolean  // email foi gerado (não existia)
}

function readXlsx(): Row[] {
  const wb   = XLSX.readFile(XLSX_PATH)
  const ws   = wb.Sheets[wb.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })

  const slugsSeen = new Map<string, number>()  // para deduplicar emails gerados
  const rows: Row[] = []

  for (const raw of data) {
    const name       = toTitleCase((raw['Nome do colaborador'] || '').trim())
    const emailRaw   = (raw['Informações de trabalho - E-mail profissional'] || '').trim().toLowerCase()
    const department = (raw['Informações de trabalho - Departamento'] || '').trim()
    const manager    = toTitleCase((raw['Informações de trabalho - Gestor'] || '').trim())

    if (!name) continue

    let email    = emailRaw
    let generated = false

    // Email inválido ou "Não informado" → gera temporário
    if (!email || email === 'não informado' || !email.includes('@')) {
      const slug = slugName(name)
      const n    = (slugsSeen.get(slug) ?? 0) + 1
      slugsSeen.set(slug, n)
      email     = generateEmail(name, n)
      generated = true
    }

    rows.push({ name, email, department, manager, generated })
  }

  return rows
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('📋 Lendo colaboradores.xlsx...')
  const rows = readXlsx()
  console.log(`   → ${rows.length} colaboradores encontrados`)

  const generated = rows.filter(r => r.generated)
  if (generated.length) {
    console.log(`\n⚠️  ${generated.length} colaboradores sem email válido — emails gerados:`)
    generated.forEach(r => console.log(`   ${r.name} → ${r.email}`))
  }

  // Hash da senha padrão (feito uma vez só)
  console.log('\n🔐 Gerando hash da senha padrão...')
  const pwdHash = await bcrypt.hash(DEFAULT_PWD, SALT_ROUNDS)

  // Buscar todos os usuários não-admin existentes
  const existing = await db
    .select({ id: users.id, email: users.email, isPredictionLocked: users.isPredictionLocked })
    .from(users)
    .where(not(eq(users.role, 'admin')))

  const existingByEmail = new Map(existing.map(u => [u.email.toLowerCase(), u]))
  const activeEmails    = new Set(rows.map(r => r.email.toLowerCase()))

  let created = 0, updated = 0, deactivated = 0

  // ── Upsert de cada colaborador ────────────────────────────────────────────
  for (const row of rows) {
    const emailKey = row.email.toLowerCase()
    const found    = existingByEmail.get(emailKey)

    if (found) {
      // Atualizar: nome, departamento, gestor, reativar
      await db
        .update(users)
        .set({
          name:       row.name,
          department: row.department,
          manager:    row.manager || null,
          isActive:   true,
          updatedAt:  new Date(),
        })
        .where(eq(users.id, found.id))
      updated++
    } else {
      // Criar novo usuário com senha padrão
      await db.insert(users).values({
        name:         row.name,
        email:        row.email,
        passwordHash: pwdHash,
        role:         'user',
        department:   row.department,
        manager:      row.manager || null,
        isActive:     true,
        totalPoints:  0,
        isPredictionLocked: false,
      }).onConflictDoNothing()
      created++
    }
  }

  // ── Desativar usuários que não estão mais na lista ────────────────────────
  const toDeactivate = existing
    .filter(u => !activeEmails.has(u.email.toLowerCase()))
    .map(u => u.id)

  if (toDeactivate.length) {
    await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(inArray(users.id, toDeactivate))
    deactivated = toDeactivate.length
  }

  // ── Relatório ─────────────────────────────────────────────────────────────
  console.log('\n✅ Importação concluída:')
  console.log(`   Criados:     ${created}`)
  console.log(`   Atualizados: ${updated}`)
  console.log(`   Desativados: ${deactivated}  (palpites preservados)`)
  console.log(`\n🔑 Senha padrão para contas novas: ${DEFAULT_PWD}`)
  console.log('   Comunique aos colaboradores para alterar após o primeiro acesso.\n')

  process.exit(0)
}

main().catch(err => {
  console.error('❌ Erro na importação:', err)
  process.exit(1)
})
