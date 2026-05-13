import {
  useInfiniteQuery,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import {
  getPokemonsList,
  getPokemonDetail,
  getPokemonSpecies,
  getPokemonsByType,
  getEvolutionChain,
  parseEvolutionChain,
} from '../helpers/pokemon-api'
import type { PokemonResultList, PokemonShort, PokemonDetail } from '../types/pokemon'
import { computed, type MaybeRefOrGetter, toValue, readonly } from 'vue'

export const pokemonKeys = {
  all: ['pokemons'] as const,
  lists: () => [...pokemonKeys.all, 'list'] as const,
  list: (filters: { search?: string; types?: string[] }) =>
    [...pokemonKeys.lists(), filters] as const,
  details: () => [...pokemonKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...pokemonKeys.details(), id] as const,
  species: () => [...pokemonKeys.all, 'species'] as const,
  speciesDetail: (id: string | number) =>
    [...pokemonKeys.species(), id] as const,
  evolution: () => [...pokemonKeys.all, 'evolution'] as const,
  evolutionChain: (url: string) => [...pokemonKeys.evolution(), url] as const,
  nameIndex: () => [...pokemonKeys.all, 'name-index'] as const,
  favoriteList: (ids: number[]) => [...pokemonKeys.all, 'favorites', ids] as const,
}

const STALE_TIME = 1000 * 60 * 60 * 24

export function usePokemonInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: pokemonKeys.lists(),
    queryFn: async ({ pageParam = 0 }) => getPokemonsList(20, pageParam),
    getNextPageParam: (lastPage: PokemonResultList) => {
      if (!lastPage.next) return undefined
      const url = new URL(lastPage.next)
      const offset = url.searchParams.get('offset')
      return offset ? Number(offset) : undefined
    },
    initialPageParam: 0,
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
  })
}

export function usePokemonMultiTypeQuery(types: MaybeRefOrGetter<string[]>) {
  const typesRef = computed(() => toValue(types))

  const queries = useQueries({
    queries: computed(() =>
      typesRef.value.map((type) => ({
        queryKey: pokemonKeys.list({ types: [type] }),
        queryFn: () => getPokemonsByType(type),
        staleTime: STALE_TIME,
        enabled: typesRef.value.length > 0,
      })),
    ),
  })

  const isLoading = computed(() => queries.value.some((q: any) => q.isLoading))
  const isError = computed(() => queries.value.some((q: any) => q.isError))
  const error = computed(() => queries.value.find((q: any) => q.error)?.error)

  const results = computed(() => {
    if (typesRef.value.length === 0) return []

    const allResults = queries.value.map((q: any) => q.data?.results || [])
    if (allResults.some((r: any) => r.length === 0)) return []

    const pokemonSet = new Set(allResults[0].map((p: any) => p.name))

    for (let i = 1; i < allResults.length; i++) {
      const nextSet = new Set(allResults[i].map((p: any) => p.name))
      for (const name of pokemonSet) {
        if (!nextSet.has(name)) {
          pokemonSet.delete(name)
        }
      }
    }

    return allResults[0].filter((p: any) => pokemonSet.has(p.name))
  })

  return {
    results: readonly(results),
    isLoading: readonly(isLoading),
    isError: readonly(isError),
    error: readonly(error),
  }
}

let cachedNameIndex: { results: PokemonShort[] } | null = null

export function usePokemonSearchQuery(searchTerm: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => pokemonKeys.list({ search: toValue(searchTerm) })),
    queryFn: async () => {
      const term = toValue(searchTerm).toLowerCase().trim()
      if (!term)
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        } as PokemonResultList

      try {
        const detail = await getPokemonDetail(term)
        return {
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              name: detail.name,
              url: `https://pokeapi.co/api/v2/pokemon/${detail.id}/`,
            },
          ],
        } as PokemonResultList
      } catch {
        if (!cachedNameIndex) {
          const countData = await getPokemonsList(1, 0)
          const realCount = countData.count
          const fullData = await getPokemonsList(realCount, 0)
          cachedNameIndex = { results: fullData.results }
        }
        const filtered = cachedNameIndex.results.filter((p) =>
          p.name.includes(term),
        )
        return {
          count: filtered.length,
          next: null,
          previous: null,
          results: filtered,
        } as PokemonResultList
      }
    },
    enabled: computed(() => toValue(searchTerm).trim().length > 0),
    staleTime: 1000 * 60 * 5,
  })
}

export function usePokemonDetailQuery(
  id: MaybeRefOrGetter<string | number>,
  enabled: MaybeRefOrGetter<boolean> = true,
) {
  return useQuery({
    queryKey: computed(() => pokemonKeys.detail(toValue(id))),
    queryFn: async () => getPokemonDetail(toValue(id)),
    enabled: computed(() => !!toValue(id) && !!toValue(enabled)),
    staleTime: STALE_TIME,
  })
}

export function usePokemonSpeciesQuery(
  id: MaybeRefOrGetter<string | number>,
  url?: MaybeRefOrGetter<string | undefined>,
) {
  return useQuery({
    queryKey: computed(() => pokemonKeys.speciesDetail(toValue(id))),
    queryFn: async () => {
      const speciesUrl = toValue(url)
      if (!speciesUrl) {
        const detail = await getPokemonDetail(toValue(id))
        return getPokemonSpecies(detail.species.url)
      }
      return getPokemonSpecies(speciesUrl)
    },
    enabled: computed(() => !!toValue(id)),
    staleTime: STALE_TIME,
  })
}

export function useAllPokemonListQuery(enabled: MaybeRefOrGetter<boolean>) {
  return useQuery({
    queryKey: [...pokemonKeys.all, 'all-list'] as const,
    queryFn: () => getPokemonsList(10000, 0),
    enabled: computed(() => toValue(enabled)),
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
  })
}

export function useFavoritePokemonListQuery(
  favoriteIds: MaybeRefOrGetter<number[]>,
) {
  const idsRef = computed(() => toValue(favoriteIds))

  const queries = useQueries({
    queries: computed(() =>
      idsRef.value.map((id) => ({
        queryKey: pokemonKeys.detail(id),
        queryFn: () => getPokemonDetail(id),
        staleTime: STALE_TIME,
        enabled: idsRef.value.length > 0,
      })),
    ),
  })

  const isLoading = computed(() => queries.value.some((q: any) => q.isLoading))
  const isError = computed(() => queries.value.some((q: any) => q.isError))

  const results = computed<PokemonDetail[]>(() => {
    return queries.value
      .map((q: any) => q.data as PokemonDetail | undefined)
      .filter((r: PokemonDetail | undefined): r is PokemonDetail => r !== null)
  })

  return {
    results: readonly(results),
    isLoading: readonly(isLoading),
    isError: readonly(isError),
  }
}

const prefetchThrottle = new Map<string | number, number>()
const PREFETCH_TTL_MS = 2000

export function usePrefetchPokemon() {
  const queryClient = useQueryClient()

  return {
    prefetchPokemonDetail(id: string | number) {
      const now = Date.now()
      const lastPrefetch = prefetchThrottle.get(id)
      if (lastPrefetch && now - lastPrefetch < PREFETCH_TTL_MS) {
        return
      }
      prefetchThrottle.set(id, now)
      queryClient.prefetchQuery({
        queryKey: pokemonKeys.detail(id),
        queryFn: () => getPokemonDetail(id),
        staleTime: STALE_TIME,
      })
    },
  }
}

export function useEvolutionChainQuery(
  url: MaybeRefOrGetter<string | undefined>,
) {
  return useQuery({
    queryKey: computed(() => pokemonKeys.evolutionChain(toValue(url) || '')),
    queryFn: async () => {
      const chainUrl = toValue(url)
      if (!chainUrl) return null
      const raw = await getEvolutionChain(chainUrl)
      return parseEvolutionChain(raw.chain)
    },
    enabled: computed(() => !!toValue(url)),
    staleTime: STALE_TIME,
  })
}
