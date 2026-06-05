/**
 * Reset dos dados de teste antes do lançamento oficial.
 *
 * O QUE APAGA:
 *   - Todos os palpites de partidas (predictions)
 *   - Todos os palpites de torneio (tournament_predictions)
 *   - Todos os gols/artilheiros (match_goals)
 *   - Resultados reais dos jogos (volta para 'upcoming', score=null)
 *   - Pontos acumulados dos usuários (volta para 0)
 *   - Lock de palpites dos usuários (volta para false)
 *   - Settings de resultado final do torneio (champion, runner_up, top_scorer)
 *
 * O QUE PRESERVA:
 *   - Posts, curtidas e comentários da Central da Torcida
 *   - Usuários e cadastros
 *   - Datas e configurações dos jogos
 *   - Configurações do sistema (sync, etc.)
 *
 * Uso: pnpm exec tsx --env-file=.env.local src/db/reset-test-data.ts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })
import { db } from '../lib/db'
import {
  predictions,
  tournamentPredictions,
  matchGoals,
  matches,
  users,
  settings,
} from './schema'
import { eq, inArray, not } from 'drizzle-orm'

async function main() {
  console.log('🧹 Iniciando reset dos dados de teste...\n')

  // ── 1. Apagar todos os palpites de partidas ──────────────────────────────────
  const deletedPreds = await db.delete(predictions)
  console.log(`✓ Palpites de partidas apagados`)

  // ── 2. Apagar todos os palpites de torneio ───────────────────────────────────
  await db.delete(tournamentPredictions)
  console.log(`✓ Palpites de torneio (campeão/vice/artilheiro) apagados`)

  // ── 3. Apagar gols/artilheiros ───────────────────────────────────────────────
  await db.delete(matchGoals)
  console.log(`✓ Gols e artilheiros apagados`)

  // ── 4. Resetar resultados das partidas ───────────────────────────────────────
  await db
    .update(matches)
    .set({
      homeScore:   null,
      awayScore:   null,
      matchResult: null,
      status:      'upcoming',
      isScored:    false,
      elapsed:     null,
      updatedAt:   new Date(),
    })
  console.log(`✓ Resultados das partidas resetados para 'upcoming'`)

  // ── 5. Resetar pontos e lock dos usuários ────────────────────────────────────
  await db
    .update(users)
    .set({
      totalPoints:         0,
      isPredictionLocked:  false,
      predictionsLockedAt: null,
      updatedAt:           new Date(),
    })
  console.log(`✓ Pontos e lock dos usuários zerados`)

  // ── 6. Remover settings de resultado do torneio ──────────────────────────────
  await db.delete(settings).where(
    inArray(settings.key, ['champion', 'runner_up', 'top_scorer'])
  )
  console.log(`✓ Settings de resultado final do torneio removidos`)

  // ── Verificação final ─────────────────────────────────────────────────────────
  const [predCount, tournCount, goalCount] = await Promise.all([
    db.select().from(predictions),
    db.select().from(tournamentPredictions),
    db.select().from(matchGoals),
  ])

  console.log('\n📊 Verificação final:')
  console.log(`   predictions:           ${predCount.length}  (esperado: 0)`)
  console.log(`   tournament_predictions:${tournCount.length}  (esperado: 0)`)
  console.log(`   match_goals:           ${goalCount.length}  (esperado: 0)`)

  if (predCount.length === 0 && tournCount.length === 0 && goalCount.length === 0) {
    console.log('\n✅ Reset concluído com sucesso! Sistema pronto para o lançamento.')
  } else {
    console.warn('\n⚠ Alguns registros não foram removidos. Verifique manualmente.')
  }

  process.exit(0)
}

main().catch(err => {
  console.error('❌ Erro durante o reset:', err)
  process.exit(1)
})
