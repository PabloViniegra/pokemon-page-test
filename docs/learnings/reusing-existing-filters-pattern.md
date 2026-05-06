# Learning: Reuse existing stores and URL-sync patterns for new filters

## What we did
Added a "Favorites only" toggle filter by extending the existing filters store and FilterPanel component.

## What worked well
- Store extension: Adding showFavoritesOnly to the existing filters store required only a few lines because the URL two-way-sync scaffolding (syncingFromUrl / syncingToUrl guards, router.replace, and watchers) was already in place.
- Composable reuse: The useFavoritesStore (Pinia + localStorage) provided isFavorite() without any new persistence logic.
- UI consistency: Placing the toggle inside FilterPanel and highlighting the Filters button when active matched the existing type-filter UX pattern.

## Key takeaways
- When a codebase already has a filter state <-> URL sync layer, adding a new boolean filter is trivial: add the ref, add the query read/write, add the watcher dependency, and expose it.
- Client-side filtering on a paginated list has a known limitation (not-yet-loaded items are invisible), but for a secondary toggle this is an acceptable trade-off that keeps the data layer unchanged.
