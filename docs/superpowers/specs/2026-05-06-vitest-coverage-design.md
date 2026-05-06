# Vitest 100% Coverage Design

**Date:** 2026-05-06

## Goal

Add a Vitest-based test stack and reach 100% coverage for code files under `src/**/*`, excluding non-code assets and `src/style.css`.

Coverage will be enforced for:

- Statements
- Branches
- Functions
- Lines

## Scope

Included:

- `src/**/*.ts`
- `src/**/*.vue`

Excluded:

- `src/assets/**/*`
- `src/style.css`

The goal is full coverage of application code as it exists today, not a broader refactor of the app architecture.

## Current Constraints

- The project has no existing test stack.
- The app uses Vue 3, Pinia, Vue Router, and TanStack Vue Query.
- Some behaviors depend on browser APIs and persisted storage.
- Routing behavior includes known `KeepAlive` and scroll-restoration constraints documented in `docs/learnings/scroll-restoration-with-keepalive.md` and `docs/learnings/keepalive-detail-route-bug.md`.
- `favorites.ts` persists through `localStorage`.
- `team.ts` persists through `sessionStorage`.
- `filters.ts` synchronizes state with URL query params and must be tested with a router harness.

## Recommended Approach

Use a mixed strategy:

1. Direct unit tests for pure helpers, stores, and simple composables.
2. Mounted component tests for presentational Vue components.
3. Integration-style component tests for route views and orchestration-heavy components.

This keeps production changes minimal while still making 100% coverage realistic.

## Test Stack

Install and configure:

- `vitest`
- `@vitest/coverage-v8`
- `@vue/test-utils`
- `jsdom`

Configuration changes:

- Add `test` and `test:coverage` scripts to `package.json`.
- Extend `vite.config.ts` with a `test` block.
- Use `jsdom` as the environment.
- Add a global test setup file.
- Configure coverage thresholds at `100` for statements, branches, functions, and lines.
- Limit coverage inputs to code under `src/**/*` while excluding assets and `src/style.css`.

## Test Architecture

### Shared Setup

Create a central test setup file that provides:

- `fetch` mocking support
- `IntersectionObserver` mock
- `localStorage` and `sessionStorage` test doubles
- scroll-related mocks such as `window.scrollY`
- any required DOM setup for mounted Vue components

### Shared Harnesses

Create small reusable test helpers for:

- mounting Vue components with Pinia
- mounting Vue components with Router
- mounting Vue components with a fresh Vue Query client
- flushing async query updates and fake timers where needed

These helpers should stay small and focused so individual test files remain readable.

## Coverage Strategy by Area

### Bootstrap and App Shell

Files:

- `src/main.ts`
- `src/App.vue`
- `src/router/index.ts`
- `src/stores/pinia.ts`

Strategy:

- Test `main.ts` with module mocks around `createApp().use().mount()` so bootstrap wiring is executed without mounting the full application.
- Test `App.vue` with a router harness to verify the slot-based `router-view` + `KeepAlive include="HomeView"` behavior.
- Test `router/index.ts` directly for all documented `scrollBehavior` branches, especially the phantom `home -> home` case and detail-to-home restoration via `sessionStorage`.
- Smoke-test `pinia.ts` to ensure the shared Pinia instance is exported and usable.

### Helpers and Types

Files:

- `src/helpers/pokemon-api.ts`
- `src/helpers/type-chart.ts`
- `src/types/pokemon.ts`
- `src/types/index.ts`

Strategy:

- Test helper logic directly.
- Mock `fetch` to cover success, failure, and edge-case parsing branches in API helpers.
- Import and exercise exported constants or helpers so code-bearing type modules are counted.

### Stores

Files:

- `src/stores/favorites.ts`
- `src/stores/team.ts`
- `src/stores/filters.ts`

Strategy:

- Use real Pinia instances for store tests.
- Verify persistence behavior for favorites and team state.
- Test `filters.ts` with a real memory-router harness so query-param synchronization and re-entrancy guards are covered.

### Composables

Files:

- `src/composables/useDebounce.ts`
- `src/composables/useIntersectionObserver.ts`
- `src/composables/usePokemonQueries.ts`
- `src/composables/useTeamDetailQueries.ts`

Strategy:

- Test `useDebounce.ts` with fake timers.
- Test `useIntersectionObserver.ts` with a controlled `IntersectionObserver` mock.
- Test query composables with small host components and fresh Vue Query clients.
- Cover success, loading, empty, and error branches by mocking query functions and API responses.

### Presentational Components

Files include components such as:

- `SearchBar.vue`
- `SortSelect.vue`
- `PokemonTypeBadge.vue`
- `StatBar.vue`
- `PokemonSprites.vue`
- `PokemonSpeciesInfo.vue`
- `PokemonMoves.vue`
- `PokemonHero.vue`
- `PokemonStats.vue`
- `PokemonAbilities.vue`

Strategy:

- Mount each component with representative props.
- Assert rendering, fallbacks, emitted events, and conditional branches.
- Avoid shallow tests unless they reduce noise without skipping the component's own behavior.

### Orchestration Components and Views

Files include:

- `HomeView.vue`
- `DetailView.vue`
- `TeamBuilderView.vue`
- `PokemonGrid.vue`
- `PokemonCard.vue`
- `FilterPanel.vue`
- `PokemonSelectorModal.vue`
- `TeamWeaknessChart.vue`
- `TeamSlot.vue`

Strategy:

- Use integration-style mounted tests with Router, Pinia, and Vue Query.
- Stub child components only when the parent's behavior is the target and the child has its own dedicated coverage elsewhere.
- Cover loading, error, empty, success, search, filter, modal, navigation, and persistence-related branches.
- Preserve existing router constraints in tests:
  - `App.vue` should cache only `HomeView`.
  - detail navigation should not rely on cached detail views.
  - scroll restoration tests should align with `sessionStorage`-based behavior.

## Error Handling Coverage

Tests must intentionally cover failure paths, not just success paths.

Required error scenarios include:

- failed API fetches
- rejected query functions
- missing or malformed persisted storage values where code handles them
- empty result sets
- conditional UI fallback states

Any code that currently assumes success should be tested against its real behavior, not rewritten unless testing reveals an actual bug.

## Production Code Changes

Default position: do not refactor production code just to satisfy test preferences.

Allowed production changes:

- small testability adjustments if a file is otherwise impractical to execute
- bug fixes uncovered by tests
- minimal extraction only if a view contains logic that cannot be exercised reliably through mounting

Non-goals:

- broad component decomposition unrelated to the coverage goal
- architecture changes that are not required for correctness or test execution

## Verification Plan

Implementation is complete when all of the following are true:

1. `pnpm test` passes.
2. `pnpm test:coverage` passes.
3. Coverage reports show `100` for statements, branches, functions, and lines within the scoped `src/**/*` code files.
4. `pnpm build` still passes.

## Risks

- `HomeView.vue` is the highest-risk coverage target because it combines debounce, filtering, infinite query behavior, scroll persistence, and intersection observation.
- `filters.ts` is sensitive because it performs two-way synchronization with router state.
- `main.ts` and `App.vue` may require carefully targeted module mocking to execute without fragile global setup.

These risks are acceptable and do not justify a refactor-first approach.

## Implementation Order

1. Install the test stack and configure Vitest.
2. Add global setup and shared test helpers.
3. Cover pure helpers, types, and simple stores first.
4. Cover composables.
5. Cover presentational components.
6. Cover route views and orchestration-heavy components.
7. Run coverage, identify remaining gaps, and fill them.
8. Run the build to confirm no regressions.
