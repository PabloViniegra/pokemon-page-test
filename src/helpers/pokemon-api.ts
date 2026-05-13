import type {
  PokemonResultList,
  PokemonDetail,
  PokemonSpeciesInfo,
  AbilityDetail,
  EvolutionChainRaw,
  EvolutionNode,
  EvolutionStage,
} from '../types/pokemon'

const POKEMON_API_BASE = 'https://pokeapi.co/api/v2'

export async function getPokemonsList(
  limit = 20,
  offset = 0,
): Promise<PokemonResultList> {
  const url = `${POKEMON_API_BASE}/pokemon?limit=${limit}&offset=${offset}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch pokemons: ${response.status} ${response.statusText}`,
    )
  }

  return (await response.json()) as PokemonResultList
}

export async function getPokemonDetail(
  nameOrId: string | number,
): Promise<PokemonDetail> {
  const url = `${POKEMON_API_BASE}/pokemon/${nameOrId}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch pokemon detail: ${response.status} ${response.statusText}`,
    )
  }

  return (await response.json()) as PokemonDetail
}

export async function getPokemonSpecies(
  url: string,
): Promise<PokemonSpeciesInfo> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch pokemon species: ${response.status} ${response.statusText}`,
    )
  }

  return (await response.json()) as PokemonSpeciesInfo
}

export async function getPokemonsByType(
  type: string,
): Promise<PokemonResultList> {
  const url = `${POKEMON_API_BASE}/type/${type}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch pokemons by type: ${response.status} ${response.statusText}`,
    )
  }

  const data = (await response.json()) as {
    pokemon: { pokemon: { name: string; url: string } }[]
  }
  return {
    count: data.pokemon.length,
    next: null,
    previous: null,
    results: data.pokemon.map((p) => p.pokemon),
  }
}

export function getPokemonId(url: string): number {
  const parts = url.split('/').filter(Boolean)
  return Number(parts[parts.length - 1])
}

export function getPokemonImageUrl(id: number, shiny = false): string {
  if (shiny) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

export function getPokemonSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
}

export async function getAbilityDetail(name: string): Promise<AbilityDetail> {
  const url = `${POKEMON_API_BASE}/ability/${name}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ability: ${response.status} ${response.statusText}`,
    )
  }

  return (await response.json()) as AbilityDetail
}

export async function getEvolutionChain(
  url: string,
): Promise<EvolutionChainRaw> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch evolution chain: ${response.status} ${response.statusText}`,
    )
  }

  return (await response.json()) as EvolutionChainRaw
}

export function parseEvolutionChain(
  chain: EvolutionChainRaw['chain'],
): EvolutionNode {
  return {
    speciesName: chain.species.name,
    speciesId: getPokemonId(chain.species.url),
    imageUrl: getPokemonImageUrl(getPokemonId(chain.species.url)),
    details: chain.evolution_details,
    isBaby: chain.is_baby,
    evolvesTo: chain.evolves_to.map((evo) => parseEvolutionChain(evo)),
  }
}

function formatName(name: string): string {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function formatEvolutionDetails(
  details: EvolutionNode['details'],
): string {
  if (!details || details.length === 0) return ''
  const d = details[0]
  switch (d.trigger?.name) {
    case 'level-up':
      if (d.min_level) return `Level ${d.min_level}`
      if (d.min_happiness) return `High friendship`
      if (d.min_affection) return `High affection`
      if (d.known_move) return `Knows ${formatName(d.known_move.name)}`
      if (d.known_move_type)
        return `Knows ${formatName(d.known_move_type.name)} move`
      if (d.location) return `Level up at ${formatName(d.location.name)}`
      if (d.time_of_day) return `Level up (${d.time_of_day})`
      if (d.needs_overworld_rain) return `Level up (rain)`
      if (d.relative_physical_stats === 1) return `Level up (Atk > Def)`
      if (d.relative_physical_stats === -1) return `Level up (Def > Atk)`
      if (d.relative_physical_stats === 0) return `Level up (Atk = Def)`
      if (d.party_species)
        return `Level up with ${formatName(d.party_species.name)}`
      if (d.party_type)
        return `Level up with ${formatName(d.party_type.name)} type`
      if (d.turn_upside_down) return `Level up (upside down)`
      if (d.gender === 1) return `Level up (female)`
      if (d.gender === 2) return `Level up (male)`
      return 'Level up'
    case 'trade':
      if (d.held_item)
        return `Trade holding ${formatName(d.held_item.name)}`
      if (d.trade_species)
        return `Trade for ${formatName(d.trade_species.name)}`
      return 'Trade'
    case 'use-item':
      return d.item ? `Use ${formatName(d.item.name)}` : 'Use item'
    case 'shed':
      return 'Shed'
    case 'spin':
      return 'Spin'
    case 'tower-of-darkness':
      return 'Tower of Darkness'
    case 'tower-of-waters':
      return 'Tower of Waters'
    case 'three-critical-hits':
      return 'Land 3 critical hits'
    case 'take-damage':
      return 'Take damage'
    case 'other':
      return 'Special condition'
    default:
      return d.trigger?.name ? formatName(d.trigger.name) : ''
  }
}

export function computeEvolutionStages(root: EvolutionNode): EvolutionStage[] {
  const stages: EvolutionStage[] = []

  function traverse(
    node: EvolutionNode,
    depth: number,
    parentId: number | null,
    condition: string,
  ) {
    if (!stages[depth]) {
      stages[depth] = { depth, entries: [] }
    }
    stages[depth].entries.push({ node, condition, parentId })

    for (const child of node.evolvesTo) {
      traverse(
        child,
        depth + 1,
        node.speciesId,
        formatEvolutionDetails(child.details),
      )
    }
  }

  traverse(root, 0, null, '')
  return stages.filter(Boolean)
}

export async function getAllDefaultPokemonWithTypes(): Promise<
  Array<{ id: number; name: string; types: string[] }>
> {
  const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query {
          pokemon_v2_pokemon(where: {is_default: {_eq: true}}, limit: 2000) {
            id
            name
            pokemon_v2_pokemontypes {
              pokemon_v2_type {
                name
              }
            }
          }
        }
      `,
    }),
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Pokemon types via GraphQL: ${response.status} ${response.statusText}`,
    )
  }

  const json = (await response.json()) as {
    data?: {
      pokemon_v2_pokemon: Array<{
        id: number
        name: string
        pokemon_v2_pokemontypes: Array<{
          pokemon_v2_type: { name: string }
        }>
      }>
    }
    errors?: unknown[]
  }

  if (json.errors) {
    throw new Error('GraphQL errors returned while fetching Pokemon types')
  }

  return json.data!.pokemon_v2_pokemon.map((p) => ({
    id: p.id,
    name: p.name,
    types: p.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
  }))
}
