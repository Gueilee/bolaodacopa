const XLSX   = require('xlsx')
const crypto = require('crypto')
const fs     = require('fs')
const path   = require('path')

const HASH        = '$2a$12$sNhU6H.SBtJBqrFQKZsaS.zZDp8yxVMf88F583kGS0dqRuPX7.yj.'
const ADMIN_EMAIL = 'gppereira@vendemmia.com.br'
const BATCH_SIZE  = 100

const DEPT_MAP = {
  'Administrativo - Vila Olímpia':      'Administrativo',
  'Comercial - Navegantes CD01':        'Comercial',
  'Comercial - Vila Olímpia':           'Comercial',
  'Compras - Itapevi':                  'Compras',
  'Compras - Navegantes CD01':          'Compras',
  'Compras - Navegantes CD02':          'Compras',
  'Compras - Vila Olímpia':             'Compras',
  'Controladoria - Vila Olímpia':       'Controladoria',
  'Contábil - Vila Olímpia':            'Contábil',
  'Fiscal - Navegantes CD02':           'Fiscal',
  'Fiscal - Vila Olímpia':              'Fiscal',
  'Jurídico - Vila Olímpia':            'Jurídico',
  'Logística - Vila Olímpia':           'Logística',
  'Marketing - Vila Olímpia':           'Marketing',
  'Não informado':                      null,
  'Operacional - Garuva':               'Operacional',
  'Operacional - Itapevi':              'Operacional',
  'Operacional - Navegantes CD01':      'Operacional',
  'Operacional - Navegantes CD02':      'Operacional',
  'Operações - Vila Olímpia':           'Operações',
  'Operações 01 - Vila Olímpia':        'Operações',
  'Operações 02 - Vila Olímpia':        'Operações',
  'Operações 03 - Vila Olímpia':        'Operações',
  'Projetos - Itapevi':                 'Projetos',
  'Projetos - Navegantes CD02':         'Projetos',
  'Projetos/Qualidade - Vila Olímpia':  'Projetos',
  'RH - Itapevi':                       'RH',
  'RH - Navegantes CD01':               'RH',
  'RH - Navegantes CD02':               'RH',
  'RH - Vila Olímpia':                  'RH',
  'Sócio Diretor - Navegantes CD01':    'Diretoria',
  'Sócio Diretor - Vila Olímpia':       'Diretoria',
  'TI - Vila Olímpia':                  'TI',
  'Tesouraria - Vila Olímpia':          'Tesouraria',
  'Transporte - Itapevi':               'Transporte',
  'Transporte - Navegantes CD01':       'Transporte',
}

function toTitleCase(str) {
  const lower = ['de','da','do','das','dos','e','em','a','o','as','os','para','com','por','no','na','nos','nas']
  return str.toLowerCase().split(' ')
    .map((w, i) => (i > 0 && lower.includes(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function s(v) {
  if (v === null || v === undefined) return 'NULL'
  return "'" + String(v).replace(/'/g, "''") + "'"
}

const wb   = XLSX.readFile('pessoas.xlsx')
const ws   = wb.Sheets[wb.SheetNames[0]]
const data = XLSX.utils.sheet_to_json(ws, { defval: '' })

const seen  = new Set()
const valid = data.filter(row => {
  const email = (row['Informações de trabalho - E-mail profissional'] || '').trim().toLowerCase()
  if (!email || email === 'não informado' || seen.has(email)) return false
  seen.add(email)
  return true
})

const rows = valid.map(row => {
  const name    = toTitleCase(row['Nome do colaborador'])
  const email   = (row['Informações de trabalho - E-mail profissional'] || '').trim().toLowerCase()
  const deptRaw = row['Informações de trabalho - Departamento'] || ''
  const dept    = DEPT_MAP.hasOwnProperty(deptRaw) ? DEPT_MAP[deptRaw] : deptRaw
  const role    = email === ADMIN_EMAIL ? 'admin' : 'user'
  const id      = crypto.randomUUID()
  return '(' + [s(id), s(name), s(email), s(HASH), s(role), dept ? s(dept) : 'NULL'].join(',') + ')'
})

// Cria a pasta sql se não existir
if (!fs.existsSync('sql')) fs.mkdirSync('sql')

// Divide em lotes de BATCH_SIZE
const totalBatches = Math.ceil(rows.length / BATCH_SIZE)

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch     = rows.slice(i, i + BATCH_SIZE)
  const batchNum  = Math.floor(i / BATCH_SIZE) + 1
  const filename  = `sql/03-users-lote${String(batchNum).padStart(2, '0')}.sql`
  const first     = i + 1
  const last      = Math.min(i + BATCH_SIZE, rows.length)

  const content = `-- ==============================================================
-- PASSO 3 — Lote ${batchNum}/${totalBatches}: Usuários ${first}–${last} de ${rows.length}
-- ==============================================================
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, department)
VALUES
${batch.join(',\n')};

SELECT COUNT(*) AS usuarios_inseridos FROM users;
`
  fs.writeFileSync(filename, content, 'utf8')
  console.log(`Gerado: ${filename} (${batch.length} usuários)`)
}

console.log(`\n✅ Total: ${rows.length} usuários em ${totalBatches} lotes de ${BATCH_SIZE}`)
console.log(`\nORDEM DE EXECUÇÃO NO TURSO SHELL:`)
console.log(`  1. sql/01-tables.sql`)
console.log(`  2. sql/02-settings.sql`)
for (let b = 1; b <= totalBatches; b++) {
  console.log(`  3.${b}. sql/03-users-lote${String(b).padStart(2, '0')}.sql`)
}
