# Vitest + jsdom + GSAP Browser API Stubs

## 1. `window.matchMedia` is required by both GSAP bootstrapping and reduced-motion checks

When tests import app bootstrap code (`src/main.ts`) or components using `useGsapContext`, jsdom can fail with:

- `TypeError: window.matchMedia is not a function`

This now appears in two places:

- GSAP `ScrollTrigger` registration path
- `useGsapContext` reduced-motion guard (`window.matchMedia('(prefers-reduced-motion: reduce)')`)

If `matchMedia` is not stubbed globally in test setup, many unrelated component tests fail at mount time.

## 2. Global polyfills in `tests/setup.ts` are the highest-leverage fix

Stubbing browser APIs once in `tests/setup.ts` is cleaner and safer than per-test mocks.

The minimum stubs needed here were:

- `matchMedia`
- `scrollTo`

After adding those stubs globally, the full unit suite returned to green.
