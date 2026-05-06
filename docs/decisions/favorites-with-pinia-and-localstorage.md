# Decision: Favorites System with Pinia + localStorage

**Date:** 2026-05-06
**Status:** Accepted

## Context

We need a system for users to save their favorite Pokémon. The application already uses:
- Vue 3 with Composition API and `<script setup>`
- Pinia for state management (setup stores pattern)
- TypeScript for type safety
- Vue Router with `/pokemon/:id` detail route

The requirement is to persist favorites across browser sessions using localStorage.

## Decision

We will use `@vueuse/core`'s `useLocalStorage` composable within a Pinia setup store.

### Why useLocalStorage over plain localStorage?

1. **Reactivity out of the box**: `useLocalStorage` returns a `Ref` that automatically syncs with localStorage, eliminating manual serialization/deserialization.

2. **SSR safety**: VueUse handles server-side rendering gracefully (returns default value).

3. **Type safety**: Generic typing `useLocalStorage<number[]>('key', [])` preserves TypeScript inference.

4. **Consistency with Vue patterns**: Aligns with the project's Composition API approach.

### Why not pinia-plugin-persistedstate?

While the `pinia-plugin-persistedstate` library is popular, adding a plugin increases complexity. For a single store with a single persistence need, `useLocalStorage` is sufficient and keeps the architecture simpler.

### Store Design

```typescript
// Key design decisions:
- Setup store pattern (function-based, like existing filters.ts)
- Array of pokemon IDs (not full objects) - minimizes storage size
- ID-based lookups are O(n) but acceptable for typical favorite counts (<100)
```

## Consequences

### Positive
- Favorites persist across browser sessions without manual save logic
- Simple, focused store with clear API (`toggleFavorite`, `isFavorite`, etc.)
- No additional dependencies beyond @vueuse/core (which is generally useful)

### Negative
- localStorage has ~5MB limit; with numeric IDs this is sufficient for thousands of favorites
- No sync across devices/browsers (acceptable for MVP)

## Implementation Notes

### File Structure
- `src/stores/favorites.ts` - Pinia store using useLocalStorage
- Components that need favorite functionality import from this store

### Usage Pattern
```typescript
const favoritesStore = useFavoritesStore()

// In template or script
favoritesStore.toggleFavorite(pokemonId)
favoritesStore.isFavorite(pokemonId) // returns boolean for v-if
```

### Compatibility
- Works with existing `PokemonDetail.id` property
- VueUse 14.x compatible with Vue 3.5+ and Pinia 3.x