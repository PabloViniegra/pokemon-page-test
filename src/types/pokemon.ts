export interface PokemonShort {
  name: string
  url: string
}

export interface PokemonResultList {
  count: number
  next: string | null
  previous: string | null
  results: PokemonShort[]
}

export interface PokemonAbility {
  ability: {
    name: string
    url: string
  }
  is_hidden: boolean
  slot: number
}

export interface PokemonForm {
  name: string
  url: string
}

export interface PokemonGameIndex {
  game_index: number
  version: {
    name: string
    url: string
  }
}

export interface PokemonHeldItem {
  item: {
    name: string
    url: string
  }
  version_details: {
    rarity: number
    version: {
      name: string
      url: string
    }
  }[]
}

export interface PokemonMove {
  move: {
    name: string
    url: string
  }
  version_group_details: {
    level_learned_at: number
    move_learn_method: {
      name: string
      url: string
    }
    version_group: {
      name: string
      url: string
    }
  }[]
}

export interface PokemonType {
  slot: number
  type: {
    name: string
    url: string
  }
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: {
    name: string
    url: string
  }
}

export interface PokemonSprites {
  back_default: string | null
  back_female: string | null
  back_shiny: string | null
  back_shiny_female: string | null
  front_default: string | null
  front_female: string | null
  front_shiny: string | null
  front_shiny_female: string | null
  other: {
    dream_world: {
      front_default: string | null
      front_female: string | null
    }
    home: {
      front_default: string | null
      front_female: string | null
      front_shiny: string | null
      front_shiny_female: string | null
    }
    'official-artwork': {
      front_default: string | null
      front_shiny: string | null
    }
    showdown: {
      back_default: string | null
      back_female: string | null
      back_shiny: string | null
      back_shiny_female: string | null
      front_default: string | null
      front_female: string | null
      front_shiny: string | null
      front_shiny_female: string | null
    }
  }
  versions: Record<string, Record<string, Record<string, string | null>>>
}

export interface PokemonCries {
  latest: string
  legacy: string
}

export interface PokemonPastType {
  generation: { name: string; url: string }
  types: PokemonType[]
}

export interface PokemonSpecies {
  name: string
  url: string
}

export interface PokemonDetail {
  id: number
  name: string
  base_experience: number
  height: number
  weight: number
  abilities: PokemonAbility[]
  forms: PokemonForm[]
  game_indices: PokemonGameIndex[]
  held_items: PokemonHeldItem[]
  location_area_encounters: string
  moves: PokemonMove[]
  past_types: PokemonPastType[]
  sprites: PokemonSprites
  cries: PokemonCries
  species: PokemonSpecies
  stats: PokemonStat[]
  types: PokemonType[]
  is_default: boolean
  location_area_encounters_url: string
  order: number
}

export interface PokemonSpeciesInfo {
  base_happiness: number
  capture_rate: number
  color: { name: string; url: string }
  egg_groups: { name: string; url: string }[]
  evolution_chain: { url: string }
  evolves_from_species: { name: string; url: string } | null
  flavor_text_entries: {
    flavor_text: string
    language: { name: string; url: string }
    version: { name: string; url: string }
  }[]
  form_descriptions: {
    description: string
    language: { name: string; url: string }
  }[]
  forms_switchable: boolean
  gender_rate: number
  genera: { genus: string; language: { name: string; url: string } }[]
  generation: { name: string; url: string }
  growth_rate: { name: string; url: string }
  habitat: { name: string; url: string } | null
  has_gender_differences: boolean
  hatch_counter: number
  id: number
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  name: string
  names: { language: { name: string; url: string }; name: string }[]
  order: number
  pal_park_encounters: {
    area: { name: string; url: string }
    base_score: number
    rate: number
  }[]
  pokedex_numbers: {
    entry_number: number
    pokedex: { name: string; url: string }
  }[]
  shape: { name: string; url: string }
  varieties: { is_default: boolean; pokemon: { name: string; url: string } }[]
}

export interface TypeFilterOption {
  name: string
  color: string
  bg: string
}

export type SortOption =
  | 'id-asc'
  | 'id-desc'
  | 'name-asc'
  | 'name-desc'
  | 'height-asc'
  | 'height-desc'
  | 'weight-asc'
  | 'weight-desc'

export const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  normal: { color: '#A8A77A', bg: 'bg-[#A8A77A]' },
  fire: { color: '#EE8130', bg: 'bg-[#EE8130]' },
  water: { color: '#6390F0', bg: 'bg-[#6390F0]' },
  electric: { color: '#F7D02C', bg: 'bg-[#F7D02C]' },
  grass: { color: '#7AC74C', bg: 'bg-[#7AC74C]' },
  ice: { color: '#96D9D6', bg: 'bg-[#96D9D6]' },
  fighting: { color: '#C22E28', bg: 'bg-[#C22E28]' },
  poison: { color: '#A33EA1', bg: 'bg-[#A33EA1]' },
  ground: { color: '#E2BF65', bg: 'bg-[#E2BF65]' },
  flying: { color: '#A98FF3', bg: 'bg-[#A98FF3]' },
  psychic: { color: '#F95587', bg: 'bg-[#F95587]' },
  bug: { color: '#A6B91A', bg: 'bg-[#A6B91A]' },
  rock: { color: '#B6A136', bg: 'bg-[#B6A136]' },
  ghost: { color: '#735797', bg: 'bg-[#735797]' },
  dragon: { color: '#6F35FC', bg: 'bg-[#6F35FC]' },
  dark: { color: '#705746', bg: 'bg-[#705746]' },
  steel: { color: '#B7B7CE', bg: 'bg-[#B7B7CE]' },
  fairy: { color: '#D685AD', bg: 'bg-[#D685AD]' },
}

export const STAT_NAMES: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
}

export const STAT_DESCRIPTIONS: Record<string, string> = {
  hp: 'Hit Points: total damage a Pokémon can take before fainting',
  attack: 'Physical move damage',
  defense: 'Resistance to physical moves',
  'special-attack': 'Special move damage',
  'special-defense': 'Resistance to special moves',
  speed: 'Determines move order in battle',
}

export interface AbilityDetail {
  name: string
  effect_entries: {
    short_effect: string
    effect: string
    language: { name: string }
  }[]
  flavor_text_entries: {
    flavor_text: string
    language: { name: string }
  }[]
}

export interface EvolutionDetail {
  trigger: { name: string; url: string }
  item: { name: string; url: string } | null
  min_level: number | null
  min_happiness: number | null
  min_affection: number | null
  needs_overworld_rain: boolean
  time_of_day: string
  known_move_type: { name: string; url: string } | null
  known_move: { name: string; url: string } | null
  held_item: { name: string; url: string } | null
  location: { name: string; url: string } | null
  gender: number | null
  party_species: { name: string; url: string } | null
  party_type: { name: string; url: string } | null
  relative_physical_stats: number | null
  trade_species: { name: string; url: string } | null
  turn_upside_down: boolean
}

export interface EvolutionChainLink {
  species: { name: string; url: string }
  evolution_details: EvolutionDetail[]
  evolves_to: EvolutionChainLink[]
  is_baby: boolean
}

export interface EvolutionChainRaw {
  id: number
  chain: EvolutionChainLink
}

export interface EvolutionNode {
  speciesName: string
  speciesId: number
  imageUrl: string
  details: EvolutionDetail[]
  isBaby: boolean
  evolvesTo: EvolutionNode[]
}

export interface EvolutionStageEntry {
  node: EvolutionNode
  condition: string
  parentId: number | null
}

export interface EvolutionStage {
  depth: number
  entries: EvolutionStageEntry[]
}

export interface PokemonCardDisplay {
  name: string
  url: string
  imageUrl: string
  paddedId: string
  isFavorited: boolean
  accentColor: string | null
}
