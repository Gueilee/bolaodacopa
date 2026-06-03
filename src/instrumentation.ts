/**
 * Instrumentation Next.js — roda no início do servidor (Node.js runtime).
 * Garante que o .env seja carregado via dotenv como fallback ao --env-file.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { config } = await import('dotenv')
    const path = await import('path')

    // Tenta carregar /app/.env (Docker) ou .env.local (desenvolvimento)
    const envFile = process.env.NODE_ENV === 'production'
      ? '/app/.env'
      : path.join(process.cwd(), '.env.local')

    config({ path: envFile, override: false })

    // Log de diagnóstico (apenas em produção para detectar problemas)
    if (process.env.NODE_ENV === 'production') {
      const hasBlob    = !!process.env.BLOB_READ_WRITE_TOKEN
      const hasAccount = !!process.env.AZURE_STORAGE_ACCOUNT
      console.log(`[startup] BLOB_READ_WRITE_TOKEN: ${hasBlob ? '✓ set' : '✗ MISSING'}`)
      console.log(`[startup] AZURE_STORAGE_ACCOUNT: ${hasAccount ? process.env.AZURE_STORAGE_ACCOUNT : '✗ (usando padrão vdmgueileeprodstorage)'}`)
    }
  }
}
