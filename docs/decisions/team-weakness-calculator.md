# Decision: Pokémon Team Weakness Calculator

Date: 2026-05-06

## Context

The user requested a new feature to allow building a team of 6 Pokémon and analyzing the team's type weaknesses. This required creating a new page, type effectiveness calculations, and UI components.

## Decisions

### 1. Hardcoded type effectiveness chart

Instead of fetching type data from PokeAPI at runtime, we hardcoded the full 18×18 type effectiveness matrix in `src/helpers/type-chart.ts`. This data is static across all game generations from Gen 6 onwards, so fetching it dynamically provides no benefit while adding network latency and complexity.

### 2. Pinia store with sessionStorage persistence

Team selection state is managed by a Pinia store (`src/stores/team.ts`) that persists to `sessionStorage`. This ensures the team survives page refreshes without requiring a backend or complex state hydration logic.

### 3. Component decomposition

The feature was split into focused components following the project's Vue 3 Composition API patterns:
- `TeamBuilderView.vue` — route-level composition surface
- `TeamSlot.vue` — individual team member slot
- `PokemonSelectorModal.vue` — searchable Pokémon picker
- `TeamWeaknessChart.vue` — weakness analysis visualization

### 4. Reused existing query infrastructure

The feature leverages the existing Vue Query setup (`usePokemonQueries.ts`) to fetch Pokémon details. Team member details are fetched via `useQueries` for parallel fetching, and the query client is used to prefetch details on selection and read cached data for type display in slots.

### 5. Global navigation added to App.vue

A persistent top navigation bar was added to `App.vue` so users can switch between the Pokédex and Team Builder from any page. This is a new UI element, but it's minimal and necessary since the app previously had no cross-page navigation.

### 6. Type weakness aggregation logic

For each of the 18 attacking types, we calculate the effectiveness against each team member (accounting for dual-types by multiplying multipliers). The team-level metric is the average effectiveness across all members. We also count weak/resistant/immune members to generate severity alerts.

Alert thresholds:
- **Critical**: All team members are weak to the type (multiplier > 1 for everyone)
- **Major**: 3+ team members are weak
- **Strength**: All team members resist or are immune

## Trade-offs

- **Hardcoded chart**: If Pokémon type mechanics ever change (unlikely), the chart must be manually updated.
- **sessionStorage vs localStorage**: sessionStorage clears when the tab closes. We chose this to avoid stale team data accumulating permanently.
- **No drag-and-drop reordering**: Simpler implementation; can be added later if needed.
