import { computed } from 'vue'
import { useQueries } from '@tanstack/vue-query'
import { getPokemonDetail } from '../helpers/pokemon-api'
import { pokemonKeys } from './usePokemonQueries'
import type { PokemonDetail, PokemonType } from '../types/pokemon'
import type { PokemonTypeName } from '../helpers/type-chart'
import { useTeamStore } from '../stores/team'

const STALE_TIME = 1000 * 60 * 60 * 24

export function useTeamDetailQueries() {
    const teamStore = useTeamStore()

    const queries = useQueries({
        queries: computed(() =>
            teamStore.team.map(member => ({
                queryKey: pokemonKeys.detail(member.id),
                queryFn: () => getPokemonDetail(member.id),
                staleTime: STALE_TIME,
            }))
        ),
    })

    const teamDetails = computed(() =>
        queries.value
            .map((q: any) => q.data as PokemonDetail | undefined)
            .filter(Boolean) as PokemonDetail[]
    )

    const teamTypes = computed((): PokemonTypeName[][] =>
        teamDetails.value.map(d =>
            d.types.map((t: PokemonType) => t.type.name as PokemonTypeName)
        )
    )

    const memberTypesMap = computed(() => {
        const map = new Map<number, string[]>()
        for (const d of teamDetails.value) {
            map.set(d.id, d.types.map(t => t.type.name))
        }
        return map
    })

    const isLoading = computed(() => queries.value.some((q: any) => q.isLoading))

    return { teamDetails, teamTypes, memberTypesMap, isLoading }
}
