# Decision: Vitest Unit Coverage Strategy

Date: 2026-05-06

## Context

The application had no test runner, no DOM test environment, and no shared harness for Vue Router, Pinia, or TanStack Vue Query. The requirement was to add unit tests and enforce full coverage for code files under `src/**/*`, excluding assets and `src/style.css`.

## Decision

We use Vitest with V8 coverage, `@vue/test-utils`, and `jsdom`.

Coverage is enforced at 100% for:

- statements
- branches
- functions
- lines

The test strategy is mixed by layer:

- direct unit tests for helpers, stores, and composables
- mounted component tests for presentational Vue components
- integration-style tests for route views and orchestration-heavy components

## Why

- Vitest matches the existing Vite-based stack with minimal setup friction.
- V8 coverage gives deterministic threshold enforcement without a separate Babel/Istanbul pipeline.
- The app has several files where behavior only becomes meaningful at the component boundary, especially the route views, router scroll logic, and query-driven UI states.
- Full coverage was achievable with small, focused harness helpers instead of broad production refactors.

## Consequences

- The repository now has reusable test setup under `tests/` for storage, fetch, DOM, and Vue Query concerns.
- Coverage failures are now part of the default test workflow.
- Some route-view tests intentionally use mocked composables and child stubs because the goal is file-level behavior coverage, not end-to-end rendering of every subtree in a single test.
