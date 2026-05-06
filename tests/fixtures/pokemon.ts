import type {
  AbilityDetail,
  PokemonAbility,
  PokemonDetail,
  PokemonGameIndex,
  PokemonHeldItem,
  PokemonMove,
  PokemonPastType,
  PokemonSpeciesInfo,
  PokemonStat,
  PokemonType,
} from '../../src/types/pokemon'

export function createPokemonType(name: string, slot = 1): PokemonType {
  return {
    slot,
    type: {
      name,
      url: `https://pokeapi.co/api/v2/type/${name}`,
    },
  }
}

export function createPokemonDetail(
  overrides: Partial<PokemonDetail> = {},
): PokemonDetail {
  return {
    id: 25,
    name: 'pikachu',
    base_experience: 112,
    height: 4,
    weight: 60,
    abilities: [
      {
        ability: {
          name: 'static',
          url: 'https://pokeapi.co/api/v2/ability/static',
        },
        is_hidden: false,
        slot: 1,
      },
    ],
    forms: [],
    game_indices: [
      {
        game_index: 1,
        version: {
          name: 'red',
          url: 'https://pokeapi.co/api/v2/version/red',
        },
      },
    ],
    held_items: [],
    location_area_encounters: '',
    moves: [
      {
        move: {
          name: 'thunderbolt',
          url: 'https://pokeapi.co/api/v2/move/thunderbolt',
        },
        version_group_details: [],
      },
    ],
    past_types: [],
    sprites: {
      back_default: 'back.png',
      back_female: null,
      back_shiny: 'back-shiny.png',
      back_shiny_female: null,
      front_default: 'front.png',
      front_female: null,
      front_shiny: 'front-shiny.png',
      front_shiny_female: null,
      other: {
        dream_world: { front_default: null, front_female: null },
        home: {
          front_default: null,
          front_female: null,
          front_shiny: null,
          front_shiny_female: null,
        },
        'official-artwork': {
          front_default: 'official.png',
          front_shiny: 'official-shiny.png',
        },
        showdown: {
          back_default: null,
          back_female: null,
          back_shiny: null,
          back_shiny_female: null,
          front_default: null,
          front_female: null,
          front_shiny: null,
          front_shiny_female: null,
        },
      },
      versions: {},
    },
    cries: {
      latest: 'latest.mp3',
      legacy: 'legacy.mp3',
    },
    species: {
      name: 'pikachu',
      url: 'https://pokeapi.co/api/v2/pokemon-species/25/',
    },
    stats: [
      { base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } },
      { base_stat: 55, effort: 0, stat: { name: 'attack', url: '' } },
    ],
    types: [createPokemonType('electric')],
    is_default: true,
    location_area_encounters_url: '',
    order: 25,
    ...overrides,
  }
}

export function createPokemonSpeciesInfo(
  overrides: Partial<PokemonSpeciesInfo> = {},
): PokemonSpeciesInfo {
  return {
    base_happiness: 70,
    capture_rate: 190,
    color: { name: 'yellow', url: '' },
    egg_groups: [{ name: 'field', url: '' }],
    evolution_chain: { url: '' },
    evolves_from_species: null,
    flavor_text_entries: [
      {
        flavor_text: 'Mouse\fPokemon',
        language: { name: 'en', url: '' },
        version: { name: 'red', url: '' },
      },
    ],
    form_descriptions: [],
    forms_switchable: false,
    gender_rate: 4,
    genera: [{ genus: 'Mouse Pokemon', language: { name: 'en', url: '' } }],
    generation: { name: 'generation-i', url: '' },
    growth_rate: { name: 'medium-fast', url: '' },
    habitat: { name: 'forest', url: '' },
    has_gender_differences: false,
    hatch_counter: 10,
    id: 25,
    is_baby: false,
    is_legendary: false,
    is_mythical: false,
    name: 'pikachu',
    names: [],
    order: 25,
    pal_park_encounters: [],
    pokedex_numbers: [],
    shape: { name: 'quadruped', url: '' },
    varieties: [],
    ...overrides,
  }
}

export function createPokemonAbility(
  overrides: Partial<PokemonAbility> = {},
): PokemonAbility {
  return {
    ability: {
      name: 'static',
      url: 'https://pokeapi.co/api/v2/ability/static',
    },
    is_hidden: false,
    slot: 1,
    ...overrides,
  }
}

export function createAbilityDetail(
  overrides: Partial<AbilityDetail> = {},
): AbilityDetail {
  return {
    name: 'static',
    effect_entries: [
      {
        short_effect: 'May paralyze on contact.',
        effect: 'May paralyze on contact.',
        language: { name: 'en' },
      },
    ],
    flavor_text_entries: [],
    ...overrides,
  }
}

export function createPokemonMove(name: string): PokemonMove {
  return {
    move: { name, url: `https://pokeapi.co/api/v2/move/${name}` },
    version_group_details: [],
  }
}

export function createPokemonGameIndex(name: string): PokemonGameIndex {
  return {
    game_index: 1,
    version: { name, url: `https://pokeapi.co/api/v2/version/${name}` },
  }
}

export function createHeldItem(name: string, rarity = 30): PokemonHeldItem {
  return {
    item: { name, url: `https://pokeapi.co/api/v2/item/${name}` },
    version_details: [
      {
        rarity,
        version: { name: 'red', url: '' },
      },
    ],
  }
}

export function createPastType(typeName: string): PokemonPastType {
  return {
    generation: { name: 'generation-i', url: '' },
    types: [createPokemonType(typeName)],
  }
}

export function createPokemonStat(name: string, baseStat: number): PokemonStat {
  return {
    base_stat: baseStat,
    effort: 0,
    stat: { name, url: '' },
  }
}
