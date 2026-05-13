# jsdom Root-Absolute Asset URLs Can Break Vitest

Date: 2026-05-13

## Lesson

In this project, using a hard-coded root asset URL (`/logo.svg`) inside a shared Vue component caused suite-level failures in Vitest + jsdom before tests executed.

## Why It Matters

When a component is mounted across many test suites, a single problematic asset URL can fail imports and show up as "0 tests" in multiple files even though business logic is fine.

## Applied Fix

Switching the loader image source to a base-aware path (`import.meta.env.BASE_URL`) resolved all affected suites.
