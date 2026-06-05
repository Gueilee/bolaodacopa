/**
 * Correção v2: os 15 jogos cujo home/away é inverso ao esperado no script v1.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })
import { db } from '../lib/db'
import { matches } from './schema'
import { and, eq } from 'drizzle-orm'

const FIXES = [
  // Group A MD2/MD3
  { homeTeam: 'África do Sul',    awayTeam: 'Rep. Tcheca',      matchDate: new Date('2026-06-18T16:00:00Z') },
  { homeTeam: 'México',           awayTeam: 'Rep. Tcheca',      matchDate: new Date('2026-06-25T01:00:00Z') },
  // Group B MD2/MD3
  { homeTeam: 'Bósnia',           awayTeam: 'Suíça',            matchDate: new Date('2026-06-18T19:00:00Z') },
  { homeTeam: 'Canadá',           awayTeam: 'Suíça',            matchDate: new Date('2026-06-24T19:00:00Z') },
  // Group E MD3
  { homeTeam: 'Alemanha',         awayTeam: 'Equador',          matchDate: new Date('2026-06-25T20:00:00Z') },
  // Group F MD3
  { homeTeam: 'Países Baixos',    awayTeam: 'Tunísia',          matchDate: new Date('2026-06-25T23:00:00Z') },
  // Group G MD3
  { homeTeam: 'Bélgica',          awayTeam: 'Nova Zelândia',    matchDate: new Date('2026-06-27T03:00:00Z') },
  // Group H MD2/MD3
  { homeTeam: 'Cabo Verde',       awayTeam: 'Uruguai',          matchDate: new Date('2026-06-21T22:00:00Z') },
  { homeTeam: 'Espanha',          awayTeam: 'Uruguai',          matchDate: new Date('2026-06-27T00:00:00Z') },
  // Group I MD2/MD3
  { homeTeam: 'Senegal',          awayTeam: 'Noruega',          matchDate: new Date('2026-06-23T00:00:00Z') },
  { homeTeam: 'França',           awayTeam: 'Noruega',          matchDate: new Date('2026-06-26T19:00:00Z') },
  // Group K MD2/MD3
  { homeTeam: 'Rep. D. do Congo', awayTeam: 'Colômbia',         matchDate: new Date('2026-06-24T02:00:00Z') },
  { homeTeam: 'Portugal',         awayTeam: 'Colômbia',         matchDate: new Date('2026-06-27T23:30:00Z') },
  // Group L MD2/MD3
  { homeTeam: 'Croácia',          awayTeam: 'Panamá',           matchDate: new Date('2026-06-23T23:00:00Z') },
  { homeTeam: 'Inglaterra',       awayTeam: 'Panamá',           matchDate: new Date('2026-06-27T21:00:00Z') },
]

async function main() {
  let ok = 0; let nf = 0
  for (const f of FIXES) {
    await db.update(matches).set({ matchDate: f.matchDate }).where(and(eq(matches.homeTeam, f.homeTeam), eq(matches.awayTeam, f.awayTeam)))
    const brt = f.matchDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    console.log(`  ✓ ${f.homeTeam} × ${f.awayTeam} → ${brt} BRT`)
    ok++
  }
  console.log(`\n✅ ${ok} jogos atualizados`)
  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
