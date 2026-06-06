/**
 * Dispara um e-mail de resultado fictício para teste visual.
 * Uso: npx tsx --env-file=.env.local src/db/send-test-result-email.ts
 */
import { sendDirectResultEmail } from '@/lib/email'

async function main() {
  const result = await sendDirectResultEmail({
    to:        'gppereira@vendemmia.com.br',
    name:      'Gueilee Pereira',
    homeTeam:  'Brasil',
    awayTeam:  'Argentina',
    homeScore: 3,
    awayScore: 1,
    predHome:  2,
    predAway:  1,
    points:    7,     // acertou vencedor + saldo
    total:     142,
  })

  if (result.success) {
    console.log('✓ E-mail de teste enviado para gppereira@vendemmia.com.br')
    console.log('  Jogo: Brasil 3×1 Argentina')
    console.log('  Palpite fictício: 2×1 → 7 pts (Vencedor + saldo)')
    console.log('  Total fictício: 142 pts')
  } else {
    console.error('✗ Erro:', result.error)
  }

  process.exit(0)
}

main().catch(e => { console.error('✗', e.message); process.exit(1) })
