/**
 * Fotos de jogadores via Wikipedia REST API (principal) + TheSportsDB (fallback)
 *
 * Wikipedia: fotos reais, gratuitas, CDN Wikimedia (CC BY-SA)
 * Endpoint: https://en.wikipedia.org/api/rest_v1/page/summary/{name}
 * Retorna: thumbnail.source  → URL direta da foto no upload.wikimedia.org
 */

// Mapeamento nome interno → nome do artigo Wikipedia (inglês)
const WIKI_MAP: Record<string, string> = {
  'Cristiano Ronaldo':    'Cristiano_Ronaldo',
  'Lionel Messi':         'Lionel_Messi',
  'Kylian Mbappé':        'Kylian_Mbappé',
  'Erling Haaland':       'Erling_Haaland',
  'Vinícius Júnior':      'Vinícius_Júnior',
  'Harry Kane':           'Harry_Kane',
  'Lautaro Martínez':     'Lautaro_Martínez',
  'Robert Lewandowski':   'Robert_Lewandowski',
  'Romelu Lukaku':        'Romelu_Lukaku',
  'Mohamed Salah':        'Mohamed_Salah',
  'Son Heung-min':        'Son_Heung-min',
  'Victor Osimhen':       'Victor_Osimhen',
  'Raphinha':             'Raphinha_(footballer,_born_1996)',
  'Bukayo Saka':          'Bukayo_Saka',
  'Jude Bellingham':      'Jude_Bellingham',
  'Jamal Musiala':        'Jamal_Musiala',
  'Julián Álvarez':       'Julián_Álvarez',
  'Neymar':               'Neymar',
  'Endrick':              'Endrick_(footballer)',
  'Jonathan David':       'Jonathan_David',
  'Memphis Depay':        'Memphis_Depay',
  'Cody Gakpo':           'Cody_Gakpo',
  'Gonçalo Ramos':        'Gonçalo_Ramos',
  'Rafael Leão':          'Rafael_Leão',
  'Marcus Rashford':      'Marcus_Rashford',
  'Sadio Mané':           'Sadio_Mané',
  'Christian Pulisic':    'Christian_Pulisic',
  'Alexander Isak':       'Alexander_Isak',
  'Viktor Gyökeres':      'Viktor_Gyökeres',
  'Kai Havertz':          'Kai_Havertz',
  'Florian Wirtz':        'Florian_Wirtz',
  'Takefusa Kubo':        'Takefusa_Kubo',
  'Ayase Ueda':           'Ayase_Ueda',
  'Cole Palmer':          'Cole_Palmer_(footballer)',
  'Nicolas Jackson':      'Nicolas_Jackson_(footballer)',
  'Dušan Vlahović':       'Dušan_Vlahović',
  'Mohammed Kudus':       'Mohammed_Kudus',
  'Ousmane Dembélé':      'Ousmane_Dembélé',
  'Randal Kolo Muani':    'Randal_Kolo_Muani',
  'Mehdi Taremi':         'Mehdi_Taremi',
  'Sardar Azmoun':        'Sardar_Azmoun',
  'Almoez Ali':           'Almoez_Ali',
  'Aymen Hussein':        'Aymen_Hussein',
  'Chris Wood':           'Chris_Wood_(footballer)',
}

// Fallback TheSportsDB — nomes para busca
const SPORTSDB_MAP: Record<string, string> = {
  'Kylian Mbappé':        'Kylian Mbappe',
  'Vinícius Júnior':      'Vinicius Junior',
  'Lautaro Martínez':     'Lautaro Martinez',
  'Julián Álvarez':       'Julian Alvarez',
  'Sadio Mané':           'Sadio Mane',
  'Ousmane Dembélé':      'Ousmane Dembele',
  'Gonçalo Ramos':        'Goncalo Ramos',
  'Rafael Leão':          'Rafael Leao',
  'Dušan Vlahović':       'Dusan Vlahovic',
  'Viktor Gyökeres':      'Viktor Gyokeres',
}

type WikiSummary = {
  thumbnail?: { source: string; width: number; height: number }
  title: string
}

type SportsDbResponse = {
  player?: Array<{ strThumb?: string; strCutout?: string }>
}

// Fotos hardcoded para jogadores com problemas de carregamento via API
// Usamos URLs do Wikimedia Commons que são estáveis e livres de direitos
const STATIC_PHOTOS: Record<string, string> = {
  'Raphinha': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Raphael_Dias_Belloli_2023.jpg',
}

// Cache em memória (reset a cada deploy)
const cache = new Map<string, string | null>()

// ─── Wikipedia ────────────────────────────────────────────────────────────────

async function fetchWikipediaPhoto(playerName: string): Promise<string | null> {
  const wikiTitle = WIKI_MAP[playerName] ?? playerName.replace(/ /g, '_')
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`,
      { next: { revalidate: 86400 } } // cache 24h
    )
    if (!res.ok) return null
    const data: WikiSummary = await res.json()
    return data.thumbnail?.source ?? null
  } catch {
    return null
  }
}

// ─── TheSportsDB (fallback) ───────────────────────────────────────────────────

async function fetchSportsDbPhoto(playerName: string): Promise<string | null> {
  const searchName = SPORTSDB_MAP[playerName] ?? playerName
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(searchName)}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    const data: SportsDbResponse = await res.json()
    const p = data.player?.[0]
    return p?.strThumb ?? p?.strCutout ?? null
  } catch {
    return null
  }
}

// ─── Função principal ─────────────────────────────────────────────────────────

export async function getPlayerPhoto(playerName: string): Promise<string | null> {
  if (cache.has(playerName)) return cache.get(playerName) ?? null

  // 0. Foto hardcoded (prioridade máxima para jogadores com API inconsistente)
  if (STATIC_PHOTOS[playerName]) {
    cache.set(playerName, STATIC_PHOTOS[playerName])
    return STATIC_PHOTOS[playerName]
  }

  // 1. Tenta Wikipedia (melhor qualidade)
  let url = await fetchWikipediaPhoto(playerName)

  // 2. Fallback para TheSportsDB
  if (!url) url = await fetchSportsDbPhoto(playerName)

  cache.set(playerName, url)
  return url
}

// ─── Batch para múltiplos jogadores ──────────────────────────────────────────

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
