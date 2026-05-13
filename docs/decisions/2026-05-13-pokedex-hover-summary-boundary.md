# Decision: Keep Pokedex Hover Summary Outside PokemonCard

Date: 2026-05-13

## Context

The first hover-tooltip implementation placed tooltip rendering and detail-query logic inside `PokemonCard.vue`. That made each card responsible for data fetching, hover timing, and overlay rendering, even though the existing prefetch behavior already lives higher in the Pokedex flow.

## Decision

Use a single shared hover-summary controller at the grid layer:

- `PokemonCard.vue` stays presentational and only emits hover summary events.
- `PokemonGrid.vue` owns the shared hover-summary behavior.
- `usePokemonHoverSummary.ts` manages hover delay, anchor measurement, and a single detail query.
- `PokemonHoverTooltip.vue` renders one teleported overlay for the active card.

## Why

- Avoids one detail query per mounted card.
- Keeps `PokemonCard.vue` focused on card UI and interactions.
- Gives the tooltip a real anchor rectangle for viewport positioning.
- Reuses Vue Query cache populated by hover prefetch instead of duplicating ownership.

## Consequences

- The Pokedex shows at most one hover summary at a time.
- Hover summary behavior is easier to test because it is centralized.
- Future tooltip content changes can happen in `PokemonHoverTooltip.vue` without touching card markup.
