import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'

describe('filters store sync guards', () => {
  it('guards url syncing in both directions', async () => {
    vi.resetModules()

    const { reactive } = await import('vue')

    const route = reactive({ query: { q: 'pika' } as Record<string, string> })
    const replace = vi.fn(({ query }: { query: Record<string, string> }) => {
      route.query = query
    })

    vi.doMock('vue-router', () => ({
      useRoute: () => route,
      useRouter: () => ({ replace }),
    }))

    vi.doMock('vue', async (importOriginal) => {
      const actual = await importOriginal<typeof import('vue')>()
      return {
        ...actual,
        watch(source: any, callback: any, options?: any) {
          return actual.watch(source, callback, { ...options, flush: 'sync' })
        },
      }
    })

    const { useFiltersStore } = await import('../../../src/stores/filters')
    setActivePinia(createPinia())
    const store = useFiltersStore()

    expect(store.searchInput).toBe('pika')

    store.searchInput = 'eevee'
    expect(replace).toHaveBeenCalled()
    expect(store.searchInput).toBe('eevee')
  })
})
