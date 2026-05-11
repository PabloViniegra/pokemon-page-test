# Decision: Stub Browser APIs in Vitest Setup for GSAP Paths

Date: 2026-05-11

## Context

Unit tests began failing after GSAP-based motion initialization and reduced-motion checks were introduced. In jsdom, `window.matchMedia` is not implemented by default, causing test crashes during:

- app bootstrap (`ScrollTrigger` registration)
- component mount (`useGsapContext`)

Some tests also emitted `scrollTo` not-implemented warnings.

## Decision

Use a centralized test-environment fix in `tests/setup.ts`:

- stub `matchMedia` globally
- stub `scrollTo` globally

Do not add per-test ad-hoc mocks for these APIs.

## Why

- One setup-level fix unblocks all affected test files.
- It preserves production behavior and keeps test code focused on app logic.
- It avoids repeated mock boilerplate and drift across test suites.

## Consequences

- Test setup now represents the browser API surface expected by GSAP and route/view code.
- Future motion-related tests can mount components without extra browser API wiring.
