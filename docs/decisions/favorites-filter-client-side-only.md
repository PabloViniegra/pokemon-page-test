# Decision: Favorites filter is client-side only

## Context
We needed a toggle to show only favorited Pokémon on the home page.

## Decision
Keep the favorites filter purely client-side by intersecting the already-loaded Pokémon list with the IDs stored in `useFavoritesStore` (localStorage). No API parameter is sent to PokeAPI.

## Rationale
- **Simplicity**: No backend or query-cache changes required. The existing `usePokemonInfiniteQuery`, `usePokemonSearchQuery`, and `usePokemonMultiTypeQuery` composables remain untouched.
- **Consistency**: The app already uses Pinia + localStorage for favorites (`useFavoritesStore`). Reusing that store keeps the feature DRY.
- **Trade-off**: If a user enables "Favorites only" before scrolling far enough, a favorite Pokémon that hasn't been fetched yet won't appear. This is acceptable for a lightweight UX enhancement; users can simply scroll to load more or disable the toggle.

## Implementation notes
- Added `showFavoritesOnly` to the `filters` Pinia store and synced it to the URL query param `fav=1` using the same two-way-sync pattern (`syncingFromUrl` / `syncingToUrl`) already used for `q`, `types`, and `sort`.
- Filter logic lives in `HomeView.displayedPokemon`, applied after `activeList` is resolved and before sorting.
- Infinite scroll is disabled while the toggle is active because we cannot request "only favorites" from the API.
