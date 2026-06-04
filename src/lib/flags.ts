// Mapeamento: nome do time → código ISO (flagcdn.com)
export const TEAM_ISO: Record<string, string> = {
  // América do Sul
  'Brasil':               'br',
  'Argentina':            'ar',
  'Uruguai':              'uy',
  'Colômbia':             'co',
  'Equador':              'ec',
  'Venezuela':            've',
  'Chile':                'cl',
  'Paraguai':             'py',
  'Peru':                 'pe',
  'Bolívia':              'bo',

  // América do Norte / Central
  'EUA':                  'us',
  'México':               'mx',
  'Canadá':               'ca',
  'Jamaica':              'jm',
  'Costa Rica':           'cr',
  'Panamá':               'pa',
  'Honduras':             'hn',
  'Rep. Dominicana':      'do',
  'Guatemala':            'gt',
  'Curaçao':              'cw',

  // Europa
  'França':               'fr',
  'Alemanha':             'de',
  'Espanha':              'es',
  'Portugal':             'pt',
  'Inglaterra':           'gb',
  'Holanda':              'nl',
  'Países Baixos':        'nl',
  'Bélgica':              'be',
  'Croácia':              'hr',
  'Suíça':                'ch',
  'Itália':               'it',
  'Dinamarca':            'dk',
  'Dinarmarca':           'dk',
  'Sérvia':               'rs',
  'Polônia':              'pl',
  'Suécia':               'se',
  'Noruega':              'no',
  'Áustria':              'at',
  'Turquia':              'tr',
  'Hungria':              'hu',
  'Escócia':              'gb',
  'Eslováquia':           'sk',
  'Eslovênia':            'si',
  'Romênia':              'ro',
  'Ucrânia':              'ua',
  'Geórgia':              'ge',
  'Albânia':              'al',
  'Bósnia':               'ba',
  'Bósnia e Herzegovina': 'ba',
  'Irlanda':              'ie',

  // África
  'Marrocos':             'ma',
  'Senegal':              'sn',
  'Costa do Marfim':      'ci',
  'Costa Marfim':         'ci',
  'Egito':                'eg',
  'Nigéria':              'ng',
  'Camarões':             'cm',
  'Gana':                 'gh',
  'Mali':                 'ml',
  'Argélia':              'dz',
  'Tunísia':              'tn',
  'África do Sul':        'za',
  'Cabo Verde':           'cv',
  'Rep. D. do Congo':     'cd',
  'Congo DR':             'cd',
  'Tanzânia':             'tz',
  'Ruanda':               'rw',
  'Burkina Faso':         'bf',

  // Ásia / Oceania
  'Japão':                'jp',
  'Coreia do Sul':        'kr',
  'Irã':                  'ir',
  'Arábia Saudita':       'sa',
  'Austrália':            'au',
  'Qatar':                'qa',
  'Catar':                'qa',
  'Iraque':               'iq',
  'Jordânia':             'jo',
  'Uzbequistão':          'uz',
  'Nova Zelândia':        'nz',
  'Barém':                'bh',
  'China':                'cn',

  // Variações de nomes
  'Rep. Tcheca':          'cz',
  'República Tcheca':     'cz',
  'Haiti':                'ht',

  // Placeholder mata-mata
  'A Definir':            '',
  'TBD':                  '',
}

// Tamanhos suportados pelo flagcdn.com
const VALID_SIZES = [16, 20, 24, 32, 40, 48, 64, 80, 96, 128]

function snapSize(size: number): number {
  return VALID_SIZES.reduce((prev, curr) =>
    Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev,
    VALID_SIZES[0],
  )
}

export function getFlagUrl(teamName: string, size = 40): string {
  const code = TEAM_ISO[teamName]
  if (!code) return ''
  return `https://flagcdn.com/w${snapSize(size)}/${code}.png`
}
