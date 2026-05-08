<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFiltersStore } from '../stores/filters'
import { useFavoritesStore } from '../stores/favorites'
import {
  usePokemonInfiniteQuery,
  usePokemonMultiTypeQuery,
  usePokemonSearchQuery,
  usePrefetchPokemon,
  useAllPokemonListQuery,
} from '../composables/usePokemonQueries'
import { useDebounce } from '../composables/useDebounce'
import { useIntersectionObserver } from '../composables/useIntersectionObserver'
import { getPokemonId } from '../helpers/pokemon-api'
import SearchBar from '../components/SearchBar.vue'
import FilterPanel from '../components/FilterPanel.vue'
import SortSelect from '../components/SortSelect.vue'
import PokemonGrid from '../components/PokemonGrid.vue'

const router = useRouter()
const pokemonLogo = '/pokemon.svg'
const filtersStore = useFiltersStore()
const { searchInput, selectedTypes, sortBy, showFilters, showFavoritesOnly } =
  storeToRefs(filtersStore)
const { toggleFilters } = filtersStore
const favoritesStore = useFavoritesStore()
const { prefetchPokemonDetail } = usePrefetchPokemon()

const debouncedSearch = useDebounce(searchInput, 400)

const {
  data: infiniteData,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading: isInfiniteLoading,
  isError: isInfiniteError,
  refetch,
} = usePokemonInfiniteQuery()

const { data: searchData, isLoading: isSearchLoading } =
  usePokemonSearchQuery(debouncedSearch)
const { results: typeResults, isLoading: isTypeLoading } =
  usePokemonMultiTypeQuery(selectedTypes)

const showFavoritesView = computed(
  () =>
    showFavoritesOnly.value &&
    !debouncedSearch.value.trim() &&
    selectedTypes.value.length === 0,
)

const {
  data: allListData,
  isLoading: isAllListLoading,
  isError: isAllListError,
  refetch: refetchAllList,
} = useAllPokemonListQuery(showFavoritesView)

const allPokemon = computed(() => {
  if (!infiniteData.value) return []
  return infiniteData.value.pages.flatMap((page) => page.results)
})

  const activeList = computed(() => {
    if (debouncedSearch.value.trim()) return searchData.value?.results || []
    if (selectedTypes.value.length > 0) return typeResults.value
    if (showFavoritesView.value) return allListData.value?.results || []
    return allPokemon.value
  })

const displayedPokemon = computed(() => {
  let list = [...activeList.value]
  if (showFavoritesOnly.value) {
    list = list.filter((p) => favoritesStore.isFavorite(getPokemonId(p.url)))
  }
  list.sort((a, b) => {
    const idA = getPokemonId(a.url)
    const idB = getPokemonId(b.url)
    switch (sortBy.value) {
      case 'id-asc':
        return idA - idB
      case 'id-desc':
        return idB - idA
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      default:
        return 0
    }
  })
  return list
})

const loadMoreTrigger = ref<HTMLElement | null>(null)
useIntersectionObserver(
  loadMoreTrigger,
  () => {
    if (hasNextPage.value && !isFetchingNextPage.value) {
      fetchNextPage()
    }
  },
  { rootMargin: '200px' },
)

function goToDetail(name: string) {
  router.push({ name: 'pokemon-detail', params: { id: name } })
}

function handleRefetch() {
  if (showFavoritesView.value) {
    refetchAllList()
  } else {
    refetch()
  }
}

const isLoading = computed(() =>
  showFavoritesView.value
    ? isAllListLoading.value
    : isInfiniteLoading.value || isSearchLoading.value || isTypeLoading.value,
)
const isError = computed(() =>
  showFavoritesView.value ? isAllListError.value : isInfiniteError.value,
)
const showInfiniteScroll = computed(
  () =>
    !debouncedSearch.value.trim() &&
    selectedTypes.value.length === 0 &&
    !showFavoritesOnly.value &&
    hasNextPage.value,
)

// Persist scroll position in sessionStorage so it survives KeepAlive lifecycle
onBeforeRouteLeave(() => {
  sessionStorage.setItem('pokedex-scroll-y', String(window.scrollY))
})
</script>

<template>
  <main class="app-page relative">
    <header class="pokemon-page-header pokemon-page-header--home relative overflow-hidden">
      <div
        class="absolute inset-0 opacity-10"
        style="
          background-image:
            radial-gradient(circle at 20px 20px, white 8px, transparent 8px),
            radial-gradient(circle at 80px 80px, white 8px, transparent 8px);
          background-size: 100px 100px;
        "
      ></div>
      <div class="relative z-10 max-w-7xl mx-auto px-4 py-10 text-center">
        <div class="pokemon-logo-wrapper mb-5">
          <img
            :src="pokemonLogo"
            alt="Pokémon"
            class="pokemon-logo-img mx-auto w-56 md:w-72"
          />
        </div>
        <h1
          class="text-6xl md:text-7xl font-black tracking-tighter mb-3 text-white"
          style="
            font-family: 'Fredoka', sans-serif;
            text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
          "
        >
          Pokédex
        </h1>
        <p
          class="text-white/90 text-lg max-w-xl mx-auto font-medium"
          style="text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2)"
        >
          Explore all {{ infiniteData?.pages[0]?.count || '...' }} Pokémon
          across every generation
        </p>
      </div>
    </header>

    <section
      class="app-surface sticky top-14 z-30 border-b-2 border-gray-200 shadow-sm px-4 py-4"
    >
      <div
        class="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center"
      >
        <SearchBar v-model="searchInput" />
        <SortSelect v-model="sortBy" />
        <button
          @click="toggleFilters"
          class="bg-gray-100 border-2 border-gray-200 rounded-2xl px-5 py-3 text-gray-900 hover:bg-gray-200 transition-colors font-semibold flex items-center gap-2"
          :class="{
            'bg-blue-500 text-white border-blue-500':
              selectedTypes.length > 0 || showFavoritesOnly,
          }"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
          <span
            v-if="selectedTypes.length > 0 || showFavoritesOnly"
            class="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold"
          >
            {{ selectedTypes.length + (showFavoritesOnly ? 1 : 0) }}
          </span>
        </button>
      </div>

      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2 max-h-0"
        enter-to-class="opacity-100 translate-y-0 max-h-96"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 max-h-96"
        leave-to-class="opacity-0 -translate-y-2 max-h-0"
      >
        <div v-show="showFilters" class="overflow-hidden">
          <div class="max-w-7xl mx-auto pt-4 pb-2">
            <FilterPanel />
          </div>
        </div>
      </transition>
    </section>

    <section class="px-4 py-8 max-w-7xl mx-auto">
      <div
        v-if="isLoading && displayedPokemon.length === 0"
        class="flex flex-col items-center justify-center py-24 gap-6"
      >
        <div class="relative w-20 h-20">
          <div
            class="absolute inset-0 border-4 border-gray-200 rounded-full"
          ></div>
          <div
            class="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
          ></div>
        </div>
        <p class="text-gray-500 font-semibold animate-pulse">
          Loading Pokémon...
        </p>
      </div>

      <div v-else-if="isError" class="text-center py-24">
        <div class="text-6xl mb-4">⚠️</div>
        <p class="text-red-600 font-bold text-lg mb-2">Something went wrong</p>
        <p class="text-gray-500 font-medium text-sm mb-6">
          We couldn't load the Pokémon list. Check your connection and try
          again.
        </p>
        <button
          @click="handleRefetch"
          class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
        >
          Try again
        </button>
      </div>

      <div v-else>
        <PokemonGrid
          :pokemons="displayedPokemon"
          :animate="!debouncedSearch"
          @select="goToDetail"
          @hover="prefetchPokemonDetail"
        />

        <div
          v-if="showInfiniteScroll"
          ref="loadMoreTrigger"
          class="flex justify-center py-12"
        >
          <div
            v-if="isFetchingNextPage"
            class="flex flex-col items-center gap-4"
          >
            <div class="relative w-12 h-12">
              <div
                class="absolute inset-0 border-4 border-gray-200 rounded-full"
              ></div>
              <div
                class="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
              ></div>
            </div>
            <p class="text-gray-400 font-medium text-sm animate-pulse">
              Loading more...
            </p>
          </div>
        </div>

        <div
          v-if="displayedPokemon.length === 0 && !isLoading"
          class="text-center py-24"
        >
          <div class="text-6xl mb-4">🔍</div>
          <p class="text-gray-600 font-bold text-lg">No Pokémon found</p>
          <p class="text-gray-400 font-medium text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
