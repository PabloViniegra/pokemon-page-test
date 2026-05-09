# Performance Optimization Design

Date: 2026-05-09

## Summary

This design defines a moderate-scope performance pass for the Pokemon app focused on balanced improvements across startup cost, home-page runtime, and detail-page render cost.

The goal is to improve perceived speed without changing the app's core information architecture, KeepAlive scroll-restoration behavior, or filter URL-sync model.

## Goals

- Reduce initial JavaScript cost by splitting route code and removing development-only tooling from production bundles.
- Eliminate the current `getPokemonsList(10000, 0)` pattern from normal user flows.
- Reduce avoidable work on the home page during search, favorites mode, hover prefetch, and large-list rendering.
- Improve detail-page first render by prioritizing above-the-fold content and deferring heavier lower-page sections.
- Preserve current user-facing behavior unless a small UX adjustment directly supports performance.

## Non-Goals

- No full rewrite of the data layer.
- No list virtualization/windowing in this pass.
- No changes to the existing KeepAlive + scroll-restoration strategy.
- No backend, service worker, or CDN changes.
- No visual redesign beyond small UI changes needed to support deferred content.

## Baseline Observations

Current code inspection shows these primary hotspots:

- `src/router/index.ts` statically imports all views, so all route code ships in the first bundle.
- `src/App.vue` always mounts `VueQueryDevtools` and eagerly loads duplicated theme-toggle artwork.
- `src/composables/usePokemonQueries.ts` uses `getPokemonsList(10000, 0)` for search fallback and favorites-only mode.
- `src/views/HomeView.vue` clones, filters, and sorts the active list on every relevant reactive update.
- `src/components/PokemonCard.vue` derives display state by reading Vue Query cache per card.
- `src/views/DetailView.vue` renders all major sections immediately, including heavy lower-page content.
- `src/components/PokemonMoves.vue` renders the entire moves list on first paint.

Observed production build baseline before optimization:

- `dist/assets/index-sIPdrKPk.js`: 237.72 kB uncompressed, 79.67 kB gzip
- `dist/assets/index-Be5VbfCA.css`: 56.65 kB uncompressed, 11.34 kB gzip

## Recommended Approach

Use a balanced performance pass that addresses the largest avoidable costs first:

1. Reduce startup and bundle cost.
2. Replace oversized fetch patterns with cache-aware, scoped queries.
3. Trim hot-path render work on the home page.
4. Defer non-critical detail content below the fold.

This approach gives better risk-adjusted gains than a home-only pass or a route-splitting-only pass, while avoiding the complexity of virtualization.

## Architecture

The existing app shape remains intact.

- Route/view boundaries stay the same.
- `HomeView` remains the main orchestration surface for the Pokedex page.
- `DetailView` remains the composition surface for the detail page.
- Query orchestration continues to live in `src/composables/usePokemonQueries.ts`.
- `KeepAlive` stays centered on `HomeView` exactly as it is today.

The optimization work is divided into three layers:

### 1. Bundle and startup

- Convert route component imports in `src/router/index.ts` to lazy `import()` functions.
- Keep `HomeView` cacheable through the existing `KeepAlive include="HomeView"` setup.
- Mount `VueQueryDevtools` only in development.
- Reduce unnecessary eager image work in the theme toggle where it does not materially help UX.

### 2. Data fetching

- Remove dependency on `getPokemonsList(10000, 0)` for search fallback.
- Remove dependency on the full-list query for favorites-only mode.
- Keep the existing infinite-query default feed.
- Keep type-filter queries, but only pay their cost when active.
- Make hover prefetch more selective so rapid cursor movement does not create unnecessary detail fetches.

### 3. Rendering

- Push card display data derivation upward so each card receives stable display props.
- Reduce repeated cloning and sorting work on home-page updates.
- Defer lower detail sections until after the first content is visible.
- Render only an initial slice of the moves list by default, with explicit user expansion.

## Component Plan

### `src/router/index.ts`

- Replace static imports with route-level lazy imports for:
  - `HomeView`
  - `DetailView`
  - `TeamBuilderView`
  - `GameView`

Expected impact:

- Smaller initial entry chunk.
- Route code downloaded closer to actual navigation time.

### `src/App.vue`

- Keep the existing `router-view` slot pattern and `KeepAlive include="HomeView"` configuration.
- Render `VueQueryDevtools` only when `import.meta.env.DEV` is true.
- Review theme-toggle image loading and remove unnecessary eager duplication where possible without changing the control's visual design.

Expected impact:

- Production users avoid devtools bundle/runtime overhead.
- Less unnecessary image pressure from always-eager duplicated artwork.

### `src/composables/usePokemonQueries.ts`

- Keep this file as the main query orchestration point.
- Add a name-index query for fallback search using the API's real count rather than a hardcoded `10000` limit.
- Keep exact search-by-name or search-by-id as the first path.
- Replace the favorites-only full-list query with a favorites-detail query path keyed by favorite IDs.
- Keep type queries as-is conceptually, but ensure they do not add work when no types are selected.
- Add selective prefetch behavior so repeated hovers do not always trigger new prefetch work.

Expected impact:

- Search fallback scales with actual search behavior rather than loading the full catalog in one oversized request.
- Favorites-only mode scales with number of favorites instead of total Pokemon count.
- Hovering across many cards produces less network and cache churn.

### `src/views/HomeView.vue`

- Keep `HomeView` as the page container.
- Remove the need for `useAllPokemonListQuery(showFavoritesView)` in favorites-only mode.
- Build the displayed list from one active source at a time:
  - infinite pages for default browsing,
  - exact or fallback search results for text search,
  - type-intersection results for active type filters,
  - favorite detail results for favorites-only mode.
- Minimize clone-and-sort work so data is only copied when needed for ordering.
- Preserve the current infinite-scroll behavior and the current scroll-position persistence model.

Expected impact:

- Less CPU work during normal home interactions.
- No forced global list fetch just to show favorites.

### `src/components/PokemonGrid.vue`

- Keep the component as the presentational grid.
- Accept slimmer, stable card display data instead of requiring each card to derive as much on its own.
- Limit mount-time animation work to the truly initial visible set rather than treating every large render the same way.

Expected impact:

- Lower reactive and animation overhead across large lists.

### `src/components/PokemonCard.vue`

- Keep the existing visual structure and favorite toggle behavior.
- Stop reading Vue Query cache inside each card to derive accent color.
- Receive the display data needed for rendering through props, including any card accent information when available.
- Keep lazy image loading for lower items and only eagerly load the earliest visible cards.

Expected impact:

- Less per-card reactive overhead.
- Clearer data flow and more predictable rendering cost.

### `src/views/DetailView.vue`

- Keep current page composition and the current main query chain.
- Prioritize rendering of:
  - hero
  - stats
  - essential species context already needed near the top
- Defer heavier lower-page sections so they do not compete with first render.
- Defer at least the moves section, and optionally other lower sections if implementation remains simple and behavior stays clear.

Expected impact:

- Faster above-the-fold rendering on detail pages.
- Better perceived responsiveness after navigation from the home list.

### `src/components/PokemonMoves.vue`

- Keep the section but reduce its default render cost.
- Show a small initial slice of moves on first render.
- Add a simple expand/collapse control to reveal the full list on demand.
- Preserve the rest of the section content for game appearances, held items, and past types.

Expected impact:

- Lower initial DOM size and paint cost for high-move-count Pokemon.

## Data Flow

### Default home feed

- Source: `usePokemonInfiniteQuery()`
- Behavior: unchanged infinite paging model
- Sorting: applied only when needed for the active list shown to the user

### Search

Search keeps a two-step approach:

1. Try exact lookup via `getPokemonDetail(term)`.
2. If exact lookup fails, use a cached name index query to search names client-side.

The fallback query should:

- use the API's reported count instead of hardcoding `10000`,
- fetch only the list data needed for names and URLs,
- cache the result for reuse across later search attempts.

### Favorites-only mode

Favorites stay client-side conceptually, but the data source changes.

- Current behavior depends on a full-list fetch plus local ID filtering.
- New behavior queries details only for favorited IDs and maps those results into the display contract used by the grid.

This preserves the existing favorites store shape:

- `favorites` continues storing `number[]` IDs in localStorage.
- No migration of existing localStorage data is required.

### Type filters

- Source: `usePokemonMultiTypeQuery(selectedTypes)`
- Behavior: unchanged intersection model
- Constraint: no extra work when the filter array is empty

### Card display data

Card rendering should use a small explicit display contract instead of ad hoc per-card derivation.

That contract should be sufficient to render:

- name
- URL or ID
- image URL
- padded dex number
- favorite state
- optional accent color

The exact TypeScript shape can be chosen during implementation, but it should live near the Pokemon type definitions or close to the home/grid feature boundary.

### Detail-page deferral

- Main detail, species, and evolution queries remain query-driven.
- Lower sections are deferred at the view/component level rather than changing the top-level route structure.
- Deferred sections should still receive the same data contracts they do today.

## Error Handling

- Preserve the current page-level loading and error states for the main home and detail flows.
- Search fallback failures should surface through existing home-page error handling rather than silently returning empty results.
- Favorites-only mode should degrade gracefully:
  - if one favorite detail request fails, successfully fetched favorites should still render,
  - failure of one favorite should not blank the full favorites view if partial data exists.
- Deferred lower detail sections should fail locally where practical so the main hero and already-loaded content remain usable.

## Testing Plan

Update or add unit coverage for the changed behavior.

### `tests/unit/composables/usePokemonQueries.test.ts`

- exact search path still returns the matched Pokemon
- fallback search path uses the cached name-index behavior
- favorites-only flow no longer depends on the full-list query
- selective prefetch avoids repeated unnecessary work

### `tests/unit/views/home-view.test.ts`

- default feed branch still renders correctly
- search branch still renders correctly
- type-filter branch still renders correctly
- favorites-only branch renders from favorite detail results
- infinite scroll stays disabled in the expected modes

### `tests/unit/components/pokemon-card.test.ts`

- card renders from explicit display props
- favorite toggle behavior remains intact
- accent color rendering still works when provided

### `tests/unit/components/pokemon-grid.test.ts`

- grid renders the slimmer card-display contract correctly
- mount animation behavior remains correct for the intended initial set

### `tests/unit/views/detail-view.test.ts`

- detail page still renders top sections correctly
- deferred lower sections still become available as expected

### `tests/unit/components/pokemon-moves.test.ts`

- initial slice renders correctly
- expand control reveals the full list
- count label and ancillary sections still render correctly

## Verification Plan

Run the following after implementation:

1. `pnpm test`
2. `pnpm build`

Then verify the optimization outcomes:

- the main production entry chunk is smaller than the current baseline,
- route-specific chunks are generated,
- no regression in home KeepAlive behavior,
- no regression in home search focus retention,
- no regression in detail back-navigation scroll restoration.

## Risks and Mitigations

### Risk: favorites-only view may show partial data if one detail query fails

Mitigation:

- treat favorites as individually fetchable records,
- render successful results even when one request fails,
- keep existing retry/error affordances where appropriate.

### Risk: pushing too much data shaping into `HomeView` could make the view harder to maintain

Mitigation:

- keep orchestration in `HomeView`,
- move reusable display-data shaping into a small helper or composable only if the logic stops being local and readable.

### Risk: deferred detail sections could create visible layout jumps

Mitigation:

- use stable section spacing and straightforward loading placeholders where needed,
- keep the deferred behavior simple and predictable.

### Risk: route splitting could interact poorly with `KeepAlive`

Mitigation:

- preserve the current `router-view v-slot` + `KeepAlive include="HomeView"` pattern unchanged,
- verify with the existing router/app-shell tests and manual build checks.

## Rollout Order

Implementation should proceed in this order:

1. Route lazy loading and devtools gating
2. Query-layer changes for search fallback, favorites-only mode, and selective prefetch
3. Home-page display-data and render-path cleanup
4. Detail-page deferred-section pass
5. Moves-section slicing and expand/collapse
6. Test updates and final build verification

## Expected Outcome

After this pass, the app should:

- load less code up front,
- avoid oversized list fetches for common flows,
- do less repeated work on large home-page updates,
- feel faster when opening a Pokemon detail page,
- preserve current UX patterns that were intentionally stabilized earlier.
