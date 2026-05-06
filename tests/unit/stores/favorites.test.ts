import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, beforeEach } from 'vitest'
import { useFavoritesStore } from '../../../src/stores/favorites'

describe('favorites store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('adds, toggles, removes, and clears favorites', () => {
    const store = useFavoritesStore()

    expect(store.isFavorite(25)).toBe(false)

    store.addFavorite(25)
    expect(store.favorites).toEqual([25])

    store.addFavorite(25)
    expect(store.favorites).toEqual([25])

    store.toggleFavorite(1)
    expect(store.favorites).toEqual([25, 1])

    store.toggleFavorite(25)
    expect(store.favorites).toEqual([1])

    store.removeFavorite(999)
    expect(store.favorites).toEqual([1])

    store.removeFavorite(1)
    expect(store.favorites).toEqual([])

    store.addFavorite(4)
    store.clearFavorites()
    expect(store.favorites).toEqual([])
  })

  it('hydrates from localStorage', () => {
    localStorage.setItem('pokemon-favorites', '[7,8]')
    const store = useFavoritesStore()

    expect(store.favorites).toEqual([7, 8])
  })
})
