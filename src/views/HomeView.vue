<script setup lang="ts">
import { gsap } from 'gsap'
import { ref, computed, nextTick, useTemplateRef, watch } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFiltersStore } from '../stores/filters'
import { useFavoritesStore } from '../stores/favorites'
import {
  usePokemonInfiniteQuery,
  usePokemonMultiTypeQuery,
  usePokemonSearchQuery,
  usePrefetchPokemon,
  useFavoritePokemonListQuery,
} from '../composables/usePokemonQueries'
import { useDebounce } from '../composables/useDebounce'
import { useGsapContext } from '../composables/useGsapContext'
import { useIntersectionObserver } from '../composables/useIntersectionObserver'
import { getPokemonId, getPokemonImageUrl } from '../helpers/pokemon-api'
import { TYPE_COLORS } from '../types/pokemon'
import type { PokemonCardDisplay, PokemonShort, PokemonDetail } from '../types/pokemon'
import SearchBar from '../components/SearchBar.vue'
import FilterPanel from '../components/FilterPanel.vue'
import SortSelect from '../components/SortSelect.vue'
import PokemonGrid from '../components/PokemonGrid.vue'

const router = useRouter()
const pokemonLogo = `${import.meta.env.BASE_URL}pokemon.svg`
const heroHeader = useTemplateRef<HTMLElement>('heroHeader')
const controlsSurface = useTemplateRef<HTMLElement>('controlsSurface')
const filtersStore = useFiltersStore()
const { searchInput, selectedTypes, sortBy, showFilters, showFavoritesOnly } =
  storeToRefs(filtersStore)
const { toggleFilters } = filtersStore
const favoritesStore = useFavoritesStore()
const { prefetchPokemonDetail } = usePrefetchPokemon()
const hasAnimatedInitialGrid = ref(false)

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
  results: favoriteResults,
  isLoading: isFavoriteLoading,
  isError: isFavoriteError,
} = useFavoritePokemonListQuery(() =>
  showFavoritesView.value ? favoritesStore.favorites : [],
)

const allPokemon = computed(() => {
  if (!infiniteData.value) return []
  return infiniteData.value.pages.flatMap((page) => page.results)
})

const baseActiveList = computed(() => {
  if (debouncedSearch.value.trim()) return searchData.value?.results || []
  if (selectedTypes.value.length > 0) return typeResults.value
  if (showFavoritesView.value) return favoriteResults.value
  return allPokemon.value
})

const needsSort = computed(() => sortBy.value !== 'id-asc')

const displayedPokemon = computed<PokemonCardDisplay[]>(() => {
  const list = baseActiveList.value
  if (list.length === 0) return []

  const isFavsMode = showFavoritesView.value

  if (isFavsMode) {
    const mapped: PokemonCardDisplay[] = (list as PokemonDetail[]).map((p) => {
      const id = p.id
      const types: string[] = p.types?.map((t) => t.type.name) || []
      const firstType = types[0]
      const accentColor = firstType ? TYPE_COLORS[firstType]?.color ?? null : null

      return {
        name: p.name,
        url: `https://pokeapi.co/api/v2/pokemon/${p.id}/`,
        imageUrl: getPokemonImageUrl(id),
        paddedId: String(id).padStart(4, '0'),
        isFavorited: true,
        accentColor,
      }
    })

    const shouldSort = isFavsMode || needsSort.value
    if (shouldSort) {
      return [...mapped].sort((a, b) => {
        const idA = parseInt(a.paddedId)
        const idB = parseInt(b.paddedId)
        switch (sortBy.value) {
          case 'id-desc':
            return idB - idA
          case 'name-asc':
            return a.name.localeCompare(b.name)
          case 'name-desc':
            return b.name.localeCompare(a.name)
          default:
            return idA - idB
        }
      })
    }
    return mapped
  }

  const mapped: PokemonCardDisplay[] = (list as PokemonShort[]).map((p) => {
    const id = getPokemonId(p.url)
    const firstType = (p as any).firstType as string | undefined
    const accentColor = firstType ? TYPE_COLORS[firstType]?.color ?? null : null

    return {
      name: p.name,
      url: p.url,
      imageUrl: getPokemonImageUrl(id),
      paddedId: String(id).padStart(4, '0'),
      isFavorited: favoritesStore.isFavorite(id),
      accentColor,
    }
  })

  if (needsSort.value) {
    return [...mapped].sort((a, b) => {
      const idA = parseInt(a.paddedId)
      const idB = parseInt(b.paddedId)
      switch (sortBy.value) {
        case 'id-desc':
          return idB - idA
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        default:
          return idA - idB
      }
    })
  }
  return mapped
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

useGsapContext(heroHeader, ({ q }) => {
  gsap
    .timeline({
      defaults: {
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
    })
    .from(q('.home-hero-dots'), {
      y: -18,
      scale: 1.06,
      autoAlpha: 0,
      duration: 0.38,
    })
    .from(
      q('.home-hero-logo'),
      {
        y: 34,
        scale: 0.9,
        autoAlpha: 0,
        duration: 0.5,
        ease: 'expo.out',
      },
      0.08,
    )
    .from(
      q('.home-hero-title'),
      {
        y: 26,
        autoAlpha: 0,
        duration: 0.34,
      },
      0.18,
    )
    .from(
      q('.home-hero-copy'),
      {
        y: 20,
        autoAlpha: 0,
        duration: 0.28,
      },
      0.24,
    )
})

useGsapContext(controlsSurface, ({ q }) => {
  gsap.from(q('.home-toolbar > *'), {
    y: 18,
    autoAlpha: 0,
    duration: 0.28,
    stagger: 0.06,
    ease: 'power3.out',
    delay: 0.08,
    clearProps: 'transform,opacity,visibility',
  })
})

function goToDetail(name: string) {
  router.push({ name: 'pokemon-detail', params: { id: name } })
}

function handleRefetch() {
  refetch()
}

const isLoading = computed(() =>
  showFavoritesView.value
    ? isFavoriteLoading.value
    : isInfiniteLoading.value || isSearchLoading.value || isTypeLoading.value,
)
const isError = computed(() =>
  showFavoritesView.value ? isFavoriteError.value : isInfiniteError.value,
)
const showInfiniteScroll = computed(
  () =>
    !debouncedSearch.value.trim() &&
    selectedTypes.value.length === 0 &&
    !showFavoritesOnly.value &&
    hasNextPage.value,
)

const shouldAnimateInitialGrid = computed(
  () =>
    !hasAnimatedInitialGrid.value &&
    !debouncedSearch.value.trim() &&
    selectedTypes.value.length === 0 &&
    !showFavoritesOnly.value,
)

watch(
  () => displayedPokemon.value.length,
  async (count) => {
    if (count === 0 || hasAnimatedInitialGrid.value) return
    if (
      debouncedSearch.value.trim() ||
      selectedTypes.value.length > 0 ||
      showFavoritesOnly.value
    ) {
      return
    }

    await nextTick()
    hasAnimatedInitialGrid.value = true
  },
)

onBeforeRouteLeave(() => {
  sessionStorage.setItem('pokedex-scroll-y', String(window.scrollY))
})
</script>

<template>
  <main class="app-page relative">
    <header
      ref="heroHeader"
      class="pokemon-page-header pokemon-page-header--home relative overflow-hidden"
    >
      <div
        class="home-hero-dots absolute inset-0 opacity-10"
        style="
          background-image:
            radial-gradient(circle at 20px 20px, white 8px, transparent 8px),
            radial-gradient(circle at 80px 80px, white 8px, transparent 8px);
          background-size: 100px 100px;
        "
      ></div>
      <div class="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10 text-center">
        <div class="home-hero-logo pokemon-logo-wrapper mb-4 sm:mb-5">
          <img
            :src="pokemonLogo"
            alt="Pokémon"
            class="pokemon-logo-img mx-auto w-44 sm:w-56 md:w-72"
          />
        </div>
        <h1
          class="home-hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-3 text-white"
          style="
            font-family: 'Fredoka', sans-serif;
            text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
          "
        >
          Pokédex
        </h1>
        <p
          class="home-hero-copy text-white/90 text-lg max-w-xl mx-auto font-medium"
          style="text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2)"
        >
          Explore all {{ infiniteData?.pages[0]?.count || '...' }} Pokémon
          across every generation
        </p>
      </div>
    </header>

    <section
      ref="controlsSurface"
      class="app-surface sticky top-20 sm:top-14 z-30 border-b-2 border-gray-200 shadow-sm px-4 py-4"
    >
      <div
        class="home-toolbar max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center"
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
          :animate="shouldAnimateInitialGrid"
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
