import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useTeamStore } from '../stores/team'
import { useTeamDetailQueries } from './useTeamDetailQueries'
import { getAllDefaultPokemonWithTypes } from '../helpers/pokemon-api'
import { getHelpfulTypes, getSuggestedPokemon } from '../helpers/team-suggestions'
import type { PokemonTypeName } from '../helpers/type-chart'

const CANDIDATE_QUERY_KEY = ['team-suggestions', 'candidates'] as const
const STALE_TIME = 1000 * 60 * 60 * 24

export function useTeamSuggestions() {
  const teamStore = useTeamStore()
  const { teamTypes } = useTeamDetailQueries()

  const teamIds = computed(() => new Set(teamStore.team.map((m) => m.id)))

  const {
    data: candidates,
    isLoading: candidatesLoading,
    isError: candidatesError,
  } = useQuery({
    queryKey: CANDIDATE_QUERY_KEY,
    queryFn: async () => {
      const raw = await getAllDefaultPokemonWithTypes()
      const validTypes = new Set<string>([
        'normal',
        'fire',
        'water',
        'electric',
        'grass',
        'ice',
        'fighting',
        'poison',
        'ground',
        'flying',
        'psychic',
        'bug',
        'rock',
        'ghost',
        'dragon',
        'dark',
        'steel',
        'fairy',
      ])
      return raw
        .filter((p) => p.types.length > 0)
        .map((p) => ({
          id: p.id,
          name: p.name,
          types: p.types.filter((t): t is PokemonTypeName => validTypes.has(t)),
        }))
    },
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
  })

  const helpfulTypes = computed(() => {
    if (teamTypes.value.length === 0) return []
    return getHelpfulTypes(teamTypes.value, 5)
  })

  const suggestedPokemon = computed(() => {
    if (teamTypes.value.length === 0 || !candidates.value) return []
    const pool = candidates.value.filter((c) => !teamIds.value.has(c.id))
    return getSuggestedPokemon(pool, teamTypes.value, 5)
  })

  const isLoading = computed(() => candidatesLoading.value)
  const isError = computed(() => candidatesError.value)

  return {
    helpfulTypes,
    suggestedPokemon,
    isLoading,
    isError,
  }
}
