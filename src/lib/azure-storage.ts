import { StorageSharedKeyCredential, BlobServiceClient } from '@azure/storage-blob'

// Leitura lazy (dentro da função) para garantir que o --env-file já foi carregado
function getConfig() {
  return {
    accountName:   process.env.AZURE_STORAGE_ACCOUNT    ?? 'vdmgueileeprodstorage',
    containerName: process.env.AZURE_STORAGE_CONTAINER  ?? 'filescontainer',
    accessKey:     (process.env.BLOB_READ_WRITE_TOKEN    ?? '').trim(),
  }
}

function getBlobServiceClient(): BlobServiceClient {
  const { accountName, accessKey } = getConfig()

  if (!accessKey) {
    throw new Error(
      `BLOB_READ_WRITE_TOKEN não está configurado. ` +
      `Vars disponíveis: ${Object.keys(process.env).filter(k => k.includes('BLOB') || k.includes('AZURE') || k.includes('STORAGE')).join(', ') || 'nenhuma'}`
    )
  }

  const credential = new StorageSharedKeyCredential(accountName, accessKey)
  return new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    credential,
  )
}

export async function uploadToBlob(
  fileBuffer:  Buffer,
  blobPath:    string,
  contentType: string,
): Promise<string> {
  const { containerName } = getConfig()
  const service    = getBlobServiceClient()
  const container  = service.getContainerClient(containerName)

  const cleanPath = `bolaodacopa/${blobPath.replace(/^\//, '')}`
  const blob      = container.getBlockBlobClient(cleanPath)

  await blob.upload(fileBuffer, fileBuffer.length, {
    blobHTTPHeaders: { blobContentType: contentType },
  })

  // URL via proxy interno (container privado)
  return `/api/blob/${cleanPath}`
}
