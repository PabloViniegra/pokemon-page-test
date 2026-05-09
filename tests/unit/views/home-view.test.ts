import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  beforeLeave: undefined as undefined | (() => void),
  toggleFilters: vi.fn(),
  isFavorite: vi.fn((id: number) => id === 25),
  toggleFavorite: vi.fn(),
  prefetchPokemonDetail: vi.fn(),
  fetchNextPage: vi.fn(),
  refetch: vi.fn(),
  observerCallback: undefined as undefined | (() => void),
  searchInput: { value: '', __v_isRef: true },
  selectedTypes: { value: [] as string[], __v_isRef: true },
  sortBy: { value: 'id-asc', __v_isRef: true },
  showFilters: { value: false, __v_isRef: true },
  showFavoritesOnly: { value: false, __v_isRef: true },
  debouncedSearch: { value: '', __v_isRef: true },
  infiniteData: { value: undefined as any, __v_isRef: true },
  searchData: { value: undefined as any, __v_isRef: true },
  typeResults: { value: [] as any[], __v_isRef: true },
  favoriteResults: { value: [] as any[], __v_isRef: true },
  hasNextPage: { value: false, __v_isRef: true },
  isFetchingNextPage: { value: false, __v_isRef: true },
  isInfiniteLoading: { value: false, __v_isRef: true },
  isInfiniteError: { value: false, __v_isRef: true },
  isSearchLoading: { value: false, __v_isRef: true },
  isTypeLoading: { value: false, __v_isRef: true },
  isFavoriteLoading: { value: false, __v_isRef: true },
  isFavoriteError: { value: false, __v_isRef: true },
}))

vi.mock('pinia', () => ({
  storeToRefs: (store: any) => store,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.routerPush }),
  onBeforeRouteLeave: (callback: () => void) => {
    mocks.beforeLeave = callback
  },
}))

vi.mock('../../../src/stores/filters', () => ({
  useFiltersStore: () => ({
    searchInput: mocks.searchInput,
    selectedTypes: mocks.selectedTypes,
    sortBy: mocks.sortBy,
    showFilters: mocks.showFilters,
    showFavoritesOnly: mocks.showFavoritesOnly,
    toggleFilters: mocks.toggleFilters,
  }),
}))

vi.mock('../../../src/stores/favorites', () => ({
  useFavoritesStore: () => ({
    isFavorite: mocks.isFavorite,
    toggleFavorite: mocks.toggleFavorite,
    favorites: [25],
  }),
}))

vi.mock('../../../src/composables/useDebounce', () => ({
  useDebounce: () => mocks.debouncedSearch,
}))

vi.mock('../../../src/composables/useIntersectionObserver', () => ({
  useIntersectionObserver: (_target: unknown, callback: () => void) => {
    mocks.observerCallback = callback
    return { isIntersecting: { value: false, __v_isRef: true } }
  },
}))

vi.mock('../../../src/composables/usePokemonQueries', () => ({
  usePokemonInfiniteQuery: () => ({
    data: mocks.infiniteData,
    fetchNextPage: mocks.fetchNextPage,
    hasNextPage: mocks.hasNextPage,
    isFetchingNextPage: mocks.isFetchingNextPage,
    isLoading: mocks.isInfiniteLoading,
    isError: mocks.isInfiniteError,
    refetch: mocks.refetch,
  }),
  usePokemonSearchQuery: () => ({
    data: mocks.searchData,
    isLoading: mocks.isSearchLoading,
  }),
  usePokemonMultiTypeQuery: () => ({
    results: mocks.typeResults,
    isLoading: mocks.isTypeLoading,
  }),
  usePrefetchPokemon: () => ({
    prefetchPokemonDetail: mocks.prefetchPokemonDetail,
  }),
  useFavoritePokemonListQuery: () => ({
    results: mocks.favoriteResults,
    isLoading: mocks.isFavoriteLoading,
    isError: mocks.isFavoriteError,
  }),
}))

describe('HomeView', async () => {
  const HomeView = (await import('../../../src/views/HomeView.vue')).default

  const stubs = {
    FilterPanel: { template: '<div class="filter-panel" />' },
    PokemonGrid: {
      props: ['pokemons', 'animate'],
      template:
        '<div class="grid"><div class="names">{{ pokemons.map(pokemon => pokemon.name).join(",") }}</div><button class="select" @click="$emit(\'select\', pokemons[0]?.name)"></button><button class="hover" @click="$emit(\'hover\', pokemons[0]?.name)"></button><div class="animate">{{ animate }}</div></div>',
    },
  }

  beforeEach(() => {
    mocks.routerPush.mockClear()
    mocks.toggleFilters.mockClear()
    mocks.isFavorite.mockClear()
    mocks.prefetchPokemonDetail.mockClear()
    mocks.fetchNextPage.mockClear()
    mocks.refetch.mockClear()
    mocks.beforeLeave = undefined
    mocks.observerCallback = undefined
    mocks.searchInput.value = ''
    mocks.selectedTypes.value = []
    mocks.sortBy.value = 'id-asc'
    mocks.showFilters.value = false
    mocks.showFavoritesOnly.value = false
    mocks.debouncedSearch.value = ''
    mocks.infiniteData.value = undefined
    mocks.searchData.value = undefined
    mocks.typeResults.value = []
    mocks.favoriteResults.value = []
    mocks.hasNextPage.value = false
    mocks.isFetchingNextPage.value = false
    mocks.isInfiniteLoading.value = false
    mocks.isInfiniteError.value = false
    mocks.isSearchLoading.value = false
    mocks.isTypeLoading.value = false
    mocks.isFavoriteLoading.value = false
    mocks.isFavoriteError.value = false
    sessionStorage.clear()
    Object.defineProperty(window, 'scrollY', { value: 250, configurable: true, writable: true })
  })

  it('renders the loading state and persists scroll position on leave', () => {
    mocks.isInfiniteLoading.value = true

    const wrapper = mount(HomeView, { global: { stubs } })

    expect(wrapper.text()).toContain('Loading Pokémon...')
    expect(wrapper.get('input').attributes('placeholder')).toBe('Search Pokémon...')
    expect(wrapper.get('select').exists()).toBe(true)
    mocks.beforeLeave?.()
    expect(sessionStorage.getItem('pokedex-scroll-y')).toBe('250')
  })

  it('wires search and sort controls through v-model bindings', async () => {
    mocks.infiniteData.value = { pages: [{ count: 1, results: [] }] }
    const wrapper = mount(HomeView, { global: { stubs } })

    await wrapper.get('input').setValue('zapdos')
    await wrapper.get('select').setValue('id-desc')

    expect(mocks.searchInput.value).toBe('zapdos')
    expect(mocks.sortBy.value).toBe('id-desc')
  })

  it('shows default and favorites-view errors and retries the correct query', async () => {
    mocks.isInfiniteError.value = true
    let wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).toContain('Something went wrong')
    await wrapper.findAll('button').find((button) => button.text().includes('Try again'))!.trigger('click')
    expect(mocks.refetch).toHaveBeenCalled()

    mocks.isInfiniteError.value = false
    mocks.showFavoritesOnly.value = true
    mocks.isFavoriteError.value = true
    wrapper = mount(HomeView, { global: { stubs } })
    await wrapper.findAll('button').find((button) => button.text().includes('Try again'))!.trigger('click')
    expect(mocks.refetch).toHaveBeenCalled()
  })

  it('renders the infinite list, toggles filters, prefetches, navigates, and fetches more', async () => {
    mocks.infiniteData.value = {
      pages: [
        {
          count: 2,
          results: [
            { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          ],
        },
      ],
    }
    mocks.sortBy.value = 'name-desc'
    mocks.hasNextPage.value = true
    mocks.showFilters.value = true

    const wrapper = mount(HomeView, { global: { stubs } })

    expect(wrapper.text()).toContain('pikachu,bulbasaur')
    expect(wrapper.find('.filter-panel').exists()).toBe(true)

    await wrapper.findAll('button')[0].trigger('click')
    expect(mocks.toggleFilters).toHaveBeenCalled()

    await wrapper.find('.select').trigger('click')
    await wrapper.find('.hover').trigger('click')
    expect(mocks.routerPush).toHaveBeenCalledWith({
      name: 'pokemon-detail',
      params: { id: 'pikachu' },
    })
    expect(mocks.prefetchPokemonDetail).toHaveBeenCalledWith('pikachu')

    mocks.observerCallback?.()
    expect(mocks.fetchNextPage).toHaveBeenCalled()
  })

  it('covers the remaining sort branches and skips fetches while already loading more', () => {
    mocks.infiniteData.value = {
      pages: [
        {
          count: 2,
          results: [
            { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          ],
        },
      ],
    }
    mocks.hasNextPage.value = true
    mocks.isFetchingNextPage.value = true

    mocks.sortBy.value = 'id-desc'
    let wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).toContain('pikachu,bulbasaur')

    mocks.sortBy.value = 'id-asc'
    wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).toContain('pikachu,bulbasaur')

    mocks.sortBy.value = 'name-asc'
    wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).toContain('bulbasaur,pikachu')

    mocks.sortBy.value = 'name-desc'
    wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).toContain('pikachu,bulbasaur')

    mocks.observerCallback?.()
    expect(mocks.fetchNextPage).not.toHaveBeenCalled()
  })

  it('uses search, type, and favorites-only result sources', () => {
    mocks.debouncedSearch.value = 'pi'
    mocks.searchData.value = {
      results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }],
    }
    let wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).toContain('pikachu')

    mocks.searchData.value = undefined
    wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).not.toContain('pikachu')

    mocks.debouncedSearch.value = ''
    mocks.selectedTypes.value = ['electric']
    mocks.typeResults.value = [{ name: 'magnemite', url: 'https://pokeapi.co/api/v2/pokemon/81/' }]
    wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).toContain('magnemite')

    mocks.selectedTypes.value = []
    mocks.showFavoritesOnly.value = true
    mocks.favoriteResults.value = [
      { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/', id: 25, types: [] },
      { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/', id: 26, types: [] },
    ]
    wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).toContain('pikachu')
    expect(wrapper.text()).toContain('raichu')

    mocks.showFavoritesOnly.value = false
    mocks.selectedTypes.value = ['electric']
    mocks.typeResults.value = []
    wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).not.toContain('magnemite')

    mocks.selectedTypes.value = []
    mocks.showFavoritesOnly.value = true
    mocks.favoriteResults.value = []
    wrapper = mount(HomeView, { global: { stubs } })
    expect(wrapper.text()).not.toContain('pikachu')
  })

  it('shows the empty state when no pokemon match the current filters', () => {
    mocks.debouncedSearch.value = 'zzz'
    mocks.searchData.value = { results: [] }

    const wrapper = mount(HomeView, { global: { stubs } })

    expect(wrapper.text()).toContain('No Pokémon found')
    expect(wrapper.text()).toContain('Try adjusting your search or filters')
  })
})