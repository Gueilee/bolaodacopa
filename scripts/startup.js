/**
 * Startup wrapper: carrega o .env ANTES do servidor Next.js.
 * Só aplica valores NÃO-VAZIOS do .env — preserva vars do container (Portainer)
 * se o .env não tiver valor real para aquela chave.
 */
const path = require('path')
const fs   = require('fs')

const envFile = path.join(__dirname, '..', '.env')

if (fs.existsSync(envFile)) {
  const { parse } = require('dotenv')
  const parsed = parse(fs.readFileSync(envFile, 'utf8'))
  let applied = 0

  for (const [key, val] of Object.entries(parsed)) {
    const trimmed = val.trim()
    if (trimmed) {
      // .env tem valor real → aplica (sobrescreve vazio do Portainer)
      process.env[key] = trimmed
      applied++
    }
    // .env vazio → mantém o que o container já tem
  }

  console.log(`[startup] .env carregado: ${applied} vars aplicadas`)
} else {
  console.warn('[startup] .env não encontrado em', envFile)
}

const blob = process.env.BLOB_READ_WRITE_TOKEN
console.log(`[startup] BLOB_READ_WRITE_TOKEN: ${blob ? `✓ set (${blob.length} chars)` : '✗ MISSING'}`)

// Inicia o servidor Next.js standalone
require(path.join(__dirname, '..', '.next', 'standalone', 'server.js'))
