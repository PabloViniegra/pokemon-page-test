# Decision: Use Reactive Route Id for Detail Queries

Date: 2026-05-11

## Context

The detail route (`/pokemon/:id`) reuses the same view component instance when only `:id` changes. Query composables were receiving a non-reactive primitive route id, so data did not refresh on in-view navigation (e.g., evolution chain card clicks).

## Decision

Create a reactive route id getter in `DetailView.vue` and pass it to query composables:

- `const pokemonId = computed(() => props.id)`
- `usePokemonDetailQuery(pokemonId)`
- `usePokemonSpeciesQuery(pokemonId, ...)`

## Why

- Matches the composable contract (`MaybeRefOrGetter`)
- Keeps query keys in sync with route updates
- Avoids remount-only assumptions for route param changes

## Consequences

- Detail data updates correctly when navigating between Pokemon inside the same view.
- Added unit regression coverage asserting query id reactivity on `setProps({ id })`.
