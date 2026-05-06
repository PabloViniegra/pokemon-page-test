import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPokemonDetail, createPokemonSpeciesInfo } from '../../fixtures/pokemon'

describe('PokemonHero', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('renders species data, emits actions, and toggles favorites', async () => {
    const toggleFavorite = vi.fn()

    vi.doMock('../../../src/stores/favorites', () => ({
      useFavoritesStore: () => ({
        isFavorite: () => true,
        toggleFavorite,
      }),
    }))

    const PokemonHero = (await import('../../../src/components/PokemonHero.vue')).default
    const wrapper = mount(PokemonHero, {
      props: {
        pokemon: createPokemonDetail(),
        species: createPokemonSpeciesInfo(),
        showShiny: false,
      },
      global: {
        stubs: {
          PokemonTypeBadge: {
            props: ['pokemonType'],
            template: '<span class="type">{{ pokemonType }}</span>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Mouse Pokemon')
    expect(wrapper.text()).toContain('Mouse Pokemon')
    expect(wrapper.text()).toContain('Back to Pokédex')
    expect(wrapper.text()).toContain('pikachu')
    expect(wrapper.text()).toContain('electric')
    expect(wrapper.text()).toContain('Mouse Pokemon')
    expect(wrapper.text()).toContain('Back to Pokédex')

    await wrapper.get('button[aria-label="Remove from favorites"]').trigger('click')
    await wrapper.findAll('button')[0].trigger('click')
    await wrapper.findAll('button')[1].trigger('click')

    expect(toggleFavorite).toHaveBeenCalledWith(25)
    expect(wrapper.emitted('back')).toBeTruthy()
    expect(wrapper.emitted('update:showShiny')?.[0]).toEqual([true])
  })

  it('falls back when species and primary type are missing', async () => {
    vi.doMock('../../../src/stores/favorites', () => ({
      useFavoritesStore: () => ({
        isFavorite: () => false,
        toggleFavorite: vi.fn(),
      }),
    }))

    const PokemonHero = (await import('../../../src/components/PokemonHero.vue')).default
    const wrapper = mount(PokemonHero, {
      props: {
        pokemon: createPokemonDetail({ types: [] }),
        species: undefined,
        showShiny: true,
      },
      global: {
        stubs: {
          PokemonTypeBadge: true,
        },
      },
    })

    expect(wrapper.text()).not.toContain('Mouse Pokemon')
    expect(wrapper.get('button[aria-label="Add to favorites"]').exists()).toBe(true)
    expect(wrapper.html()).toContain('rgb(168, 167, 122)')
    expect(wrapper.text()).toContain('Shiny')
  })

  it('hides english text when it is unavailable and falls back for unknown types', async () => {
    vi.doMock('../../../src/stores/favorites', () => ({
      useFavoritesStore: () => ({
        isFavorite: () => false,
        toggleFavorite: vi.fn(),
      }),
    }))

    const PokemonHero = (await import('../../../src/components/PokemonHero.vue')).default
    const wrapper = mount(PokemonHero, {
      props: {
        pokemon: createPokemonDetail({ types: [{ slot: 1, type: { name: 'mystery', url: '' } }] }),
        species: createPokemonSpeciesInfo({
          flavor_text_entries: [{ flavor_text: 'zzz', language: { name: 'jp', url: '' }, version: { name: 'red', url: '' } }],
          genera: [{ genus: '???', language: { name: 'jp', url: '' } }],
        }),
        showShiny: false,
      },
      global: { stubs: { PokemonTypeBadge: true } },
    })

    expect(wrapper.text()).not.toContain('zzz')
    expect(wrapper.text()).not.toContain('???')
    expect(wrapper.html()).toContain('rgb(168, 167, 122)')
  })
})
