import type {
  PokemonResultList,
  PokemonDetail,
  PokemonSpeciesInfo,
  AbilityDetail,
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
