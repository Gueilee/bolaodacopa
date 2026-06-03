/**
 * Startup wrapper: carrega o .env com override=true ANTES do servidor Next.js.
 * Garante que variáveis do arquivo sobrescrevem env vars vazias do container.
 */
const path = require('path')
const fs   = require('fs')

const envFile = path.join(__dirname, '..', '.env')

if (fs.existsSync(envFile)) {
  require('dotenv').config({ path: envFile, override: true })
  console.log('[startup] .env carregado com override=true')

  // Diagnóstico
  const blob = process.env.BLOB_READ_WRITE_TOKEN
  console.log(`[startup] BLOB_READ_WRITE_TOKEN: ${blob ? `✓ set (${blob.length} chars)` : '✗ MISSING'}`)
} else {
  console.warn('[startup] .env não encontrado em', envFile)
}

// Inicia o servidor Next.js standalone
require(path.join(__dirname, '..', '.next', 'standalone', 'server.js'))
