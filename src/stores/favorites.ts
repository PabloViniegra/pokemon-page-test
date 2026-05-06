import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

/**
 * Favorites store that persists Pokémon IDs to localStorage.
 * Uses VueUse's useLocalStorage for automatic persistence.
 */
export const useFavoritesStore = defineStore('favorites', () => {
    // Persist favorites to localStorage with key 'pokemon-favorites'
    const favorites = useLocalStorage<number[]>('pokemon-favorites', [])

    /**
     * Check if a Pokémon is in favorites by ID
     */
    function isFavorite(pokemonId: number): boolean {
        return favorites.value.includes(pokemonId)
    }

    /**
     * Toggle a Pokémon's favorite status
     */
    function toggleFavorite(pokemonId: number): void {
        const index = favorites.value.indexOf(pokemonId)
        if (index === -1) {
            favorites.value.push(pokemonId)
        } else {
            favorites.value.splice(index, 1)
        }
    }

    /**
     * Add a Pokémon to favorites
     */
    function addFavorite(pokemonId: number): void {
        if (!isFavorite(pokemonId)) {
            favorites.value.push(pokemonId)
        }
    }

    /**
     * Remove a Pokémon from favorites
     */
    function removeFavorite(pokemonId: number): void {
        const index = favorites.value.indexOf(pokemonId)
        if (index !== -1) {
            favorites.value.splice(index, 1)
        }
    }

    /**
     * Clear all favorites
     */
    function clearFavorites(): void {
        favorites.value = []
    }

    return {
        favorites,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        clearFavorites,
    }
})