# Pokeball Loader Design

Date: 2026-05-13

## Context

The app currently uses several inline loading UIs spread across route views and shared components. These loaders are visually inconsistent:
- some use a single ring spinner
- some use multiple concentric rings
- some are full-page states while others are compact inline states

The user wants to replace all loaders with a custom loader that uses the existing Pokeball SVG already used as the favicon. The Pokeball should rotate around its own center axis instead of using the current border-ring spinner visuals.

The favicon asset already exists at `public/logo.svg`.

Current loader locations:
- `src/views/HomeView.vue`
- `src/views/DetailView.vue`
- `src/views/GameView.vue`
- `src/components/TeamSuggestionsPanel.vue`
- `src/components/PokemonSelectorModal.vue`

## Goals

- Replace every current app loader with one shared Pokeball-based loader.
- Reuse the existing `public/logo.svg` asset so the loader matches the app branding.
- Keep contextual loading labels such as `Loading Pokemon...` and `Preparing next challenger...`.
- Support context-aware sizing so compact panels and full-page states both feel balanced.
- Centralize loader styling and animation so future visual tweaks happen in one place.

## Non-Goals

- Changing any loading-state logic or query behavior.
- Introducing skeleton screens or new placeholder layouts.
- Changing the wording of existing loading copy unless needed for consistency.
- Replacing non-loading empty states or error states.

## User Experience

All loading states should feel part of the same visual system.

Each loader instance will show:
- the Pokeball SVG
- continuous rotation around its own center
- optional contextual loading text below or beside it depending on the existing layout

The motion should be smooth and neutral, with no bounce, pulse, or extra decorative effects. The loader should feel branded but not distracting.

Context sizing should stay adaptive:
- full-page loaders use a larger Pokeball
- section and modal loaders use a medium Pokeball
- compact panel loaders use a smaller Pokeball

## Architecture

Use a single shared presentational component.

### New Component

- `src/components/PokeBallLoader.vue`
  - renders the Pokeball image and optional label
  - owns the rotation animation and visual sizing
  - accepts a minimal prop surface for reuse across existing loading states

### Replacement Scope

Replace inline spinner markup in the following locations with `PokeBallLoader`:
- `HomeView.vue`
  - initial page load state
  - infinite-scroll load-more state
- `DetailView.vue`
  - detail page loading state
- `GameView.vue`
  - game loading state
- `TeamSuggestionsPanel.vue`
  - suggestions loading state
- `PokemonSelectorModal.vue`
  - modal loading state

No composables, stores, or API helpers need to change.

## Component API

Keep the API intentionally small.

Proposed props:
- `label?: string`
- `size?: 'sm' | 'md' | 'lg'`

Behavior:
- if `label` is present, render the loading text
- if `label` is omitted, render a visual-only loader
- `size` determines the rendered image dimensions and spacing
- default size should be `md`

Avoid adding variant props for color, speed, or layout unless a real need appears during implementation.

## Visual and Motion Rules

- Use the existing `logo.svg` asset directly.
- Rotate the Pokeball around its center using a linear infinite animation.
- Keep the transform origin centered so the motion looks physically correct.
- Preserve image clarity at all three sizes.
- Do not recolor or redraw the asset in v1.

Suggested size mapping:
- `sm` for compact panel loaders
- `md` for inline section and modal loaders
- `lg` for full-page loading states

## Accessibility

- Decorative loader image should not create redundant screen reader noise.
- If a label is present, that text should provide the meaningful loading status.
- The component should support `role="status"` and an accessible text path so async states remain understandable.
- Animation should not block comprehension if the image fails to load; the text label must still communicate the state.

## Data Flow

1. Existing view or component loading conditions stay unchanged.
2. Each loading branch renders `PokeBallLoader` instead of bespoke spinner markup.
3. The parent passes the existing loading label and appropriate size.
4. The shared component handles all visual rendering and animation.

## Error Handling

- If the image asset fails to render, the loading label still appears.
- No fallback spinner implementation is needed unless implementation reveals a concrete browser issue.
- Existing error and empty states remain unchanged.

## Testing

Since the project does not currently include a loader-specific test suite, implementation verification should focus on:
- `pnpm build` passing
- every existing loading branch still rendering without type errors
- full-page and compact loaders looking appropriately sized
- labels still appearing in the same loading contexts as before

Manual verification targets:
- home initial load
- home infinite-scroll loading state
- detail page loading state
- game loading state
- team suggestions loading state
- Pokemon selector modal loading state

## Implementation Notes

- Prefer using the public asset path already established by the app's favicon usage.
- Keep the component presentational and avoid introducing composables for this change.
- Replace only the repeated loader markup, not surrounding spacing containers unless necessary for visual consistency.
- If a parent currently depends on very specific spinner wrapper spacing, preserve that layout and swap only the inner loader content.
