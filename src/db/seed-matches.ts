/**
 * Seed: insere todas as 104 partidas da Copa do Mundo 2026.
 * Grupos baseados no sorteio oficial de dezembro/2025.
 * Uso: pnpm db:seed-matches
 */
import { config } from 'dotenv'
config({ path: '.env.local' })
import { db } from '../lib/db'
import { matches } from './schema'
import type { NewMatch } from './schema'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Team = { name: string; flag: string }
type GroupEntry = { letter: string; teams: [Team, Team, Team, Team] }

// ─── Seleções por grupo ───────────────────────────────────────────────────────
const GROUPS: GroupEntry[] = [
  {
    letter: 'A',
    teams: [
      { name: 'México',           flag: '🇲🇽' },
      { name: 'África do Sul',    flag: '🇿🇦' },
      { name: 'Coreia do Sul',    flag: '🇰🇷' },
      { name: 'Rep. Tcheca',      flag: '🇨🇿' },
    ],
  },
  {
    letter: 'B',
    teams: [
      { name: 'Canadá',           flag: '🇨🇦' },
      { name: 'Bósnia',           flag: '🇧🇦' },
      { name: 'Catar',            flag: '🇶🇦' },
      { name: 'Suíça',            flag: '🇨🇭' },
    ],
  },
  {
    letter: 'C',
    teams: [
      { name: 'Brasil',           flag: '🇧🇷' },
      { name: 'Marrocos',         flag: '🇲🇦' },
      { name: 'Haiti',            flag: '🇭🇹' },
      { name: 'Escócia',          flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    ],
  },
  {
    letter: 'D',
    teams: [
      { name: 'EUA',              flag: '🇺🇸' },
      { name: 'Paraguai',         flag: '🇵🇾' },
      { name: 'Austrália',        flag: '🇦🇺' },
      { name: 'Turquia',          flag: '🇹🇷' },
    ],
  },
  {
    letter: 'E',
    teams: [
      { name: 'Alemanha',         flag: '🇩🇪' },
      { name: 'Curaçao',          flag: '🇨🇼' },
      { name: 'Costa do Marfim',  flag: '🇨🇮' },
      { name: 'Equador',          flag: '🇪🇨' },
    ],
  },
  {
    letter: 'F',
    teams: [
      { name: 'Países Baixos',    flag: '🇳🇱' },
      { name: 'Japão',            flag: '🇯🇵' },
      { name: 'Suécia',           flag: '🇸🇪' },
      { name: 'Tunísia',          flag: '🇹🇳' },
    ],
  },
  {
    letter: 'G',
    teams: [
      { name: 'Bélgica',          flag: '🇧🇪' },
      { name: 'Egito',            flag: '🇪🇬' },
      { name: 'Irã',              flag: '🇮🇷' },
      { name: 'Nova Zelândia',    flag: '🇳🇿' },
    ],
  },
  {
    letter: 'H',
    teams: [
      { name: 'Espanha',          flag: '🇪🇸' },
      { name: 'Cabo Verde',       flag: '🇨🇻' },
      { name: 'Arábia Saudita',   flag: '🇸🇦' },
      { name: 'Uruguai',          flag: '🇺🇾' },
    ],
  },
  {
    letter: 'I',
    teams: [
      { name: 'França',           flag: '🇫🇷' },
      { name: 'Senegal',          flag: '🇸🇳' },
      { name: 'Iraque',           flag: '🇮🇶' },
      { name: 'Noruega',          flag: '🇳🇴' },
    ],
  },
  {
    letter: 'J',
    teams: [
      { name: 'Argentina',        flag: '🇦🇷' },
      { name: 'Argélia',          flag: '🇩🇿' },
      { name: 'Áustria',          flag: '🇦🇹' },
      { name: 'Jordânia',         flag: '🇯🇴' },
    ],
  },
  {
    letter: 'K',
    teams: [
      { name: 'Portugal',         flag: '🇵🇹' },
      { name: 'Rep. D. do Congo', flag: '🇨🇩' },
      { name: 'Uzbequistão',      flag: '🇺🇿' },
      { name: 'Colômbia',         flag: '🇨🇴' },
    ],
  },
  {
    letter: 'L',
    teams: [
      { name: 'Inglaterra',       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { name: 'Croácia',          flag: '🇭🇷' },
      { name: 'Gana',             flag: '🇬🇭' },
      { name: 'Panamá',           flag: '🇵🇦' },
    ],
  },
]

// ─── Sedes ────────────────────────────────────────────────────────────────────
const VENUES = [
  'Estádio Azteca, Cidade do México',
  'MetLife Stadium, East Rutherford',
  'SoFi Stadium, Los Angeles',
  'AT&T Stadium, Dallas',
  'Hard Rock Stadium, Miami',
  'Mercedes-Benz Stadium, Atlanta',
  'Levi\'s Stadium, Santa Clara',
  'Arrowhead Stadium, Kansas City',
  'Lincoln Financial Field, Filadélfia',
  'Gillette Stadium, Foxborough',
  'Allegiant Stadium, Las Vegas',
  'BC Place, Vancouver',
  'BMO Field, Toronto',
  'Estádio Akron, Guadalajara',
  'Estádio BBVA, Monterrey',
]

// ─── Datas base da fase de grupos ────────────────────────────────────────────
// MD1: 11-17 Jun | MD2: +8 dias | MD3: 26-27 Jun (simultâneos no grupo)
const GROUP_BASE_DATES: Record<string, [string, string, string]> = {
  A: ['2026-06-11', '2026-06-19', '2026-06-26'],
  B: ['2026-06-12', '2026-06-20', '2026-06-26'],
  C: ['2026-06-12', '2026-06-20', '2026-06-26'],
  D: ['2026-06-13', '2026-06-21', '2026-06-26'],
  E: ['2026-06-13', '2026-06-21', '2026-06-27'],
  F: ['2026-06-14', '2026-06-22', '2026-06-27'],
  G: ['2026-06-14', '2026-06-22', '2026-06-27'],
  H: ['2026-06-15', '2026-06-23', '2026-06-27'],
  I: ['2026-06-15', '2026-06-23', '2026-06-27'],
  J: ['2026-06-16', '2026-06-24', '2026-06-27'],
  K: ['2026-06-16', '2026-06-24', '2026-06-27'],
  L: ['2026-06-17', '2026-06-25', '2026-06-27'],
}

// ─── Horários UTC (slots por matchday) ───────────────────────────────────────
// MD1/MD2: partida 1 às 17h BRT (20:00 UTC), partida 2 às 21h BRT (00:00 UTC +1 dia)
// MD3: ambas às 18h BRT (21:00 UTC), simultâneas

function makeDate(dateStr: string, hourUTC: number): Date {
  const d = new Date(`${dateStr}T${String(hourUTC).padStart(2, '0')}:00:00Z`)
  return d
}

// ─── Gera as 72 partidas da fase de grupos ────────────────────────────────────
type MatchRow = Pick<NewMatch, 'phase' | 'groupName' | 'matchNumber' | 'homeTeam' | 'awayTeam' | 'homeFlag' | 'awayFlag' | 'matchDate' | 'venue' | 'status'>

function generateGroupMatches(): MatchRow[] {
  const rows: MatchRow[] = []
  let matchNumber = 1
  let venueIdx = 0

  // Paridade: MD1[0]=T0xT1, MD1[1]=T2xT3 | MD2[0]=T0xT2, MD2[1]=T1xT3 | MD3[0]=T0xT3, MD3[1]=T1xT2
  const pairings: Array<[number, number]> = [
    [0, 1], [2, 3], // MD1
    [0, 2], [1, 3], // MD2
    [0, 3], [1, 2], // MD3
  ]

  for (const group of GROUPS) {
    const dates = GROUP_BASE_DATES[group.letter]
    const [md1Date, md2Date, md3Date] = dates

    // MD1: jogos 0 e 1
    rows.push({
      phase: 'group', groupName: `Grupo ${group.letter}`, matchNumber: matchNumber++,
      homeTeam: group.teams[0].name, homeFlag: group.teams[0].flag,
      awayTeam: group.teams[1].name, awayFlag: group.teams[1].flag,
      matchDate: makeDate(md1Date, 20),
      venue: VENUES[venueIdx % VENUES.length], status: 'upcoming',
    })
    venueIdx++
    rows.push({
      phase: 'group', groupName: `Grupo ${group.letter}`, matchNumber: matchNumber++,
      homeTeam: group.teams[2].name, homeFlag: group.teams[2].flag,
      awayTeam: group.teams[3].name, awayFlag: group.teams[3].flag,
      matchDate: makeDate(md1Date, 23),
      venue: VENUES[venueIdx % VENUES.length], status: 'upcoming',
    })
    venueIdx++

    // MD2: jogos 2 e 3
    rows.push({
      phase: 'group', groupName: `Grupo ${group.letter}`, matchNumber: matchNumber++,
      homeTeam: group.teams[0].name, homeFlag: group.teams[0].flag,
      awayTeam: group.teams[2].name, awayFlag: group.teams[2].flag,
      matchDate: makeDate(md2Date, 20),
      venue: VENUES[venueIdx % VENUES.length], status: 'upcoming',
    })
    venueIdx++
    rows.push({
      phase: 'group', groupName: `Grupo ${group.letter}`, matchNumber: matchNumber++,
      homeTeam: group.teams[1].name, homeFlag: group.teams[1].flag,
      awayTeam: group.teams[3].name, awayFlag: group.teams[3].flag,
      matchDate: makeDate(md2Date, 23),
      venue: VENUES[venueIdx % VENUES.length], status: 'upcoming',
    })
    venueIdx++

    // MD3: simultâneas (mesma hora)
    rows.push({
      phase: 'group', groupName: `Grupo ${group.letter}`, matchNumber: matchNumber++,
      homeTeam: group.teams[0].name, homeFlag: group.teams[0].flag,
      awayTeam: group.teams[3].name, awayFlag: group.teams[3].flag,
      matchDate: makeDate(md3Date, 21),
      venue: VENUES[venueIdx % VENUES.length], status: 'upcoming',
    })
    venueIdx++
    rows.push({
      phase: 'group', groupName: `Grupo ${group.letter}`, matchNumber: matchNumber++,
      homeTeam: group.teams[1].name, homeFlag: group.teams[1].flag,
      awayTeam: group.teams[2].name, awayFlag: group.teams[2].flag,
      matchDate: makeDate(md3Date, 21),
      venue: VENUES[venueIdx % VENUES.length], status: 'upcoming',
    })
    venueIdx++
  }

  return rows
}

// ─── Chaveamento do mata-mata ─────────────────────────────────────────────────
// Baseado no regulamento FIFA 2026 (Annex C, bracket fixo)
// Times a confirmar após fase de grupos — admin atualiza antes de cada rodada.
const TBD = '? A Definir'
const F   = '🏳'

function ko(
  matchNumber: number,
  phase: string,
  homeTeam: string,
  awayTeam: string,
  matchDate: Date,
  venue: string,
): MatchRow {
  return {
    phase, matchNumber,
    homeTeam, awayTeam,
    homeFlag: F, awayFlag: F,
    matchDate, venue, status: 'upcoming',
  }
}

function generateKnockoutMatches(startMatchNumber: number): MatchRow[] {
  const rows: MatchRow[] = []
  let n = startMatchNumber

  // ── Round of 32 (16 partidas) ──────────────────────────
  // Bracket fixo FIFA 2026 — Os 8 melhores 3ºs completam a tabela conforme
  // suas posições nos grupos A-L (definida após encerrar fase de grupos).
  const r32Schedule: Array<[string, Date, string]> = [
    ['1º Grupo A × 3º Lugar (TBD)',   makeDate('2026-06-29', 20), 'MetLife Stadium, East Rutherford'],
    ['2º Grupo A × 2º Grupo B',       makeDate('2026-06-29', 23), 'SoFi Stadium, Los Angeles'],
    ['1º Grupo B × 3º Lugar (TBD)',   makeDate('2026-06-30', 20), 'AT&T Stadium, Dallas'],
    ['1º Grupo C × 2º Grupo D',       makeDate('2026-06-30', 23), 'Estádio Azteca, Cidade do México'],
    ['2º Grupo C × 3º Lugar (TBD)',   makeDate('2026-07-01', 20), 'Hard Rock Stadium, Miami'],
    ['1º Grupo D × 3º Lugar (TBD)',   makeDate('2026-07-01', 23), 'Mercedes-Benz Stadium, Atlanta'],
    ['1º Grupo E × 2º Grupo F',       makeDate('2026-07-02', 20), 'BC Place, Vancouver'],
    ['2º Grupo E × 3º Lugar (TBD)',   makeDate('2026-07-02', 23), 'Gillette Stadium, Foxborough'],
    ['1º Grupo F × 3º Lugar (TBD)',   makeDate('2026-07-02', 20), 'Levi\'s Stadium, Santa Clara'],
    ['1º Grupo G × 2º Grupo H',       makeDate('2026-07-03', 20), 'Arrowhead Stadium, Kansas City'],
    ['2º Grupo G × 3º Lugar (TBD)',   makeDate('2026-07-03', 23), 'Allegiant Stadium, Las Vegas'],
    ['1º Grupo H × 3º Lugar (TBD)',   makeDate('2026-07-03', 20), 'Lincoln Financial Field, Filadélfia'],
    ['1º Grupo I × 2º Grupo J',       makeDate('2026-07-04', 20), 'BMO Field, Toronto'],
    ['2º Grupo I × 3º Lugar (TBD)',   makeDate('2026-07-04', 23), 'Estádio Akron, Guadalajara'],
    ['1º Grupo K × 2º Grupo L',       makeDate('2026-07-04', 20), 'Estádio BBVA, Monterrey'],
    ['1º Grupo J × 1º Grupo L',       makeDate('2026-07-04', 23), 'MetLife Stadium, East Rutherford'],
  ]

  for (const [label, date, venue] of r32Schedule) {
    const [home, away] = label.split(' × ')
    rows.push(ko(n++, 'round_of_32', home?.trim() ?? TBD, away?.trim() ?? TBD, date, venue))
  }

  // ── Round of 16 (8 partidas) ───────────────────────────
  const r16Schedule: Array<[Date, string]> = [
    [makeDate('2026-07-05', 20), 'MetLife Stadium, East Rutherford'],
    [makeDate('2026-07-05', 23), 'SoFi Stadium, Los Angeles'],
    [makeDate('2026-07-06', 20), 'AT&T Stadium, Dallas'],
    [makeDate('2026-07-06', 23), 'Mercedes-Benz Stadium, Atlanta'],
    [makeDate('2026-07-07', 20), 'Hard Rock Stadium, Miami'],
    [makeDate('2026-07-07', 23), 'BC Place, Vancouver'],
    [makeDate('2026-07-08', 20), 'Levi\'s Stadium, Santa Clara'],
    [makeDate('2026-07-08', 23), 'Arrowhead Stadium, Kansas City'],
  ]

  for (let i = 0; i < r16Schedule.length; i++) {
    const [date, venue] = r16Schedule[i]
    rows.push(ko(n++, 'round_of_16', `Venc. R32-${(i * 2) + 1}`, `Venc. R32-${(i * 2) + 2}`, date, venue))
  }

  // ── Quartas de Final (4 partidas) ──────────────────────
  const qfSchedule: Array<[Date, string]> = [
    [makeDate('2026-07-11', 20), 'MetLife Stadium, East Rutherford'],
    [makeDate('2026-07-11', 23), 'SoFi Stadium, Los Angeles'],
    [makeDate('2026-07-12', 20), 'AT&T Stadium, Dallas'],
    [makeDate('2026-07-12', 23), 'Estádio Azteca, Cidade do México'],
  ]

  for (let i = 0; i < qfSchedule.length; i++) {
    const [date, venue] = qfSchedule[i]
    rows.push(ko(n++, 'quarter_final', `Venc. Oitavas ${(i * 2) + 1}`, `Venc. Oitavas ${(i * 2) + 2}`, date, venue))
  }

  // ── Semifinais (2 partidas) ────────────────────────────
  rows.push(ko(n++, 'semi_final', 'Venc. QF 1', 'Venc. QF 2', makeDate('2026-07-15', 23), 'MetLife Stadium, East Rutherford'))
  rows.push(ko(n++, 'semi_final', 'Venc. QF 3', 'Venc. QF 4', makeDate('2026-07-16', 23), 'SoFi Stadium, Los Angeles'))

  // ── 3º Lugar ──────────────────────────────────────────
  rows.push(ko(n++, 'third_place', 'Perd. SF 1', 'Perd. SF 2', makeDate('2026-07-19', 20), 'AT&T Stadium, Dallas'))

  // ── Final ─────────────────────────────────────────────
  rows.push(ko(n++, 'final', 'Venc. SF 1', 'Venc. SF 2', makeDate('2026-07-19', 23), 'MetLife Stadium, East Rutherford'))

  return rows
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const groupMatches    = generateGroupMatches()        // 72 partidas
  const knockoutMatches = generateKnockoutMatches(73)   // 32 partidas → total 104

  const allMatches = [...groupMatches, ...knockoutMatches]

  console.log(`Inserindo ${allMatches.length} partidas...`)

  // Batch insert (SQLite aceita ~500 rows por vez)
  const BATCH = 50
  for (let i = 0; i < allMatches.length; i += BATCH) {
    await db.insert(matches).values(allMatches.slice(i, i + BATCH)).onConflictDoNothing()
  }

  const grupoCounts = groupMatches.length
  const koCounts    = knockoutMatches.length
  console.log(`✅  ${grupoCounts} jogos da fase de grupos inseridos`)
  console.log(`✅  ${koCounts} jogos do mata-mata inseridos (placeholders — admin atualiza os times)`)
  console.log(`✅  Total: ${allMatches.length} partidas`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
