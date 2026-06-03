import { StorageSharedKeyCredential, BlobServiceClient } from '@azure/storage-blob'

const accountName = process.env.AZURE_STORAGE_ACCOUNT || 'vdmgueileeprodstorage'
const containerName = process.env.AZURE_STORAGE_CONTAINER || 'filescontainer'
const accessKey = process.env.BLOB_READ_WRITE_TOKEN?.trim()

let blobServiceClient: BlobServiceClient | null = null

function getBlobServiceClient() {
  if (blobServiceClient) return blobServiceClient

  if (!accessKey) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set (used for Azure Access Key).')
  }

  const credential = new StorageSharedKeyCredential(accountName, accessKey)
  blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    credential
  )
  return blobServiceClient
}

/**
 * Uploads a file buffer to Azure Blob Storage and returns the public direct URL.
 * 
 * @param fileBuffer The file content as a Buffer.
 * @param blobPath The path under the project directory (e.g. 'avatars/1.jpg').
 * @param contentType The MIME type of the file.
 * @returns The direct HTTP URL of the uploaded blob.
 */
export async function uploadToBlob(
  fileBuffer: Buffer,
  blobPath: string,
  contentType: string
): Promise<string> {
  const serviceClient = getBlobServiceClient()
  const containerClient = serviceClient.getContainerClient(containerName)
  
  // Clean prefix: ensure "bolaodacopa" is the parent folder
  const cleanPath = `bolaodacopa/${blobPath.replace(/^\//, '')}`
  
  const blockBlobClient = containerClient.getBlockBlobClient(cleanPath)
  
  await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
    blobHTTPHeaders: {
      blobContentType: contentType
    }
  })
  
  return blockBlobClient.url
}
