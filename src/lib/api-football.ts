/**
 * Cliente tipado para a API-Football (api-sports.io)
 * Docs: https://www.api-football.com/documentation-v3
 *
 * Auth: header  x-apisports-key: <API_FOOTBALL_KEY>
 * Base: https://v3.football.api-sports.io
 * Rate: Free plan → 100 req/dia; cada req retorna os headers:
 *   x-ratelimit-requests-remaining  (saldo diário)
 *   X-RateLimit-Remaining           (saldo por minuto)
 */

const BASE_URL = 'https://v3.football.api-sports.io'

// ─── Status codes ────────────────────────────────────────────────────────────

/** Status de partida ao vivo */
export const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'])

/** Status de partida encerrada (com resultado oficial) */
export const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN'])

export type MatchResultCode = 'FT' | 'AET' | 'PEN'

// ─── Tipos de resposta da API ────────────────────────────────────────────────

export interface ApiFixtureStatus {
  long:    string
  short:   string
  elapsed: number | null
  extra:   number | null
}

export interface ApiScore {
  home: number | null
  away: number | null
}

export interface ApiTeam {
  id:     number
  name:   string
  logo:   string
  winner: boolean | null
}

export interface ApiFixture {
  fixture: {
    id:        number
    referee:   string | null
    timezone:  string
    date:      string        // ISO 8601 UTC
    timestamp: number
    status:    ApiFixtureStatus
  }
  league: {
    id:     number
    name:   string
    season: number
    round:  string           // "Group Stage - 1", "Round of 32", "Final", …
  }
  teams: {
    home: ApiTeam
    away: ApiTeam
  }
  goals: ApiScore
  score: {
    halftime:  ApiScore
    fulltime:  ApiScore      // Placar aos 90 min (base do bolão)
    extratime: ApiScore
    penalty:   ApiScore
  }
}

export interface ApiRateLimits {
  dailyRemaining:  number | null
  minuteRemaining: number | null
}

export interface ApiFixturesResponse {
  results:       number
  fixtures:      ApiFixture[]
  rateLimits:    ApiRateLimits
}

// ─── Mapeamento de nome (inglês API → português DB) ──────────────────────────

/**
 * A API-Football retorna nomes em inglês.
 * Mapeamos para os nomes portugueses usados no seed (e no banco de dados).
 * Inclui variantes comuns para cobrir diferenças de nomenclatura.
 */
export const TEAM_NAME_MAP: Record<string, string> = {
  // Grupo A
  'Mexico':                          'México',
  'South Africa':                    'África do Sul',
  'Korea Republic':                  'Coreia do Sul',
  'South Korea':                     'Coreia do Sul',
  'Republic of Korea':               'Coreia do Sul',
  'Czech Republic':                  'Rep. Tcheca',
  'Czechia':                         'Rep. Tcheca',
  // Grupo B
  'Canada':                          'Canadá',
  'Bosnia and Herzegovina':          'Bósnia',
  'Bosnia':                          'Bósnia',
  'Qatar':                           'Catar',
  'Switzerland':                     'Suíça',
  // Grupo C
  'Brazil':                          'Brasil',
  'Morocco':                         'Marrocos',
  'Haiti':                           'Haiti',
  'Scotland':                        'Escócia',
  // Grupo D
  'USA':                             'EUA',
  'United States':                   'EUA',
  'Paraguay':                        'Paraguai',
  'Australia':                       'Austrália',
  'Turkey':                          'Turquia',
  'Turkiye':                         'Turquia',
  // Grupo E
  'Germany':                         'Alemanha',
  'Curacao':                         'Curaçao',
  'Curaçao':                         'Curaçao',
  "Cote d'Ivoire":                   'Costa do Marfim',
  'Ivory Coast':                     'Costa do Marfim',
  'Ecuador':                         'Equador',
  // Grupo F
  'Netherlands':                     'Países Baixos',
  'Japan':                           'Japão',
  'Sweden':                          'Suécia',
  'Tunisia':                         'Tunísia',
  // Grupo G
  'Belgium':                         'Bélgica',
  'Egypt':                           'Egito',
  'Iran':                            'Irã',
  'IR Iran':                         'Irã',
  'New Zealand':                     'Nova Zelândia',
  // Grupo H
  'Spain':                           'Espanha',
  'Cape Verde':                      'Cabo Verde',
  'Saudi Arabia':                    'Arábia Saudita',
  'Uruguay':                         'Uruguai',
  // Grupo I
  'France':                          'França',
  'Senegal':                         'Senegal',
  'Iraq':                            'Iraque',
  'Norway':                          'Noruega',
  // Grupo J
  'Argentina':                       'Argentina',
  'Algeria':                         'Argélia',
  'Austria':                         'Áustria',
  'Jordan':                          'Jordânia',
  // Grupo K
  'Portugal':                        'Portugal',
  'DR Congo':                        'Rep. D. do Congo',
  'Congo DR':                        'Rep. D. do Congo',
  'Democratic Republic of Congo':    'Rep. D. do Congo',
  "Congo [DRC]":                     'Rep. D. do Congo',
  'Uzbekistan':                      'Uzbequistão',
  'Colombia':                        'Colômbia',
  // Grupo L
  'England':                         'Inglaterra',
  'Croatia':                         'Croácia',
  'Ghana':                           'Gana',
  'Panama':                          'Panamá',
}

/** Traduz o nome de um país conforme a API para o nome em português do banco. */
export function translateTeamName(apiName: string): string {
  return TEAM_NAME_MAP[apiName] ?? apiName
}

// ─── Mapeamento de round → phase ─────────────────────────────────────────────

export const ROUND_TO_PHASE: Record<string, string> = {
  'Group Stage':     'group',
  'Round of 32':     'round_of_32',
  'Round of 16':     'round_of_16',
  'Quarter-finals':  'quarter_final',
  'Semi-finals':     'semi_final',
  '3rd Place Final': 'third_place',
  'Final':           'final',
}

/**
 * Converte o campo `league.round` da API para o phase do nosso banco.
 * "Group Stage - 1" → "group"
 */
export function roundToPhase(round: string): string {
  if (round.startsWith('Group Stage')) return 'group'
  return ROUND_TO_PHASE[round] ?? 'group'
}

// ─── Extração de placar para o bolão ─────────────────────────────────────────

/**
 * Retorna o placar aos 90 minutos (base de pontuação do bolão).
 * Para FT: score.fulltime === goals (idênticos).
 * Para AET/PEN: score.fulltime tem o placar de 90 min, goals tem o final.
 * Fallback para goals se fulltime for nulo (API às vezes retarda o preenchimento).
 */
export function extractFulltimeScore(fixture: ApiFixture): { home: number; away: number } | null {
  const ft = fixture.score.fulltime
  if (ft.home !== null && ft.away !== null) {
    return { home: ft.home, away: ft.away }
  }
  const g = fixture.goals
  if (g.home !== null && g.away !== null) {
    return { home: g.home, away: g.away }
  }
  return null
}

// ─── Cliente HTTP ────────────────────────────────────────────────────────────

export class ApiFootballClient {
  private readonly headers: HeadersInit

  constructor(private readonly apiKey: string) {
    this.headers = {
      'x-apisports-key': apiKey,
      'Accept':          'application/json',
    }
  }

  async getFixtures(league: number, season: number): Promise<ApiFixturesResponse> {
    const url = `${BASE_URL}/fixtures?league=${league}&season=${season}`

    const response = await fetch(url, {
      headers: this.headers,
      // next.js cache: sem cache para sempre ter dados frescos no cron
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`API-Football HTTP ${response.status}: ${await response.text()}`)
    }

    const rateLimits: ApiRateLimits = {
      dailyRemaining:  Number(response.headers.get('x-ratelimit-requests-remaining') ?? null) || null,
      minuteRemaining: Number(response.headers.get('X-RateLimit-Remaining')           ?? null) || null,
    }

    const body = await response.json() as {
      errors:   unknown[]
      results:  number
      response: ApiFixture[]
    }

    if (body.errors && body.errors.length > 0) {
      throw new Error(`API-Football error: ${JSON.stringify(body.errors)}`)
    }

    return {
      results:    body.results,
      fixtures:   body.response,
      rateLimits,
    }
  }
}
