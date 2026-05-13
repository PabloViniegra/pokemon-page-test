# Pokedex Hover Tooltip Needs a Shared Anchor and Query

## Issue

The hover tooltip did not appear reliably in the Pokedex, and `PokemonCard.vue` became overloaded with tooltip-specific state.

## Root Cause

Two implementation choices broke the behavior:

- The tooltip was teleported to `body` without real viewport coordinates from the hovered card, so it had no usable position anchor.
- Each card created its own detail query, which blurred responsibility and made hover state depend on per-card query timing.

## Fix

Measure the hovered card at the grid layer and render one shared tooltip from that anchor:

```ts
showSummary({ id, accentColor, anchorEl })
const anchorRect = anchorEl.getBoundingClientRect()
```

Keep a single active hover-detail query in a composable, then render the overlay from a dedicated tooltip component.

## Result

The tooltip now has a stable screen position, uses cached detail data more cleanly, and keeps `PokemonCard.vue` small enough to remain a presentational component.
