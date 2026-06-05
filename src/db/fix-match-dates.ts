/**
 * Corrige as datas de todos os 72 jogos da fase de grupos.
 * Fonte: NBC Sports (https://www.nbcsports.com) — datas e horários ET oficiais.
 * Uso: pnpm exec tsx src/db/fix-match-dates.ts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })
import { db } from '../lib/db'
import { matches } from './schema'
import { and, eq } from 'drizzle-orm'

type Fix = { homeTeam: string; awayTeam: string; matchDate: Date }

// Horários UTC derivados dos horários ET oficiais (EDT = UTC-4).
// BRT = UTC-3; todos os jogos abaixo exibem a data correta em Brasília.
const FIXES: Fix[] = [

  // ── GRUPO A  (México · África do Sul · Coreia do Sul · Rep. Tcheca) ──────────
  { homeTeam: 'México',          awayTeam: 'África do Sul',   matchDate: new Date('2026-06-11T19:00:00Z') }, // 3pm ET Jun 11
  { homeTeam: 'Coreia do Sul',   awayTeam: 'Rep. Tcheca',     matchDate: new Date('2026-06-12T02:00:00Z') }, // 10pm ET Jun 11 → 23h BRT 11/06
  { homeTeam: 'Rep. Tcheca',     awayTeam: 'África do Sul',   matchDate: new Date('2026-06-18T16:00:00Z') }, // 12pm ET Jun 18
  { homeTeam: 'México',          awayTeam: 'Coreia do Sul',   matchDate: new Date('2026-06-19T01:00:00Z') }, // 9pm ET Jun 18 → 22h BRT 18/06
  { homeTeam: 'Rep. Tcheca',     awayTeam: 'México',          matchDate: new Date('2026-06-25T01:00:00Z') }, // 9pm ET Jun 24 → 22h BRT 24/06
  { homeTeam: 'África do Sul',   awayTeam: 'Coreia do Sul',   matchDate: new Date('2026-06-25T01:00:00Z') }, // 9pm ET Jun 24 → 22h BRT 24/06

  // ── GRUPO B  (Canadá · Bósnia · Catar · Suíça) ───────────────────────────────
  { homeTeam: 'Canadá',          awayTeam: 'Bósnia',          matchDate: new Date('2026-06-12T19:00:00Z') }, // 3pm ET Jun 12
  { homeTeam: 'Catar',           awayTeam: 'Suíça',           matchDate: new Date('2026-06-13T19:00:00Z') }, // 3pm ET Jun 13
  { homeTeam: 'Suíça',           awayTeam: 'Bósnia',          matchDate: new Date('2026-06-18T19:00:00Z') }, // 3pm ET Jun 18
  { homeTeam: 'Canadá',          awayTeam: 'Catar',           matchDate: new Date('2026-06-18T22:00:00Z') }, // 6pm ET Jun 18
  { homeTeam: 'Suíça',           awayTeam: 'Canadá',          matchDate: new Date('2026-06-24T19:00:00Z') }, // 3pm ET Jun 24
  { homeTeam: 'Bósnia',          awayTeam: 'Catar',           matchDate: new Date('2026-06-24T19:00:00Z') }, // 3pm ET Jun 24

  // ── GRUPO C  (Brasil · Marrocos · Haiti · Escócia) ───────────────────────────
  { homeTeam: 'Brasil',          awayTeam: 'Marrocos',        matchDate: new Date('2026-06-13T22:00:00Z') }, // 6pm ET Jun 13
  { homeTeam: 'Haiti',           awayTeam: 'Escócia',         matchDate: new Date('2026-06-14T01:00:00Z') }, // 9pm ET Jun 13 → 22h BRT 13/06
  { homeTeam: 'Marrocos',        awayTeam: 'Escócia',         matchDate: new Date('2026-06-19T22:00:00Z') }, // 6pm ET Jun 19
  { homeTeam: 'Brasil',          awayTeam: 'Haiti',           matchDate: new Date('2026-06-20T01:00:00Z') }, // 9pm ET Jun 19 → 22h BRT 19/06
  { homeTeam: 'Brasil',          awayTeam: 'Escócia',         matchDate: new Date('2026-06-24T22:00:00Z') }, // 6pm ET Jun 24
  { homeTeam: 'Marrocos',        awayTeam: 'Haiti',           matchDate: new Date('2026-06-24T22:00:00Z') }, // 6pm ET Jun 24

  // ── GRUPO D  (EUA · Paraguai · Austrália · Turquia) ──────────────────────────
  { homeTeam: 'EUA',             awayTeam: 'Paraguai',        matchDate: new Date('2026-06-13T01:00:00Z') }, // 9pm ET Jun 12 → 22h BRT 12/06
  { homeTeam: 'Austrália',       awayTeam: 'Turquia',         matchDate: new Date('2026-06-14T04:00:00Z') }, // Midnight ET Jun 13 → 01h BRT 14/06
  { homeTeam: 'EUA',             awayTeam: 'Austrália',       matchDate: new Date('2026-06-19T19:00:00Z') }, // 3pm ET Jun 19
  { homeTeam: 'Paraguai',        awayTeam: 'Turquia',         matchDate: new Date('2026-06-20T04:00:00Z') }, // Midnight ET Jun 19 → 01h BRT 20/06
  { homeTeam: 'EUA',             awayTeam: 'Turquia',         matchDate: new Date('2026-06-26T02:00:00Z') }, // 10pm ET Jun 25 → 23h BRT 25/06
  { homeTeam: 'Paraguai',        awayTeam: 'Austrália',       matchDate: new Date('2026-06-26T02:00:00Z') }, // 10pm ET Jun 25 → 23h BRT 25/06

  // ── GRUPO E  (Alemanha · Curaçao · Costa do Marfim · Equador) ────────────────
  { homeTeam: 'Alemanha',        awayTeam: 'Curaçao',         matchDate: new Date('2026-06-14T17:00:00Z') }, // 1pm ET Jun 14
  { homeTeam: 'Costa do Marfim', awayTeam: 'Equador',         matchDate: new Date('2026-06-14T23:00:00Z') }, // 7pm ET Jun 14
  { homeTeam: 'Alemanha',        awayTeam: 'Costa do Marfim', matchDate: new Date('2026-06-20T20:00:00Z') }, // 4pm ET Jun 20
  { homeTeam: 'Curaçao',         awayTeam: 'Equador',         matchDate: new Date('2026-06-21T00:00:00Z') }, // 8pm ET Jun 20 → 21h BRT 20/06
  { homeTeam: 'Equador',         awayTeam: 'Alemanha',        matchDate: new Date('2026-06-25T20:00:00Z') }, // 4pm ET Jun 25
  { homeTeam: 'Curaçao',         awayTeam: 'Costa do Marfim', matchDate: new Date('2026-06-25T20:00:00Z') }, // 4pm ET Jun 25

  // ── GRUPO F  (Países Baixos · Japão · Suécia · Tunísia) ──────────────────────
  { homeTeam: 'Países Baixos',   awayTeam: 'Japão',           matchDate: new Date('2026-06-14T20:00:00Z') }, // 4pm ET Jun 14
  { homeTeam: 'Suécia',          awayTeam: 'Tunísia',         matchDate: new Date('2026-06-15T02:00:00Z') }, // 10pm ET Jun 14 → 23h BRT 14/06
  { homeTeam: 'Países Baixos',   awayTeam: 'Suécia',          matchDate: new Date('2026-06-20T17:00:00Z') }, // 1pm ET Jun 20
  { homeTeam: 'Japão',           awayTeam: 'Tunísia',         matchDate: new Date('2026-06-21T04:00:00Z') }, // Midnight ET Jun 20 → 01h BRT 21/06
  { homeTeam: 'Japão',           awayTeam: 'Suécia',          matchDate: new Date('2026-06-25T23:00:00Z') }, // 7pm ET Jun 25
  { homeTeam: 'Tunísia',         awayTeam: 'Países Baixos',   matchDate: new Date('2026-06-25T23:00:00Z') }, // 7pm ET Jun 25

  // ── GRUPO G  (Bélgica · Egito · Irã · Nova Zelândia) ─────────────────────────
  { homeTeam: 'Bélgica',         awayTeam: 'Egito',           matchDate: new Date('2026-06-15T19:00:00Z') }, // 3pm ET Jun 15
  { homeTeam: 'Irã',             awayTeam: 'Nova Zelândia',   matchDate: new Date('2026-06-16T01:00:00Z') }, // 9pm ET Jun 15 → 22h BRT 15/06
  { homeTeam: 'Bélgica',         awayTeam: 'Irã',             matchDate: new Date('2026-06-21T19:00:00Z') }, // 3pm ET Jun 21
  { homeTeam: 'Egito',           awayTeam: 'Nova Zelândia',   matchDate: new Date('2026-06-22T01:00:00Z') }, // 9pm ET Jun 21 → 22h BRT 21/06
  { homeTeam: 'Egito',           awayTeam: 'Irã',             matchDate: new Date('2026-06-27T03:00:00Z') }, // 11pm ET Jun 26 → 00h BRT 27/06
  { homeTeam: 'Nova Zelândia',   awayTeam: 'Bélgica',         matchDate: new Date('2026-06-27T03:00:00Z') }, // 11pm ET Jun 26 → 00h BRT 27/06

  // ── GRUPO H  (Espanha · Cabo Verde · Arábia Saudita · Uruguai) ───────────────
  { homeTeam: 'Espanha',         awayTeam: 'Cabo Verde',      matchDate: new Date('2026-06-15T16:00:00Z') }, // 12pm ET Jun 15
  { homeTeam: 'Arábia Saudita',  awayTeam: 'Uruguai',         matchDate: new Date('2026-06-15T22:00:00Z') }, // 6pm ET Jun 15
  { homeTeam: 'Espanha',         awayTeam: 'Arábia Saudita',  matchDate: new Date('2026-06-21T16:00:00Z') }, // 12pm ET Jun 21
  { homeTeam: 'Uruguai',         awayTeam: 'Cabo Verde',      matchDate: new Date('2026-06-21T22:00:00Z') }, // 6pm ET Jun 21
  { homeTeam: 'Cabo Verde',      awayTeam: 'Arábia Saudita',  matchDate: new Date('2026-06-27T00:00:00Z') }, // 8pm ET Jun 26 → 21h BRT 26/06
  { homeTeam: 'Uruguai',         awayTeam: 'Espanha',         matchDate: new Date('2026-06-27T00:00:00Z') }, // 8pm ET Jun 26 → 21h BRT 26/06

  // ── GRUPO I  (França · Senegal · Iraque · Noruega) ───────────────────────────
  { homeTeam: 'França',          awayTeam: 'Senegal',         matchDate: new Date('2026-06-16T19:00:00Z') }, // 3pm ET Jun 16
  { homeTeam: 'Iraque',          awayTeam: 'Noruega',         matchDate: new Date('2026-06-16T22:00:00Z') }, // 6pm ET Jun 16
  { homeTeam: 'França',          awayTeam: 'Iraque',          matchDate: new Date('2026-06-22T21:00:00Z') }, // 5pm ET Jun 22
  { homeTeam: 'Noruega',         awayTeam: 'Senegal',         matchDate: new Date('2026-06-23T00:00:00Z') }, // 8pm ET Jun 22 → 21h BRT 22/06
  { homeTeam: 'Noruega',         awayTeam: 'França',          matchDate: new Date('2026-06-26T19:00:00Z') }, // 3pm ET Jun 26
  { homeTeam: 'Senegal',         awayTeam: 'Iraque',          matchDate: new Date('2026-06-26T19:00:00Z') }, // 3pm ET Jun 26

  // ── GRUPO J  (Argentina · Argélia · Áustria · Jordânia) ──────────────────────
  { homeTeam: 'Argentina',       awayTeam: 'Argélia',         matchDate: new Date('2026-06-17T01:00:00Z') }, // 9pm ET Jun 16 → 22h BRT 16/06
  { homeTeam: 'Áustria',         awayTeam: 'Jordânia',        matchDate: new Date('2026-06-17T04:00:00Z') }, // Midnight ET Jun 16 → 01h BRT 17/06
  { homeTeam: 'Argentina',       awayTeam: 'Áustria',         matchDate: new Date('2026-06-22T17:00:00Z') }, // 1pm ET Jun 22
  { homeTeam: 'Argélia',         awayTeam: 'Jordânia',        matchDate: new Date('2026-06-23T03:00:00Z') }, // 11pm ET Jun 22 → 00h BRT 23/06
  { homeTeam: 'Argentina',       awayTeam: 'Jordânia',        matchDate: new Date('2026-06-28T02:00:00Z') }, // 10pm ET Jun 27 → 23h BRT 27/06
  { homeTeam: 'Argélia',         awayTeam: 'Áustria',         matchDate: new Date('2026-06-28T02:00:00Z') }, // 10pm ET Jun 27 → 23h BRT 27/06

  // ── GRUPO K  (Portugal · Rep. D. do Congo · Uzbequistão · Colômbia) ──────────
  { homeTeam: 'Portugal',        awayTeam: 'Rep. D. do Congo',matchDate: new Date('2026-06-17T17:00:00Z') }, // 1pm ET Jun 17
  { homeTeam: 'Uzbequistão',     awayTeam: 'Colômbia',        matchDate: new Date('2026-06-18T02:00:00Z') }, // 10pm ET Jun 17 → 23h BRT 17/06
  { homeTeam: 'Portugal',        awayTeam: 'Uzbequistão',     matchDate: new Date('2026-06-23T17:00:00Z') }, // 1pm ET Jun 23
  { homeTeam: 'Colômbia',        awayTeam: 'Rep. D. do Congo',matchDate: new Date('2026-06-24T02:00:00Z') }, // 10pm ET Jun 23 → 23h BRT 23/06
  { homeTeam: 'Colômbia',        awayTeam: 'Portugal',        matchDate: new Date('2026-06-27T23:30:00Z') }, // 7:30pm ET Jun 27
  { homeTeam: 'Rep. D. do Congo',awayTeam: 'Uzbequistão',     matchDate: new Date('2026-06-27T23:30:00Z') }, // 7:30pm ET Jun 27

  // ── GRUPO L  (Inglaterra · Croácia · Gana · Panamá) ──────────────────────────
  { homeTeam: 'Inglaterra',      awayTeam: 'Croácia',         matchDate: new Date('2026-06-17T20:00:00Z') }, // 4pm ET Jun 17
  { homeTeam: 'Gana',            awayTeam: 'Panamá',          matchDate: new Date('2026-06-17T23:00:00Z') }, // 7pm ET Jun 17
  { homeTeam: 'Inglaterra',      awayTeam: 'Gana',            matchDate: new Date('2026-06-23T20:00:00Z') }, // 4pm ET Jun 23
  { homeTeam: 'Panamá',          awayTeam: 'Croácia',         matchDate: new Date('2026-06-23T23:00:00Z') }, // 7pm ET Jun 23
  { homeTeam: 'Panamá',          awayTeam: 'Inglaterra',      matchDate: new Date('2026-06-27T21:00:00Z') }, // 5pm ET Jun 27
  { homeTeam: 'Croácia',         awayTeam: 'Gana',            matchDate: new Date('2026-06-27T21:00:00Z') }, // 5pm ET Jun 27
]

async function main() {
  console.log(`Corrigindo datas de ${FIXES.length} jogos da fase de grupos...`)
  let updated = 0
  let notFound = 0

  for (const fix of FIXES) {
    const result = await db
      .update(matches)
      .set({ matchDate: fix.matchDate })
      .where(and(eq(matches.homeTeam, fix.homeTeam), eq(matches.awayTeam, fix.awayTeam)))

    const rows = (result as unknown as { rowsAffected?: number })?.rowsAffected ?? 1
    if (rows === 0) {
      console.warn(`  ⚠ NÃO ENCONTRADO: ${fix.homeTeam} × ${fix.awayTeam}`)
      notFound++
    } else {
      const brt = fix.matchDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      console.log(`  ✓ ${fix.homeTeam} × ${fix.awayTeam} → ${brt} BRT`)
      updated++
    }
  }

  console.log(`\n✅ ${updated} jogos atualizados | ⚠ ${notFound} não encontrados`)
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
