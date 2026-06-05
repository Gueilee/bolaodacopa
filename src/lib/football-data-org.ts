/**
 * Cliente para football-data.org v4 — gratuito, sem custo.
 *
 * Auth  : header X-Auth-Token: <FOOTBALL_DATA_KEY>
 * Base  : https://api.football-data.org/v4
 * Rate  : Free → 10 req/min (1 req/sync é suficiente)
 * WC    : competition code "WC", season 2026
 *
 * Docs  : https://docs.football-data.org/general/v4/index.html
 */

const BASE_URL = 'https://api.football-data.org/v4'

// ─── Status ───────────────────────────────────────────────────────────────────

export const LIVE_STATUSES = new Set([
  'IN_PLAY', 'PAUSED', 'EXTRA_TIME', 'PENALTY_SHOOTOUT',
])

export const FINISHED_STATUSES = new Set(['FINISHED'])

// ─── Tipos de resposta ────────────────────────────────────────────────────────

export interface FdScore {
  winner:   'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
  duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT' | null
  fullTime: { home: number | null; away: number | null }
  halfTime: { home: number | null; away: number | null }
}

export interface FdTeam {
  id:        number
  name:      string
  shortName: string | null
  tla:       string | null
  crest:     string | null
}

export interface FdGoal {
  minute:     number | null
  injuryTime: number | null
  type:       'REGULAR' | 'PENALTY' | 'OWN_GOAL'
  team:       { id: number; name: string }
  scorer:     { id: number; name: string }
  assist:     { id: number; name: string } | null
  score:      { home: number; away: number }
}

export interface FdBooking {
  minute: number | null
  team:   { id: number; name: string }
  player: { id: number; name: string }
  card:   'YELLOW' | 'RED' | 'YELLOW_RED'
}

export interface FdSubstitution {
  minute:    number | null
  team:      { id: number; name: string }
  playerOut: { id: number; name: string }
  playerIn:  { id: number; name: string }
}

export interface FdMatch {
  id:          number
  utcDate:     string
  status:      string
  minute:      number | null
  injuryTime:  number | null
  stage:       string
  group:       string | null
  lastUpdated: string
  homeTeam:    FdTeam
  awayTeam:    FdTeam
  score:       FdScore
  goals:       FdGoal[]
  bookings:    FdBooking[]
  substitutions: FdSubstitution[]
}

export interface FdMatchesResponse {
  count:   number
  matches: FdMatch[]
}

// ─── Mapeamento stage → phase ─────────────────────────────────────────────────

export const STAGE_TO_PHASE: Record<string, string> = {
  'GROUP_STAGE':      'group',
  'LAST_32':          'round_of_32',
  'LAST_16':          'round_of_16',
  'QUARTER_FINALS':   'quarter_final',
  'SEMI_FINALS':      'semi_final',
  'THIRD_PLACE':      'third_place',
  'FINAL':            'final',
}

export function stageToPhase(stage: string): string {
  return STAGE_TO_PHASE[stage] ?? 'group'
}

// ─── Mapeamento duration → matchResult ───────────────────────────────────────

export type MatchResultCode = 'FT' | 'AET' | 'PEN'

export function durationToResult(duration: string | null): MatchResultCode {
  if (duration === 'EXTRA_TIME')       return 'AET'
  if (duration === 'PENALTY_SHOOTOUT') return 'PEN'
  return 'FT'
}

// ─── Mapeamento de nomes (inglês API → português DB) ─────────────────────────

export const TEAM_NAME_MAP: Record<string, string> = {
  // A
  'Mexico':                           'México',
  'South Africa':                     'África do Sul',
  'Korea Republic':                   'Coreia do Sul',
  'Republic of Korea':                'Coreia do Sul',
  'Czech Republic':                   'Rep. Tcheca',
  'Czechia':                          'Rep. Tcheca',
  // B
  'Canada':                           'Canadá',
  'Bosnia and Herzegovina':           'Bósnia',
  'Qatar':                            'Catar',
  'Switzerland':                      'Suíça',
  // C
  'Brazil':                           'Brasil',
  'Morocco':                          'Marrocos',
  // D
  'USA':                              'EUA',
  'United States':                    'EUA',
  'Paraguay':                         'Paraguai',
  'Australia':                        'Austrália',
  'Turkey':                           'Turquia',
  'Türkiye':                          'Turquia',
  // E
  'Germany':                          'Alemanha',
  'Curaçao':                          'Curaçao',
  "Côte d'Ivoire":                    'Costa do Marfim',
  "Cote d'Ivoire":                    'Costa do Marfim',
  'Ivory Coast':                      'Costa do Marfim',
  'Ecuador':                          'Equador',
  // F
  'Netherlands':                      'Países Baixos',
  'Japan':                            'Japão',
  'Sweden':                           'Suécia',
  'Tunisia':                          'Tunísia',
  // G
  'Belgium':                          'Bélgica',
  'Egypt':                            'Egito',
  'Iran':                             'Irã',
  'IR Iran':                          'Irã',
  'New Zealand':                      'Nova Zelândia',
  // H
  'Spain':                            'Espanha',
  'Cape Verde':                       'Cabo Verde',
  'Saudi Arabia':                     'Arábia Saudita',
  'Uruguay':                          'Uruguai',
  // I
  'France':                           'França',
  'Iraq':                             'Iraque',
  'Norway':                           'Noruega',
  // J
  'Argentina':                        'Argentina',
  'Algeria':                          'Argélia',
  'Austria':                          'Áustria',
  'Jordan':                           'Jordânia',
  // K
  'Portugal':                         'Portugal',
  'DR Congo':                         'Rep. D. do Congo',
  'Congo DR':                         'Rep. D. do Congo',
  'Democratic Republic of Congo':     'Rep. D. do Congo',
  'Uzbekistan':                       'Uzbequistão',
  'Colombia':                         'Colômbia',
  // L
  'England':                          'Inglaterra',
  'Croatia':                          'Croácia',
  'Ghana':                            'Gana',
  'Panama':                           'Panamá',
  // Outros comuns
  'Serbia':                           'Sérvia',
  'Denmark':                          'Dinamarca',
  'Poland':                           'Polônia',
  'Nigeria':                          'Nigéria',
  'Cameroon':                         'Camarões',
  'Romania':                          'Romênia',
  'Scotland':                         'Escócia',
  'Haiti':                            'Haiti',
  'Senegal':                          'Senegal',
  'Costa Rica':                       'Costa Rica',
  'Venezuela':                        'Venezuela',
  'Honduras':                         'Honduras',
  'Jamaica':                          'Jamaica',
  'Chile':                            'Chile',
  'Peru':                             'Peru',
  'Bolivia':                          'Bolívia',
  'Cuba':                             'Cuba',
  'El Salvador':                      'El Salvador',
  'Guatemala':                        'Guatemala',
  'Trinidad and Tobago':              'Trinidad e Tobago',
}

export function translateTeamName(name: string): string {
  return TEAM_NAME_MAP[name] ?? name
}

// ─── Extração do placar de 90 min ─────────────────────────────────────────────

export function extractFulltimeScore(match: FdMatch): { home: number; away: number } | null {
  const ft = match.score.fullTime
  if (ft.home !== null && ft.away !== null) {
    return { home: ft.home, away: ft.away }
  }
  return null
}

// ─── Cliente HTTP ─────────────────────────────────────────────────────────────

export class FootballDataClient {
  private readonly headers: HeadersInit

  constructor(apiKey: string) {
    this.headers = {
      'X-Auth-Token': apiKey,
      'Accept':       'application/json',
      // Solicita todos os eventos inline (gols, cartões, substituições)
      'X-Unfold-Goals':    'true',
      'X-Unfold-Bookings': 'true',
      'X-Unfold-Subs':     'true',
    }
  }

  async getWCMatches(season = 2026): Promise<FdMatchesResponse> {
    const url = `${BASE_URL}/competitions/WC/matches?season=${season}`

    const res = await fetch(url, {
      headers:   this.headers,
      cache:     'no-store',
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`football-data.org HTTP ${res.status}: ${body}`)
    }

    return res.json() as Promise<FdMatchesResponse>
  }
}
