import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPokemonDetail, createPokemonSpeciesInfo } from '../../fixtures/pokemon'

const pokemonRef = ref<any>(undefined)
const speciesRef = ref<any>(undefined)
const isLoadingRef = ref(false)
const isErrorRef = ref(false)
const back = vi.fn()
const speciesArgs: Array<any[]> = []

vi.mock('../../../src/composables/usePokemonQueries', () => ({
  usePokemonDetailQuery: () => ({ data: pokemonRef, isLoading: isLoadingRef, isError: isErrorRef }),
  usePokemonSpeciesQuery: (...args: any[]) => {
    speciesArgs.push(args)
    return { data: speciesRef }
  },
  useEvolutionChainQuery: () => ({ data: ref(null) }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ back }),
}))

describe('DetailView', async () => {
  const DetailView = (await import('../../../src/views/DetailView.vue')).default

  beforeEach(() => {
    pokemonRef.value = undefined
    speciesRef.value = undefined
    isLoadingRef.value = false
    isErrorRef.value = false
    back.mockClear()
    speciesArgs.length = 0
  })

  it('renders loading and error states', async () => {
    isLoadingRef.value = true
    const loadingWrapper = mount(DetailView, { props: { id: '25' } })
    expect(loadingWrapper.text()).toContain('Loading Pokémon data...')

    isLoadingRef.value = false
    isErrorRef.value = true
    const errorWrapper = mount(DetailView, { props: { id: '25' } })
    expect(errorWrapper.text()).toContain("Couldn't load this Pokémon")
    await errorWrapper.find('button').trigger('click')
    expect(back).toHaveBeenCalled()
  })

  it('renders all detail sub-sections and handles hero events', async () => {
    pokemonRef.value = createPokemonDetail()
    speciesRef.value = createPokemonSpeciesInfo()

    const wrapper = mount(DetailView, {
      props: { id: '25' },
      global: {
        stubs: {
          PokemonHero: {
            props: ['pokemon', 'species', 'showShiny'],
            template:
              '<div><button class="toggle" @click="$emit(\'update:showShiny\', true)"></button><button class="back" @click="$emit(\'back\')"></button>{{ showShiny }}</div>',
          },
          PokemonStats: { template: '<div class="stats" />' },
          PokemonAbilities: { template: '<div class="abilities" />' },
          PokemonSprites: { template: '<div class="sprites" />' },
          PokemonMoves: { template: '<div class="moves" />' },
          PokemonSpeciesInfo: { template: '<div class="species" />' },
        },
      },
    })

    expect(wrapper.find('.stats').exists()).toBe(true)
    expect(wrapper.find('.abilities').exists()).toBe(true)
    expect(wrapper.find('.sprites').exists()).toBe(true)
    expect(wrapper.find('.moves').exists()).toBe(true)
    expect(wrapper.find('.species').exists()).toBe(true)
    expect(speciesArgs[0][0]).toBe('25')
    expect(speciesArgs[0][1].value).toBe('https://pokeapi.co/api/v2/pokemon-species/25/')

    await wrapper.get('.toggle').trigger('click')
    await wrapper.get('.back').trigger('click')

    expect(back).toHaveBeenCalled()
  })

  it('omits species info when species data is unavailable', () => {
    pokemonRef.value = createPokemonDetail()
    speciesRef.value = undefined

    const wrapper = mount(DetailView, {
      props: { id: '25' },
      global: {
        stubs: {
          PokemonHero: { template: '<div class="hero" />' },
          PokemonStats: true,
          PokemonAbilities: true,
          PokemonSprites: true,
          PokemonMoves: true,
          PokemonSpeciesInfo: { template: '<div class="species" />' },
        },
      },
    })

    expect(wrapper.find('.species').exists()).toBe(false)
    expect(speciesArgs[0][1].value).toBe('https://pokeapi.co/api/v2/pokemon-species/25/')
  })

  it('falls back to the default accent color when the pokemon has no types', () => {
    pokemonRef.value = createPokemonDetail({ types: [] })
    speciesRef.value = createPokemonSpeciesInfo()

    const wrapper = mount(DetailView, {
      props: { id: '25' },
      global: {
        stubs: {
          PokemonHero: true,
          PokemonStats: {
            props: ['accentColor'],
            template: '<div class="stats">{{ accentColor }}</div>',
          },
          PokemonAbilities: true,
          PokemonSprites: true,
          PokemonMoves: true,
          PokemonSpeciesInfo: true,
        },
      },
    })

    expect(wrapper.find('.stats').text()).toContain('#A8A77A')
  })

  it('falls back to the default accent color when the pokemon type has no configured color', () => {
    pokemonRef.value = createPokemonDetail({
      types: [{ slot: 1, type: { name: 'mystery', url: '' } }],
    })
    speciesRef.value = createPokemonSpeciesInfo()

    const wrapper = mount(DetailView, {
      props: { id: '25' },
      global: {
        stubs: {
          PokemonHero: true,
          PokemonStats: {
            props: ['accentColor'],
            template: '<div class="stats">{{ accentColor }}</div>',
          },
          PokemonAbilities: true,
          PokemonSprites: true,
          PokemonMoves: true,
          PokemonSpeciesInfo: true,
        },
      },
    })

    expect(wrapper.find('.stats').text()).toContain('#A8A77A')
  })
})
