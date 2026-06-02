// Cálculo de classificação de grupos e projeção do chaveamento para Copa 2026

export const COPA_GROUPS: Record<string, string[]> = {
  A: ['México', 'África do Sul', 'Coreia do Sul', 'Rep. Tcheca'],
  B: ['Canadá', 'Bósnia', 'Catar', 'Suíça'],
  C: ['Brasil', 'Marrocos', 'Haiti', 'Escócia'],
  D: ['EUA', 'Paraguai', 'Austrália', 'Turquia'],
  E: ['Alemanha', 'Curaçao', 'Costa do Marfim', 'Equador'],
  F: ['Países Baixos', 'Japão', 'Suécia', 'Tunísia'],
  G: ['Bélgica', 'Egito', 'Irã', 'Nova Zelândia'],
  H: ['Espanha', 'Cabo Verde', 'Arábia Saudita', 'Uruguai'],
  I: ['França', 'Senegal', 'Iraque', 'Noruega'],
  J: ['Argentina', 'Argélia', 'Áustria', 'Jordânia'],
  K: ['Portugal', 'Rep. D. do Congo', 'Uzbequistão', 'Colômbia'],
  L: ['Inglaterra', 'Croácia', 'Gana', 'Panamá'],
}

export type TeamStats = {
  team:    string
  group:   string
  played:  number
  won:     number
  drawn:   number
  lost:    number
  gf:      number
  ga:      number
  gd:      number
  pts:     number
  position: number  // 1-4 dentro do grupo
}

export type GroupStandings = {
  group: string
  teams: TeamStats[]  // ordenado do 1º ao 4º
}

// Dados de partida simplificados para o cálculo do bracket
export type MatchData = {
  id:                  string
  phase:               string
  groupName:           string | null
  matchNumber:         number
  homeTeam:            string
  awayTeam:            string
  status:              string
  predictedHomeScore:  number | null
  predictedAwayScore:  number | null
  actualHomeScore:     number | null
  actualAwayScore:     number | null
}

function getGroupLetter(groupName: string | null): string | null {
  if (!groupName) return null
  const m = groupName.match(/Grupo\s+([A-L])/i)
  return m ? m[1].toUpperCase() : null
}

function effectiveScore(m: MatchData): { home: number | null; away: number | null } {
  if (m.status === 'finished') return { home: m.actualHomeScore, away: m.actualAwayScore }
  return { home: m.predictedHomeScore, away: m.predictedAwayScore }
}

function computeTeamStats(team: string, group: string, matches: MatchData[]): TeamStats {
  const stats: TeamStats = {
    team, group, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, position: 0,
  }

  for (const m of matches) {
    const isHome = m.homeTeam === team
    const isAway = m.awayTeam === team
    if (!isHome && !isAway) continue

    const { home, away } = effectiveScore(m)
    if (home === null || away === null) continue

    stats.played++
    const teamGoals = isHome ? home : away
    const oppGoals  = isHome ? away : home
    stats.gf += teamGoals
    stats.ga += oppGoals
    stats.gd  = stats.gf - stats.ga

    if (teamGoals > oppGoals) { stats.won++;   stats.pts += 3 }
    else if (teamGoals === oppGoals) { stats.drawn++; stats.pts += 1 }
    else { stats.lost++ }
  }

  return stats
}

function sortTeamsInGroup(teams: TeamStats[], groupMatches: MatchData[]): TeamStats[] {
  const sorted = [...teams].sort((a, b) => {
    // 1. Pontos
    if (b.pts !== a.pts) return b.pts - a.pts
    // 2. Saldo de gols
    if (b.gd !== a.gd) return b.gd - a.gd
    // 3. Gols marcados
    if (b.gf !== a.gf) return b.gf - a.gf
    // 4. Confronto direto (simplificado: pts h2h quando somente 2 times empatados)
    const h2h = getH2HPts(a.team, b.team, groupMatches)
    if (h2h !== 0) return h2h  // positivo = b ganhou h2h
    // 5. Alfabético
    return a.team.localeCompare(b.team, 'pt-BR')
  })

  sorted.forEach((t, i) => { t.position = i + 1 })
  return sorted
}

function getH2HPts(teamA: string, teamB: string, matches: MatchData[]): number {
  // Retorna positivo se B tem mais pontos h2h que A (para sort DESC por B)
  let aPts = 0, bPts = 0
  for (const m of matches) {
    if (!((m.homeTeam === teamA && m.awayTeam === teamB) || (m.homeTeam === teamB && m.awayTeam === teamA))) continue
    const { home, away } = effectiveScore(m)
    if (home === null || away === null) continue

    const aIsHome = m.homeTeam === teamA
    const aGoals  = aIsHome ? home : away
    const bGoals  = aIsHome ? away : home

    if (aGoals > bGoals) aPts += 3
    else if (aGoals === bGoals) { aPts += 1; bPts += 1 }
    else bPts += 3
  }
  return bPts - aPts
}

export function computeGroupStandings(allMatches: MatchData[]): GroupStandings[] {
  const groupMatches = allMatches.filter(m => m.phase === 'group')

  return Object.entries(COPA_GROUPS).map(([group, teams]) => {
    const gm      = groupMatches.filter(m => getGroupLetter(m.groupName) === group)
    const stats   = teams.map(t => computeTeamStats(t, group, gm))
    const sorted  = sortTeamsInGroup(stats, gm)
    return { group, teams: sorted }
  })
}

// ─── Resolução do chaveamento ──────────────────────────────────────────────────

function resolveLabel(
  label:    string,
  standings: GroupStandings[],
  thirds:   TeamStats[],
  tbd:      { n: number },
): string | null {
  // "1º Grupo A", "2º Grupo B"
  const posGroup = label.match(/(\d+)[ºª°]\s+Grupo\s+([A-L])/i)
  if (posGroup) {
    const pos   = parseInt(posGroup[1]) - 1
    const group = posGroup[2].toUpperCase()
    return standings.find(s => s.group === group)?.teams[pos]?.team ?? null
  }
  // "3º Lugar (TBD)" ou "3° Lugar"
  if (/3[ºª°]\s+Lugar/i.test(label)) {
    const team = thirds[tbd.n]?.team ?? null
    tbd.n++
    return team
  }
  return null
}

function matchWinner(m: MatchData): string | null {
  const { home, away } = effectiveScore(m)
  if (home === null || away === null) return null
  if (home > away) return m.homeTeam
  if (away > home) return m.awayTeam
  return null  // empate → indefinido em mata-mata
}

function matchLoser(m: MatchData): string | null {
  const { home, away } = effectiveScore(m)
  if (home === null || away === null) return null
  if (home > away) return m.awayTeam
  if (away > home) return m.homeTeam
  return null
}

export type BracketProjection = Record<string, { home: string | null; away: string | null }>

export function computeBracketProjection(
  allMatches:    MatchData[],
  groupStandings: GroupStandings[],
): BracketProjection {
  const proj: BracketProjection = {}

  // Todos os 3ºs colocados, ranqueados por pts → sg → gp
  const thirds = groupStandings
    .map(gs => gs.teams[2])
    .filter(Boolean)
    .sort((a, b) =>
      b.pts !== a.pts ? b.pts - a.pts :
      b.gd  !== a.gd  ? b.gd  - a.gd :
      b.gf  !== a.gf  ? b.gf  - a.gf : 0,
    )

  const sortByNum = (ms: MatchData[]) => [...ms].sort((a, b) => a.matchNumber - b.matchNumber)

  const r32 = sortByNum(allMatches.filter(m => m.phase === 'round_of_32'))
  const r16 = sortByNum(allMatches.filter(m => m.phase === 'round_of_16'))
  const qf  = sortByNum(allMatches.filter(m => m.phase === 'quarter_final'))
  const sf  = sortByNum(allMatches.filter(m => m.phase === 'semi_final'))
  const tp  = allMatches.filter(m => m.phase === 'third_place')
  const fin = allMatches.filter(m => m.phase === 'final')

  const tbd = { n: 0 }

  // R32: resolve labels de grupo
  const r32res = r32.map(m => {
    const home = resolveLabel(m.homeTeam, groupStandings, thirds, tbd)
    const away = resolveLabel(m.awayTeam, groupStandings, thirds, tbd)
    proj[m.id] = { home, away }
    return { ...m, homeTeam: home ?? m.homeTeam, awayTeam: away ?? m.awayTeam }
  })

  // R16: vencedores dos pares de R32
  const r16res = r16.map((m, i) => {
    const h = r32res[i * 2]     ? matchWinner(r32res[i * 2])     : null
    const a = r32res[i * 2 + 1] ? matchWinner(r32res[i * 2 + 1]) : null
    proj[m.id] = { home: h, away: a }
    return { ...m, homeTeam: h ?? m.homeTeam, awayTeam: a ?? m.awayTeam }
  })

  // QF: vencedores dos pares de R16
  const qfres = qf.map((m, i) => {
    const h = r16res[i * 2]     ? matchWinner(r16res[i * 2])     : null
    const a = r16res[i * 2 + 1] ? matchWinner(r16res[i * 2 + 1]) : null
    proj[m.id] = { home: h, away: a }
    return { ...m, homeTeam: h ?? m.homeTeam, awayTeam: a ?? m.awayTeam }
  })

  // SF: vencedores dos pares de QF
  const sfres = sf.map((m, i) => {
    const h = qfres[i * 2]     ? matchWinner(qfres[i * 2])     : null
    const a = qfres[i * 2 + 1] ? matchWinner(qfres[i * 2 + 1]) : null
    proj[m.id] = { home: h, away: a }
    return { ...m, homeTeam: h ?? m.homeTeam, awayTeam: a ?? m.awayTeam }
  })

  // 3º lugar: perdedores das semifinais
  if (tp[0]) proj[tp[0].id] = {
    home: sfres[0] ? matchLoser(sfres[0]) : null,
    away: sfres[1] ? matchLoser(sfres[1]) : null,
  }

  // Final: vencedores das semifinais
  if (fin[0]) proj[fin[0].id] = {
    home: sfres[0] ? matchWinner(sfres[0]) : null,
    away: sfres[1] ? matchWinner(sfres[1]) : null,
  }

  return proj
}
