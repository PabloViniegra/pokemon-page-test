# Home Page GSAP Animation Design

## Summary

Add playful, restrained motion to the Pokedex root page so browsing feels more polished without slowing the product down. The animation budget goes to a one-time hero entrance, cleaner control-surface reveal behavior, and short card reveals that support discovery while preserving KeepAlive scroll restoration and infinite scroll reliability.

## Context

- Surface: `src/views/HomeView.vue`
- Supporting components: `src/components/PokemonGrid.vue`, `src/components/PokemonCard.vue`
- Existing motion system: GSAP and `ScrollTrigger` are already registered in `src/main.ts`
- Existing reduced-motion helper: `src/composables/useGsapContext.ts`
- Existing constraints: KeepAlive route caching, sessionStorage-based scroll restoration, URL-synced filters, and intersection-observer infinite scroll

## Register

Product

This is a browse-first application surface. Motion should clarify state and add delight without turning page load into a theatrical sequence.

## Physical Scene

A Pokemon fan is scanning the Pokedex on a phone in daylight or on a desktop between tabs, moving quickly between browsing and detail views, so the page should feel lively but never delayed.

## Goals

- Make the home page feel more premium and alive.
- Preserve fast browsing and filtering.
- Respect `prefers-reduced-motion`.
- Avoid regressions in back-navigation scroll restoration.
- Keep the implementation local and maintainable.

## Non-Goals

- No full-page scroll choreography.
- No heavy `ScrollTrigger` dependency for the home list.
- No replaying intro animations every time the cached route re-activates.
- No animation that blocks search, filter, sort, favorites, or navigation.

## Chosen Direction

Playful restrained.

Compared with a scroll-driven showcase or highly animated cards everywhere, this direction keeps the product UI fast and readable while still adding a stronger sense of craft.

## Motion Plan

### 1. Hero Entrance

Apply a one-time hero sequence in `HomeView.vue` when the page mounts for the first time in the session.

- Logo enters with a short upward settle and fade.
- Heading and supporting copy rise in with a tight stagger.
- Decorative background dots get a very subtle transform-based drift so the hero feels less static.

Constraints:

- Run only on first mount, not on KeepAlive re-activation after returning from a detail page.
- Keep timing short, roughly `220ms` to `450ms` total per element group.
- Animate only `opacity`, `y`, and small-scale transforms.

### 2. Controls Surface Reveal

Refine the sticky search and controls area so it feels intentionally introduced rather than abruptly present.

- Add a short entrance for the controls wrapper on first mount.
- Replace or complement the existing filter-panel transition with a smoother transform-and-opacity reveal.
- Keep filter-panel open and close behavior fast enough to feel stateful rather than decorative.

Constraints:

- Do not animate layout-heavy properties casually.
- Keep open and close interactions in the product-safe range, roughly `180ms` to `250ms`.
- Preserve current focus and interaction behavior.

### 3. Grid Reveal

Move the home-list entrance away from the current CSS-only one-shot class and into a more deliberate reveal strategy.

- First visible batch of cards reveals with a short stagger.
- Motion is subtle and supports scanning, not spectacle.
- If practical, newly appended infinite-scroll items may reveal as a batch when added, but only if this can be done without re-animating the existing list.

Constraints:

- Never replay the full grid animation on back-navigation to the cached home page.
- Avoid per-card `ScrollTrigger` setup.
- Avoid jank on large list updates caused by filtering, sorting, or favorites mode.

### 4. Card Feedback

Keep `PokemonCard.vue` mostly CSS-driven.

- Preserve existing hover lift and favorite feedback.
- Only add GSAP at card level if it materially improves a specific interaction.
- Prefer consistency with the current card vocabulary over adding new flourish.

## Component Responsibilities

### `src/views/HomeView.vue`

- Own page-level refs for hero and controls containers.
- Run the one-time hero and controls entrance sequence.
- Gate animation replay so KeepAlive re-entry does not restart the intro.
- Keep orchestration separate from data-fetching logic as much as possible.

### `src/components/PokemonGrid.vue`

- Own grid-level reveal behavior.
- Detect whether this is the first render batch versus a later list change.
- Animate only the intended batch of cards.
- Clean up GSAP context on unmount.

### `src/components/PokemonCard.vue`

- Keep current structure and CSS-first interaction model.
- Only expose stable DOM hooks if grid-level animation needs clearer selectors.

## Technical Approach

- Use GSAP timelines for hero and controls sequencing.
- Use the existing `useGsapContext` pattern or a closely aligned helper pattern so reduced-motion users automatically skip motion.
- Scope animations to component roots with `gsap.context()` cleanup.
- Prefer timeline defaults and short stagger values over scattered delayed tweens.
- Use DOM refs or scoped selectors, not global selectors.

## State And Replay Rules

- Intro motion runs once when `HomeView` first mounts.
- Returning from detail to home should preserve scroll position and should not replay page-load choreography.
- Grid reveal should happen for the initial home batch, and optionally for later appended batches if that can be isolated cleanly.
- Filter toggling should animate the panel state change, not the entire page.

## Accessibility

- Respect `prefers-reduced-motion` everywhere.
- Ensure reduced-motion users still get a clear, stable hierarchy with no hidden content.
- Do not tie meaning to animation.
- Keep interaction available during and after animations.

## Performance Constraints

- Animate `transform` and `opacity` only for the main motion path.
- Avoid layout thrash and repeated trigger refreshes on the home route.
- Keep staggers modest so large lists do not feel slow.
- Do not interfere with the intersection observer sentinel used for infinite scroll.

## Verification Plan

1. Load the home page fresh and verify hero, controls, and initial grid motion feel polished and fast.
2. Navigate into a detail page, then back, and verify scroll restoration still works and no intro replay occurs.
3. Search, sort, toggle filters, and switch favorites mode to confirm list updates stay responsive.
4. Scroll far enough to trigger infinite loading and confirm the sentinel still fires reliably.
5. Test with reduced motion enabled and confirm the page remains fully usable without animation.
6. Run `pnpm build` after implementation.

## Risks

- Replaying entrance motion on KeepAlive activation would make the page feel unstable.
- Grid animation tied too broadly to reactive list changes could reanimate the whole list during filter or sort updates.
- Overusing GSAP on a product list page could slow down browsing and violate the register guidance.

## Recommendation

Implement the hero and controls motion first, then add grid reveal with conservative replay rules. Treat infinite-scroll batch animation as optional unless the implementation remains minimal and clearly safe.
