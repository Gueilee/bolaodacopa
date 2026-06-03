/**
 * Configura o container Azure Blob como público (acesso anônimo de leitura).
 * Rode uma única vez: npx tsx scripts/set-blob-public.ts
 */

import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'

const ACCOUNT   = process.env.AZURE_STORAGE_ACCOUNT   ?? 'vdmgueileeprodstorage'
const CONTAINER = process.env.AZURE_STORAGE_CONTAINER ?? 'filescontainer'
const KEY       = process.env.BLOB_READ_WRITE_TOKEN    ?? ''

if (!KEY) { console.error('❌ Defina BLOB_READ_WRITE_TOKEN no .env.local'); process.exit(1) }

async function main() {
  console.log(`\n🔧 Configurando acesso público no container "${CONTAINER}"...\n`)

  const credential = new StorageSharedKeyCredential(ACCOUNT, KEY)
  const service    = new BlobServiceClient(`https://${ACCOUNT}.blob.core.windows.net`, credential)
  const container  = service.getContainerClient(CONTAINER)

  // 'blob' = leitura anônima de blobs (sem listar o container)
  await container.setAccessPolicy('blob')

  console.log('✅ Pronto! Container configurado como público (blob).')
  console.log(`   URLs do tipo https://${ACCOUNT}.blob.core.windows.net/${CONTAINER}/* agora são acessíveis publicamente.\n`)
}

main().catch(err => {
  console.error('❌ Erro:', err.message)
  if (err.message?.includes('PublicAccessNotPermitted')) {
    console.error('\n⚠️  A conta de storage está com "Allow Blob anonymous access" DESABILITADO.')
    console.error('   O Leandro precisa habilitar no Portal Azure:')
    console.error('   Storage Account → Configuration → Allow Blob anonymous access → Enabled → Save\n')
  }
  process.exit(1)
})
