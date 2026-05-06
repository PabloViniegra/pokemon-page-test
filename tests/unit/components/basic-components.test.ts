import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PokemonMoves from '../../../src/components/PokemonMoves.vue'
import PokemonSpeciesInfo from '../../../src/components/PokemonSpeciesInfo.vue'
import PokemonSprites from '../../../src/components/PokemonSprites.vue'
import PokemonStats from '../../../src/components/PokemonStats.vue'
import PokemonTypeBadge from '../../../src/components/PokemonTypeBadge.vue'
import SearchBar from '../../../src/components/SearchBar.vue'
import SortSelect from '../../../src/components/SortSelect.vue'
import StatBar from '../../../src/components/StatBar.vue'
import TeamSlot from '../../../src/components/TeamSlot.vue'
import {
  createHeldItem,
  createPastType,
  createPokemonGameIndex,
  createPokemonMove,
  createPokemonSpeciesInfo,
  createPokemonStat,
} from '../../fixtures/pokemon'

describe('basic Vue components', () => {
  it('updates the search bar model value', async () => {
    const wrapper = mount(SearchBar, { props: { modelValue: '' } })

    await wrapper.get('input').setValue('pikachu')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['pikachu'])
  })

  it('updates the selected sort option', async () => {
    const wrapper = mount(SortSelect, { props: { modelValue: 'id-asc' } })

    await wrapper.get('select').setValue('name-desc')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['name-desc'])
  })

  it('renders pokemon type colors and falls back for unknown types', () => {
    const known = mount(PokemonTypeBadge, { props: { pokemonType: 'electric' } })
    const unknown = mount(PokemonTypeBadge, { props: { pokemonType: 'mystery' } })

    expect(known.text()).toContain('electric')
    expect(String(known.attributes('style'))).toContain('247, 208, 44')
    expect(String(unknown.attributes('style'))).toContain('136, 136, 136')
  })

  it('renders stat bars with custom and default colors', () => {
    const custom = mount(StatBar, {
      props: { name: 'Attack', value: 100, max: 200, color: '#ff0000', description: 'hit hard' },
    })
    const fallback = mount(StatBar, {
      props: { name: 'Defense', value: 999 },
    })

    expect(String(custom.attributes('title'))).toBe('hit hard')
    expect(custom.findAll('span')[1].text()).toBe('100')
    expect(String(custom.html())).toContain('width: 50%')
    expect(String(fallback.html())).toContain('width: 100%')
    expect(String(fallback.html())).toContain('168, 167, 122')
  })

  it('renders stats totals and fallback names', async () => {
    const wrapper = mount(PokemonStats, {
      props: {
        stats: [createPokemonStat('hp', 35), createPokemonStat('mystery-stat', 99)],
        accentColor: '#123456',
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Base Stats')
    expect(wrapper.text()).toContain('HP')
    expect(wrapper.text()).toContain('mystery-stat')
    expect(wrapper.text()).toContain('134')
  })

  it('renders sprite cards only for available sprites', () => {
    const full = mount(PokemonSprites, {
      props: {
        pokemonName: 'pikachu',
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
            home: { front_default: null, front_female: null, front_shiny: null, front_shiny_female: null },
            'official-artwork': { front_default: null, front_shiny: null },
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
      },
    })
    const empty = mount(PokemonSprites, {
      props: {
        pokemonName: 'ditto',
        sprites: {
          back_default: null,
          back_female: null,
          back_shiny: null,
          back_shiny_female: null,
          front_default: null,
          front_female: null,
          front_shiny: null,
          front_shiny_female: null,
          other: {
            dream_world: { front_default: null, front_female: null },
            home: { front_default: null, front_female: null, front_shiny: null, front_shiny_female: null },
            'official-artwork': { front_default: null, front_shiny: null },
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
      },
    })

    expect(full.findAll('img')).toHaveLength(4)
    expect(empty.findAll('img')).toHaveLength(0)
  })

  it('formats species metadata and optional badges', () => {
    const decorated = mount(PokemonSpeciesInfo, {
      props: {
        species: createPokemonSpeciesInfo({
          gender_rate: -1,
          habitat: null,
          egg_groups: [],
          is_legendary: true,
          is_mythical: true,
          is_baby: true,
        }),
      },
    })
    const ordinary = mount(PokemonSpeciesInfo, {
      props: {
        species: createPokemonSpeciesInfo({
          is_legendary: false,
          is_mythical: false,
          is_baby: false,
        }),
      },
    })

    expect(decorated.text()).toContain('Unknown')
    expect(decorated.text()).toContain('Genderless')
    expect(decorated.text()).toContain('Legendary')
    expect(decorated.text()).toContain('Mythical')
    expect(decorated.text()).toContain('Baby')
    expect(ordinary.text()).toContain('50% Male / 50% Female')
    expect(ordinary.text()).not.toContain('Legendary')

    const mythicalOnly = mount(PokemonSpeciesInfo, {
      props: {
        species: createPokemonSpeciesInfo({
          is_legendary: false,
          is_mythical: true,
          is_baby: false,
        }),
      },
    })
    const babyOnly = mount(PokemonSpeciesInfo, {
      props: {
        species: createPokemonSpeciesInfo({
          is_legendary: false,
          is_mythical: false,
          is_baby: true,
        }),
      },
    })

    expect(mythicalOnly.text()).toContain('Mythical')
    expect(mythicalOnly.text()).not.toContain('Legendary')
    expect(babyOnly.text()).toContain('Baby')
    expect(babyOnly.text()).not.toContain('Mythical')
  })

  it('renders moves, games, held items, and past types', () => {
    const full = mount(PokemonMoves, {
      props: {
        moves: [createPokemonMove('thunder-shock')],
        gameIndices: [createPokemonGameIndex('red-blue')],
        heldItems: [createHeldItem('oran-berry')],
        pastTypes: [createPastType('electric')],
      },
    })
    const minimal = mount(PokemonMoves, {
      props: {
        moves: [],
        gameIndices: [],
        heldItems: [],
        pastTypes: [],
      },
    })

    expect(full.text()).toContain('thunder shock')
    expect(full.text()).toContain('red blue')
    expect(full.text()).toContain('oran berry')
    expect(full.text()).toContain('generation i')
    expect(minimal.text()).not.toContain('Held Items')
    expect(minimal.text()).not.toContain('Past Types')
  })

  it('renders empty and filled team slots and emits actions', async () => {
    const empty = mount(TeamSlot, {
      props: { id: null, name: null, types: [], index: 2 },
    })
    const filled = mount(TeamSlot, {
      props: { id: 25, name: 'pikachu', types: ['electric', 'unknown'], index: 0 },
    })

    await empty.trigger('click')
    expect(empty.emitted('add')?.[0]).toEqual([2])
    expect((empty.vm as any).imageUrl).toBeNull()

    await filled.get('button[aria-label="Remove Pokémon"]').trigger('click')
    expect(filled.emitted('remove')?.[0]).toEqual([25])
    expect(filled.text()).toContain('pikachu')
    expect(filled.text()).toContain('electric')
    expect(filled.text()).not.toContain('unknown')
  })
})
