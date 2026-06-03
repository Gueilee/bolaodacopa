/**
 * Remove URLs quebradas do Vercel Blob do banco de dados.
 * Uso: npx tsx --env-file=.env.local src/db/clear-broken-urls.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from '../lib/db'
import { users, socialPosts } from './schema'
import { like, isNotNull } from 'drizzle-orm'

async function main() {
  console.log('🧹 Limpando URLs quebradas do Vercel Blob...\n')

  // Zerar avatarUrl de usuários com URL do Vercel Blob
  const updatedUsers = await db
    .update(users)
    .set({ avatarUrl: null, updatedAt: new Date() })
    .where(like(users.avatarUrl, '%vercel-storage.com%'))

  console.log(`✅ Avatares limpos`)

  // Deletar posts que só tinham mídia do Vercel Blob (sem texto)
  const brokenPosts = await db.query.socialPosts.findMany({
    columns: { id: true, content: true, mediaUrl: true },
  })

  let deletedPosts = 0
  let clearedMedia = 0

  for (const post of brokenPosts) {
    if (!post.mediaUrl?.includes('vercel-storage.com')) continue

    if (!post.content?.trim()) {
      // Post só tinha imagem quebrada — deletar
      await db.delete(socialPosts).where(like(socialPosts.mediaUrl, '%vercel-storage.com%'))
      deletedPosts++
    } else {
      // Post tinha texto + imagem — manter o texto, remover só a mídia
      await db.update(socialPosts)
        .set({ mediaUrl: null, mediaType: 'text' })
        .where(like(socialPosts.mediaUrl, '%vercel-storage.com%'))
      clearedMedia++
    }
  }

  console.log(`✅ Posts com só imagem quebrada: ${deletedPosts} deletados`)
  console.log(`✅ Posts com texto + imagem quebrada: ${clearedMedia} (mídia removida, texto mantido)`)
  console.log('\nConcluído.')
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Erro:', err)
  process.exit(1)
})
