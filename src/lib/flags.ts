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
  // Países adicionais (sorteio atualizado)
  'Curaçao':          'cw',
  'Costa do Marfim':  'ci',
  'Países Baixos':    'nl',
  'Egito':            'eg',
  'Suécia':           'se',
  'Irã':              'ir',
  'Cabo Verde':       'cv',
  'Uruguai':          'uy',
  'Iraque':           'iq',
  'Noruega':          'no',
  'Rep. D. do Congo': 'cd',
  'Áustria':          'at',
  'Jordânia':         'jo',
  'Uzbequistão':      'uz',
  'Croácia':          'hr',
  'Gana':             'gh',
  // Variações de nome que podem existir no banco
  'Congo DR':           'cd',
  'Holanda':            'nl',
  'Costa Marfim':       'ci',
  'Nigéria':            'ng',
  'Bósnia e Herzegovina': 'ba',
  'Geórgia':            'ge',
  'Hungria':            'hu',
  'Eslováquia':         'sk',
  'Eslovênia':          'si',
  'Dinarmarca':         'dk',
  'Dinamarca':          'dk',
  'Sérvia':             'rs',
  'Portugal':           'pt',
  'Polônia':            'pl',
  'Bélgica':            'be',
  'Alemanha':           'de',
  'França':             'fr',
  'Inglaterra':         'gb',
  'Coreia do Sul':      'kr',
  'Rep. Tcheca':        'cz',
  'República Tcheca':   'cz',
  'África do Sul':      'za',
  'México':             'mx',
  'Colômbia':           'co',
  'Equador':            'ec',
  'Brasil':             'br',
  'Argentina':          'ar',
  'Uruguai':            'uy',
  'Chile':              'cl',
  'Bolívia':            'bo',
  'Peru':               'pe',
  'Venezuela':          've',
  'Paraguai':           'py',
  'EUA':                'us',
  'Canadá':             'ca',
  'Jamaica':            'jm',
  'Japão':              'jp',
  'Austrália':          'au',
  'Marrocos':           'ma',
  'Senegal':            'sn',
  'Costa do Marfim':    'ci',
  'Egito':              'eg',
  'Gana':               'gh',
  'Camarões':           'cm',
  'Espanha':            'es',
  'Portugal':           'pt',
  'Irã':                'ir',
  'Iraque':             'iq',
  'Jordânia':           'jo',
  'Arábia Saudita':     'sa',
  'Qatar':              'qa',
  'Catar':              'qa',
  'Uzbequistão':        'uz',
  'Turquia':            'tr',
  'Croácia':            'hr',
  'Suíça':              'ch',
  'Suécia':             'se',
  'Noruega':            'no',
  'Áustria':            'at',
  'Escócia':            'gb',
  'Romênia':            'ro',
  'Ucrânia':            'ua',
  'Nova Zelândia':      'nz',
  'Países Baixos':      'nl',

  // Placeholder mata-mata
  'A Definir':          '',
  'TBD':                '',
}

// Tamanhos válidos no flagcdn.com
const VALID_SIZES = [16, 20, 24, 32, 40, 48, 64, 80, 96, 128]

function snapSize(size: number): number {
  return VALID_SIZES.reduce((prev, curr) =>
    Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
  )
}

export function getFlagUrl(teamName: string, size: number = 40): string {
  const code = TEAM_ISO[teamName]
  if (!code) return ''
  return `https://flagcdn.com/w${snapSize(size)}/${code}.png`
}
