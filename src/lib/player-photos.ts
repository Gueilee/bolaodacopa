/**
 * Fotos de jogadores via TheSportsDB (API gratuita, sem auth obrigatório)
 * Doc: https://www.thesportsdb.com/api.php
 */

// Mapeamento nome interno → nome de busca no TheSportsDB
// Necessário para nomes com acentos, abreviações ou grafias diferentes
const SEARCH_MAP: Record<string, string> = {
  'Cristiano Ronaldo':    'Cristiano Ronaldo',
  'Lionel Messi':         'Lionel Messi',
  'Kylian Mbappé':        'Kylian Mbappe',
  'Erling Haaland':       'Erling Haaland',
  'Vinícius Júnior':      'Vinicius Junior',
  'Harry Kane':           'Harry Kane',
  'Lautaro Martínez':     'Lautaro Martinez',
  'Robert Lewandowski':   'Robert Lewandowski',
  'Romelu Lukaku':        'Romelu Lukaku',
  'Mohamed Salah':        'Mohamed Salah',
  'Son Heung-min':        'Son Heung-Min',
  'Victor Osimhen':       'Victor Osimhen',
  'Raphinha':             'Raphinha',
  'Bukayo Saka':          'Bukayo Saka',
  'Jude Bellingham':      'Jude Bellingham',
  'Jamal Musiala':        'Jamal Musiala',
  'Julián Álvarez':       'Julian Alvarez',
  'Neymar':               'Neymar',
  'Endrick':              'Endrick',
  'Jonathan David':       'Jonathan David',
  'Memphis Depay':        'Memphis Depay',
  'Cody Gakpo':           'Cody Gakpo',
  'Gonçalo Ramos':        'Goncalo Ramos',
  'Rafael Leão':          'Rafael Leao',
  'Marcus Rashford':      'Marcus Rashford',
  'Sadio Mané':           'Sadio Mane',
  'Christian Pulisic':    'Christian Pulisic',
  'Alexander Isak':       'Alexander Isak',
  'Viktor Gyökeres':      'Viktor Gyokeres',
  'Kai Havertz':          'Kai Havertz',
  'Florian Wirtz':        'Florian Wirtz',
  'Takefusa Kubo':        'Takefusa Kubo',
  'Ayase Ueda':           'Ayase Ueda',
  'Cole Palmer':          'Cole Palmer',
  'Nicolas Jackson':      'Nicolas Jackson',
  'Dušan Vlahović':       'Dusan Vlahovic',
  'Mohammed Kudus':       'Mohammed Kudus',
  'Ousmane Dembélé':      'Ousmane Dembele',
  'Randal Kolo Muani':    'Randal Kolo Muani',
}

type SportsDbPlayer = {
  idPlayer:     string
  strPlayer:    string
  strThumb:     string | null
  strCutout:    string | null
  strNationality: string | null
}

type SportsDbResponse = {
  player: SportsDbPlayer[] | null
}

// Cache em memória para evitar requisições repetidas
const photoCache = new Map<string, string | null>()

export async function getPlayerPhoto(playerName: string): Promise<string | null> {
  if (photoCache.has(playerName)) return photoCache.get(playerName) ?? null

  const searchName = SEARCH_MAP[playerName] ?? playerName
  const encoded    = encodeURIComponent(searchName)

  try {
    const res  = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encoded}`,
      { next: { revalidate: 86400 } } // cache 24h
    )
    if (!res.ok) { photoCache.set(playerName, null); return null }

    const data: SportsDbResponse = await res.json()
    const player = data.player?.[0]
    const url    = player?.strThumb || player?.strCutout || null

    photoCache.set(playerName, url)
    return url
  } catch {
    photoCache.set(playerName, null)
    return null
  }
}

// Busca em batch para os 50 jogadores
export async function getPlayerPhotos(
  players: { name: string }[],
): Promise<Record<string, string>> {
  const results: Record<string, string> = {}

  await Promise.allSettled(
    players.map(async ({ name }) => {
      const url = await getPlayerPhoto(name)
      if (url) results[name] = url
    })
  )

  return results
}
