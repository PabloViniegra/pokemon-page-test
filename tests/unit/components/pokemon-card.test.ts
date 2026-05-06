import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('PokemonCard', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('renders cached type accents, emits events, and toggles favorites', async () => {
    const toggleFavorite = vi.fn()

    vi.doMock('@tanstack/vue-query', () => ({
      useQueryClient: () => ({
        getQueryData: () => ({ types: [{ type: { name: 'electric' } }] }),
      }),
    }))
    vi.doMock('../../../src/stores/favorites', () => ({
      useFavoritesStore: () => ({
        isFavorite: () => true,
        toggleFavorite,
      }),
    }))

    const PokemonCard = (await import('../../../src/components/PokemonCard.vue')).default
    const wrapper = mount(PokemonCard, {
      props: {
        name: 'pikachu',
        url: 'https://pokeapi.co/api/v2/pokemon/25/',
      },
    })

    expect(wrapper.text()).toContain('#0025')
    expect(wrapper.html()).toContain('rgb(247, 208, 44)')
    expect(wrapper.get('img').attributes('loading')).toBe('lazy')

    await wrapper.trigger('click')
    await wrapper.trigger('mouseenter')
    await wrapper.get('button[aria-label="Remove from favorites"]').trigger('click')

    expect(wrapper.emitted('select')?.[0]).toEqual(['pikachu'])
    expect(wrapper.emitted('hover')?.[0]).toEqual(['pikachu'])
    expect(toggleFavorite).toHaveBeenCalledWith(25)
  })

  it('falls back when there is no cached detail data', async () => {
    vi.doMock('@tanstack/vue-query', () => ({
      useQueryClient: () => ({ getQueryData: () => undefined }),
    }))
    vi.doMock('../../../src/stores/favorites', () => ({
      useFavoritesStore: () => ({
        isFavorite: () => false,
        toggleFavorite: vi.fn(),
      }),
    }))

    const PokemonCard = (await import('../../../src/components/PokemonCard.vue')).default
    const wrapper = mount(PokemonCard, {
      props: {
        name: 'bulbasaur',
        url: 'https://pokeapi.co/api/v2/pokemon/1/',
      },
    })

    expect(wrapper.get('img').attributes('loading')).toBe('eager')
    expect(wrapper.html()).not.toContain('background-color: rgb(')
    expect(wrapper.get('button').attributes('aria-label')).toBe('Add to favorites')
  })

  it('omits the accent color when a cached type has no defined palette', async () => {
    vi.doMock('@tanstack/vue-query', () => ({
      useQueryClient: () => ({
        getQueryData: () => ({ types: [{ type: { name: 'mystery' } }] }),
      }),
    }))
    vi.doMock('../../../src/stores/favorites', () => ({
      useFavoritesStore: () => ({
        isFavorite: () => false,
        toggleFavorite: vi.fn(),
      }),
    }))

    const PokemonCard = (await import('../../../src/components/PokemonCard.vue')).default
    const wrapper = mount(PokemonCard, {
      props: {
        name: 'missingno',
        url: 'https://pokeapi.co/api/v2/pokemon/999/',
      },
    })

    expect(wrapper.html()).not.toContain('background-color: rgb(')
  })
})
