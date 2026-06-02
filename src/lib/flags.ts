// Mapeamento: nome do time → código ISO 2 letras (usado no flagcdn.com)
export const TEAM_ISO: Record<string, string> = {
  // Grupo A
  'México':          'mx',
  'África do Sul':   'za',
  'Coreia do Sul':   'kr',
  'Rep. Tcheca':     'cz',
  // Grupo B
  'Canadá':          'ca',
  'Bósnia':          'ba',
  'Catar':           'qa',
  'Suíça':           'ch',
  // Grupo C
  'Brasil':          'br',
  'Marrocos':        'ma',
  'Haiti':           'ht',
  'Escócia':         'gb-sct',
  // Grupo D
  'EUA':             'us',
  'Paraguai':        'py',
  'Austrália':       'au',
  'Turquia':         'tr',
  // Grupo E
  'Argentina':       'ar',
  'Arábia Saudita':  'sa',
  'Romênia':         'ro',
  'Venezuela':       've',
  // Grupo F
  'Espanha':         'es',
  'Argélia':         'dz',
  'Senegal':         'sn',
  'Nova Zelândia':   'nz',
  // Grupo G
  'Portugal':        'pt',
  'Polônia':         'pl',
  'Costa Rica':      'cr',
  'Burkina Faso':    'bf',
  // Grupo H
  'Bélgica':         'be',
  'Guatemala':       'gt',
  'Ucrânia':         'ua',
  'Ruanda':          'rw',
  // Grupo I
  'Japão':           'jp',
  'Jamaica':         'jm',
  'Peru':            'pe',
  'Barém':           'bh',
  // Grupo J
  'Alemanha':        'de',
  'Camarões':        'cm',
  'Equador':         'ec',
  'Eslováquia':      'sk',
  // Grupo K
  'Inglaterra':      'gb-eng',
  'Tunísia':         'tn',
  'Rep. Dominicana': 'do',
  'Panamá':          'pa',
  // Grupo L
  'França':          'fr',
  'Colômbia':        'co',
  'Irlanda':         'ie',
  'Tanzânia':        'tz',
  // Placeholder mata-mata
  'A Definir':       '',
  'TBD':             '',
}

export function getFlagUrl(teamName: string, size: number = 40): string {
  const code = TEAM_ISO[teamName]
  if (!code) return ''
  return `https://flagcdn.com/w${size}/${code}.png`
}
