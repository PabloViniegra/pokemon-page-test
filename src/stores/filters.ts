import { defineStore } from 'pinia'
import { ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type SortOption = 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc'

export const useFiltersStore = defineStore('filters', () => {
  const route = useRoute()
  const router = useRouter()

  const searchInput = ref('')
  const selectedTypes = ref<string[]>([])
  const sortBy = ref<SortOption>('id-asc')
  const showFilters = shallowRef(false)
  const showFavoritesOnly = ref(false)

  let syncingFromUrl = false
  let syncingToUrl = false

  function readFromUrl() {
    syncingFromUrl = true
    searchInput.value = String(route.query.q || '')
    selectedTypes.value = String(route.query.types || '')
      .split(',')
      .filter(Boolean)
    sortBy.value = String(route.query.sort || 'id-asc') as SortOption
    showFavoritesOnly.value = route.query.fav === '1'
    syncingFromUrl = false
  }

  function writeToUrl() {
    if (syncingFromUrl) return
    syncingToUrl = true
    const query: Record<string, string> = {}
    if (searchInput.value.trim()) query.q = searchInput.value.trim()
    if (selectedTypes.value.length > 0)
      query.types = selectedTypes.value.join(',')
    if (sortBy.value !== 'id-asc') query.sort = sortBy.value
    if (showFavoritesOnly.value) query.fav = '1'
    router.replace({ query })
    syncingToUrl = false
  }

  watch(
    () => route.query,
    () => {
      if (syncingToUrl) return
      readFromUrl()
    },
  )

  watch([searchInput, selectedTypes, sortBy, showFavoritesOnly], writeToUrl, {
    deep: true,
  })

  readFromUrl()

  return {
    searchInput,
    selectedTypes,
    sortBy,
    showFilters,
    showFavoritesOnly,
  }
})
