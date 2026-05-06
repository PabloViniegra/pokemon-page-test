import { createPinia, setActivePinia } from 'pinia'
import { reactive, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const route = reactive({
  query: {} as Record<string, string>,
})

const replace = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ replace }),
}))

describe('filters store', async () => {
  const { useFiltersStore } = await import('../../../src/stores/filters')

  beforeEach(() => {
    route.query = {
      q: 'pika',
      types: 'electric,steel',
      sort: 'name-desc',
      fav: '1',
    }
    replace.mockClear()
    setActivePinia(createPinia())
  })

  it('hydrates from the route query and updates the url when state changes', async () => {
    const store = useFiltersStore()

    replace.mockImplementationOnce(({ query }) => {
      route.query = query
    })

    expect(store.searchInput).toBe('pika')
    expect(store.selectedTypes).toEqual(['electric', 'steel'])
    expect(store.sortBy).toBe('name-desc')
    expect(store.showFavoritesOnly).toBe(true)

    store.searchInput = '  eevee  '
    store.selectedTypes = ['normal']
    store.sortBy = 'id-asc'
    store.toggleFavoritesOnly()
    await nextTick()

    expect(replace).toHaveBeenLastCalledWith({
      query: {
        q: 'eevee',
        types: 'normal',
      },
    })

    replace.mockImplementation(() => undefined)
  })

  it('toggles types, favorites, filters, and reacts to route changes', async () => {
    const store = useFiltersStore()

    store.toggleType('electric')
    expect(store.selectedTypes).toEqual(['steel'])

    store.toggleType('fire')
    expect(store.selectedTypes).toEqual(['steel', 'fire'])

    store.toggleFilters()
    expect(store.showFilters).toBe(true)

    store.toggleFavoritesOnly()
    expect(store.showFavoritesOnly).toBe(false)

    route.query = {}
    await nextTick()

    expect(store.searchInput).toBe('')
    expect(store.selectedTypes).toEqual([])
    expect(store.sortBy).toBe('id-asc')
    expect(store.showFavoritesOnly).toBe(false)
  })
})
