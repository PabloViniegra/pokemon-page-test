# Team Builder GSAP Motion

## Decision

Add playful, pronounced GSAP animation to the Team Builder surface across four layers: page orientation, slot feedback, selector modal choreography, and weakness-analysis feedback.

## Why

- The Team Builder was the most under-animated surface in the app compared with the Home page and Detail view, which already have mount-scoped GSAP timelines and staggered reveals.
- Team building is an interactive workflow where state changes (add, remove, swap) deserve tactile feedback to feel satisfying.
- The existing `useGsapContext` composable and GSAP registration in `main.ts` meant the infrastructure was already in place; the work was additive, not architectural.

## Implementation Summary

1. **Page orientation** (`TeamBuilderView.vue`)
   - Header pattern, back button, title, and copy animate in with a tight GSAP timeline on mount.
   - Slot grid reveals with a short stagger so the primary interaction area feels intentional.

2. **Slot feedback** (`TeamSlot.vue`)
   - Watch `props.id` with `flush: 'post'` and animate incoming content with `scale`, `y`, and `autoAlpha`.
   - Filled-slot entrances are stronger (0.88 scale, 0.22s) than empty-slot resets (0.95 scale, 0.14s).
   - `gsap.killTweensOf` prevents overlapping animations during rapid edits.

3. **Modal choreography** (`PokemonSelectorModal.vue`)
   - Modal surface enters with `y`, `scale`, and `autoAlpha` each time it opens.
   - Top controls stagger in lightly.
   - First visible result rows stagger in once after loading completes; `hasAnimatedRows` flag prevents re-animation on search/filter noise.

4. **Analysis feedback** (`TeamWeaknessChart.vue`)
   - Alert rows use `<TransitionGroup>` with GSAP `@enter` and `@leave` hooks for slide-and-fade transitions.
   - Matchup bars animate from `0%` width via `gsap.fromTo` when the team changes.
   - Numeric labels fade in slightly after the bar settles.

## Constraints

- All mount sequences route through `useGsapContext` so `prefers-reduced-motion` is respected automatically.
- State-driven animations (slots, modal rows, chart bars) check `window.matchMedia('(prefers-reduced-motion: reduce)')` inline before running GSAP.
- Only `transform`, `opacity`, and controlled `width` animations are used; no layout-property motion.
- Timings stay within product-safe ranges (140ms–320ms per layer) to avoid slowing repeat use.
- `clearProps` is used after entrance animations so Vue’s reactive style bindings remain effective, especially for chart bar widths.
