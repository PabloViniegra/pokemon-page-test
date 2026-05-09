import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const queryResult = ref<any>(null)
const queriesResult = ref<any[]>([])
const infiniteResult = { marker: 'infinite-result' }
const prefetchQuery = vi.fn()
const useQuery = vi.fn((options: any) => ({ ...queryResult.value, options }))
const useQueries = vi.fn((options: any) => queriesResult)
const useInfiniteQuery = vi.fn((options: any) => ({ ...infiniteResult, options }))
const useQueryClient = vi.fn(() => ({ prefetchQuery }))

const getPokemonsList = vi.fn()
const getPokemonDetail = vi.fn()
const getPokemonSpecies = vi.fn()
const getPokemonsByType = vi.fn()

vi.mock('@tanstack/vue-query', () => ({
  useInfiniteQuery,
  useQueries,
  useQuery,
  useQueryClient,
}))

vi.mock('../../../src/helpers/pokemon-api', () => ({
  getPokemonsList,
  getPokemonDetail,
  getPokemonSpecies,
  getPokemonsByType,
}))

describe('usePokemonQueries', async () => {
  const module = await import('../../../src/composables/usePokemonQueries')

  beforeEach(() => {
    queryResult.value = {
      data: ref(undefined),
      isLoading: ref(false),
      isError: ref(false),
      error: ref(null),
    }
    queriesResult.value = []
    useQuery.mockClear()
    useQueries.mockClear()
    useInfiniteQuery.mockClear()
    useQueryClient.mockClear()
    prefetchQuery.mockClear()
    getPokemonsList.mockReset()
    getPokemonDetail.mockReset()
    getPokemonSpecies.mockReset()
    getPokemonsByType.mockReset()
  })

  it('defines stable pokemon query keys', () => {
    expect(module.pokemonKeys.all).toEqual(['pokemons'])
    expect(module.pokemonKeys.lists()).toEqual(['pokemons', 'list'])
    expect(module.pokemonKeys.list({ search: 'pikachu' })).toEqual([
      'pokemons',
      'list',
      { search: 'pikachu' },
    ])
    expect(module.pokemonKeys.detail(25)).toEqual(['pokemons', 'detail', 25])
    expect(module.pokemonKeys.speciesDetail('abc')).toEqual([
      'pokemons',
      'species',
      'abc',
    ])
  })

  it('configures the infinite query and derives next page params', async () => {
    const result = module.usePokemonInfiniteQuery()
    const options = useInfiniteQuery.mock.calls[0][0]

    expect(result).toMatchObject(infiniteResult)
    expect(options.queryKey).toEqual(['pokemons', 'list'])
    expect(options.initialPageParam).toBe(0)
    expect(await options.queryFn({ pageParam: 40 })).toBeUndefined()
    expect(getPokemonsList).toHaveBeenCalledWith(20, 40)
    expect(options.getNextPageParam({ next: null })).toBeUndefined()
    expect(
      options.getNextPageParam({
        next: 'https://pokeapi.co/api/v2/pokemon?offset=60&limit=20',
      }),
    ).toBe(60)
    expect(
      options.getNextPageParam({ next: 'https://pokeapi.co/api/v2/pokemon?limit=20' }),
    ).toBeUndefined()
  })

  it('combines type query results and loading states', () => {
    queriesResult.value = [
      {
        isLoading: false,
        isError: false,
        error: null,
        data: {
          results: [
            { name: 'pikachu', url: '25' },
            { name: 'magnemite', url: '81' },
          ],
        },
      },
      {
        isLoading: true,
        isError: true,
        error: { error: new Error('boom') },
        data: {
          results: [
            { name: 'pikachu', url: '25' },
            { name: 'voltorb', url: '100' },
          ],
        },
      },
    ]

    const selectedTypes = ref(['electric', 'steel'])
    const result = module.usePokemonMultiTypeQuery(selectedTypes)
    const options = useQueries.mock.calls[0][0]

    expect(options.queries.value).toHaveLength(2)
    expect(options.queries.value[0].queryKey).toEqual([
      'pokemons',
      'list',
      { types: ['electric'] },
    ])
    expect(options.queries.value[0].enabled).toBe(true)
    options.queries.value[0].queryFn()
    expect(getPokemonsByType).toHaveBeenCalledWith('electric')
    expect(result.isLoading.value).toBe(true)
    expect(result.isError.value).toBe(true)
    expect(result.error.value).toEqual({ error: new Error('boom') })
    expect(result.results.value).toEqual([{ name: 'pikachu', url: '25' }])
  })

  it('returns empty multi-type results when disabled or incomplete', () => {
    queriesResult.value = [{ isLoading: false, isError: false, error: null, data: { results: [] } }]

    const result = module.usePokemonMultiTypeQuery(computed(() => []))
    expect(result.results.value).toEqual([])

    const options = useQueries.mock.calls[0][0]
    expect(options.queries.value).toEqual([])

    queriesResult.value = [
      { isLoading: false, isError: false, error: null, data: { results: [] } },
      { isLoading: false, isError: false, error: null, data: { results: [{ name: 'pikachu', url: '25' }] } },
    ]
    const activeResult = module.usePokemonMultiTypeQuery(computed(() => ['electric', 'steel']))
    expect(activeResult.results.value).toEqual([])

    queriesResult.value = [
      { isLoading: false, isError: false, error: null, data: undefined },
      { isLoading: false, isError: false, error: null, data: { results: [{ name: 'pikachu', url: '25' }] } },
    ]
    const fallbackResult = module.usePokemonMultiTypeQuery(computed(() => ['electric', 'steel']))
    expect(fallbackResult.results.value).toEqual([])
  })

  it('builds the search query and prefers direct detail matches', async () => {
    const search = ref(' Pikachu ')
    module.usePokemonSearchQuery(search)
    const options = useQuery.mock.calls[0][0]

    getPokemonDetail.mockResolvedValueOnce({ id: 25, name: 'pikachu' })

    expect(options.queryKey.value).toEqual([
      'pokemons',
      'list',
      { search: ' Pikachu ' },
    ])
    expect(options.enabled.value).toBe(true)
    await expect(options.queryFn()).resolves.toEqual({
      count: 1,
      next: null,
      previous: null,
      results: [
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
      ],
    })
    expect(getPokemonDetail).toHaveBeenCalledWith('pikachu')
  })

  it('falls back to list filtering when detail lookup fails and handles blank search', async () => {
    const blankSearch = ref('   ')
    module.usePokemonSearchQuery(blankSearch)
    const blankOptions = useQuery.mock.calls[0][0]
    expect(blankOptions.enabled.value).toBe(false)
    await expect(blankOptions.queryFn()).resolves.toEqual({
      count: 0,
      next: null,
      previous: null,
      results: [],
    })

    const search = ref('saur')
    module.usePokemonSearchQuery(search)
    const options = useQuery.mock.calls[1][0]

    getPokemonDetail.mockRejectedValueOnce(new Error('not found'))
    getPokemonsList
      .mockResolvedValueOnce({ count: 3, next: null, previous: null, results: [] })
      .mockResolvedValueOnce({
        results: [
          { name: 'bulbasaur', url: '1' },
          { name: 'ivysaur', url: '2' },
          { name: 'pikachu', url: '25' },
        ],
      })

    await expect(options.queryFn()).resolves.toEqual({
      count: 2,
      next: null,
      previous: null,
      results: [
        { name: 'bulbasaur', url: '1' },
        { name: 'ivysaur', url: '2' },
      ],
    })
  })

  it('builds detail, species, and all-list queries', async () => {
    const id = ref(25)
    module.usePokemonDetailQuery(id)
    const detailOptions = useQuery.mock.calls[0][0]
    getPokemonDetail.mockResolvedValueOnce({ id: 25 })
    expect(detailOptions.queryKey.value).toEqual(['pokemons', 'detail', 25])
    await detailOptions.queryFn()
    expect(getPokemonDetail).toHaveBeenCalledWith(25)

    module.usePokemonSpeciesQuery(id, ref('species-url'))
    const speciesWithUrl = useQuery.mock.calls[1][0]
    getPokemonSpecies.mockResolvedValueOnce({ id: 25 })
    expect(speciesWithUrl.enabled.value).toBe(true)
    expect(speciesWithUrl.queryKey.value).toEqual(['pokemons', 'species', 25])
    await speciesWithUrl.queryFn()
    expect(getPokemonSpecies).toHaveBeenCalledWith('species-url')

    module.usePokemonSpeciesQuery(id)
    const speciesWithoutUrl = useQuery.mock.calls[2][0]
    getPokemonDetail.mockResolvedValueOnce({ species: { url: 'derived-url' } })
    getPokemonSpecies.mockResolvedValueOnce({ id: 25 })
    await speciesWithoutUrl.queryFn()
    expect(getPokemonSpecies).toHaveBeenCalledWith('derived-url')

    module.useAllPokemonListQuery(ref(false))
    const allListOptions = useQuery.mock.calls[3][0]
    expect(allListOptions.enabled.value).toBe(false)
    expect(allListOptions.queryKey).toEqual(['pokemons', 'all-list'])
    await allListOptions.queryFn()
    expect(getPokemonsList).toHaveBeenCalledWith(10000, 0)
  })

  it('prefetches pokemon details through the query client', async () => {
    module.usePrefetchPokemon().prefetchPokemonDetail('mew')

    expect(prefetchQuery).toHaveBeenCalledWith({
      queryKey: ['pokemons', 'detail', 'mew'],
      queryFn: expect.any(Function),
      staleTime: 1000 * 60 * 60 * 24,
    })
    getPokemonDetail.mockResolvedValueOnce({ id: 151 })
    await prefetchQuery.mock.calls[0][0].queryFn()
    expect(getPokemonDetail).toHaveBeenCalledWith('mew')
  })
})
