import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const teamRef = ref([
  { id: 25, name: 'pikachu' },
  { id: 6, name: 'charizard' },
])
const queriesResult = ref<any[]>([])
const useQueries = vi.fn(() => queriesResult)
const useTeamStore = vi.fn(() => ({ team: teamRef.value }))
const getPokemonDetail = vi.fn()

vi.mock('@tanstack/vue-query', () => ({ useQueries }))
vi.mock('../../../src/stores/team', () => ({ useTeamStore }))
vi.mock('../../../src/helpers/pokemon-api', () => ({ getPokemonDetail }))

describe('useTeamDetailQueries', async () => {
  const { useTeamDetailQueries } = await import('../../../src/composables/useTeamDetailQueries')

  beforeEach(() => {
    teamRef.value = [
      { id: 25, name: 'pikachu' },
      { id: 6, name: 'charizard' },
    ]
    queriesResult.value = [
      {
        isLoading: true,
        data: {
          id: 25,
          types: [{ type: { name: 'electric' } }],
        },
      },
      {
        isLoading: false,
        data: {
          id: 6,
          types: [
            { type: { name: 'fire' } },
            { type: { name: 'flying' } },
          ],
        },
      },
      {
        isLoading: false,
        data: undefined,
      },
    ]
    useQueries.mockClear()
    getPokemonDetail.mockReset()
  })

  it('maps loaded team details into type arrays and member maps', async () => {
    const result = useTeamDetailQueries()
    const options = useQueries.mock.calls[0][0]

    expect(options.queries.value).toEqual([
      {
        queryKey: ['pokemons', 'detail', 25],
        queryFn: expect.any(Function),
        staleTime: 1000 * 60 * 60 * 24,
      },
      {
        queryKey: ['pokemons', 'detail', 6],
        queryFn: expect.any(Function),
        staleTime: 1000 * 60 * 60 * 24,
      },
    ])
    getPokemonDetail.mockResolvedValueOnce(undefined)
    await expect(options.queries.value[0].queryFn()).resolves.toBeUndefined()
    expect(result.teamDetails.value).toHaveLength(2)
    expect(result.teamTypes.value).toEqual([
      ['electric'],
      ['fire', 'flying'],
    ])
    expect(result.memberTypesMap.value.get(25)).toEqual(['electric'])
    expect(result.memberTypesMap.value.get(6)).toEqual(['fire', 'flying'])
    expect(result.isLoading.value).toBe(true)
  })
})
