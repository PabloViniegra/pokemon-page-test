# Pokemon Detail GSAP Animation Refresh

## Summary

The current Pokemon detail page has motion, but most of it is too subtle or happens before the user reaches the animated content. The refresh will replace scattered CSS-only reveals with a small GSAP-based motion system that makes three moments legible:

1. the first hero reveal
2. section entry as the user scrolls
3. meaningful detail-page interactions like shiny toggle and favorites

The page should feel playful and premium, but still behave like a product surface, not a marketing splash page.

## Goals

- Make animation visibly intentional on the detail page.
- Animate sections when users can actually see them.
- Strengthen visual hierarchy with one strong hero reveal and clearer section reveals.
- Keep motion performant with transforms, opacity, and small isolated glow effects.
- Respect `prefers-reduced-motion` without leaving elements hidden or out of place.

## Non-Goals

- No full-page cinematic intro sequence.
- No large layout animation based on width, height, top, or left.
- No global animation framework for the whole app.
- No redesign of detail-page information architecture.

## Recommended Direction

Use GSAP with `ScrollTrigger` for section timing and scoped timelines inside each detail-page component.

The motion model has three layers:

### 1. Hero entry

`PokemonHero.vue` gets a one-time intro timeline when a Pokemon detail page becomes ready.

- Back button and ID fade in first.
- Artwork rises in with a slightly larger vertical move than the current CSS float reveal.
- The color halo blooms in after the artwork starts.
- Name, genus, type badges, description, and metadata stagger in as separate beats.
- After the intro completes, the artwork may keep a very light idle float, but the entry reveal becomes the primary motion moment.

### 2. Scroll-triggered sections

`PokemonStats`, `PokemonAbilities`, `PokemonSprites`, `PokemonMoves`, `PokemonSpeciesInfo`, and `EvolutionTree` animate on viewport entry instead of mount.

- Stats: bar fills sweep left-to-right, labels and values rise in slightly ahead of the fills.
- Abilities: cards reveal upward with a short stagger.
- Sprites: cards reveal upward with a short stagger and keep hover feedback.
- Moves: heading and button reveal first, tags stagger in, expanded tags animate when the list opens.
- Species info: grid items reveal in a short cascade, badges land last.
- Evolution tree: connector rails and branch lines reveal first, then evolution cards stagger in.

### 3. Micro-interactions

- Shiny toggle: artwork swap plus halo pulse, not just a basic crossfade.
- Favorite button: a tighter heart pop plus a short radial echo on activation.
- Move expansion: new tags animate in distinctly when the list expands.

## Architecture

## GSAP installation and registration

- Install `gsap` as an app dependency.
- Register `ScrollTrigger` once in the app bootstrap path, most likely `src/main.ts`.
- Keep plugin registration centralized instead of repeating it in components.

## Component responsibilities

### `DetailView.vue`

- Keep it as the route-level composition surface.
- Continue orchestrating data fetching and deferred lower sections.
- Own a small hook to notify lower sections when deferred content is mounted so `ScrollTrigger.refresh()` can run after the DOM settles.
- Reset route-entry motion when `props.id` changes.

### `PokemonHero.vue`

- Own the hero intro timeline and hero-specific interactions.
- Scope all selectors to a root ref using `gsap.context()`.
- Expose no new public props or emits unless interaction hooks require them.

### `PokemonStats.vue`

- Own section-level reveal and bar timing.
- `StatBar.vue` should become mostly presentational again, while the parent drives timeline sequencing.
- Avoid timeout-based animation triggers.

### `PokemonAbilities.vue`, `PokemonSprites.vue`, `PokemonMoves.vue`, `PokemonSpeciesInfo.vue`, `EvolutionTree.vue`

- Each component owns its own section reveal timeline with a root ref and `gsap.context()` cleanup.
- `PokemonMoves.vue` also owns expanded-list item entry animation.
- `EvolutionTree.vue` owns staged connector-first sequencing because that structure is unique to the tree.

## Data Flow and Lifecycle

- Props remain the source of truth.
- GSAP timelines derive from rendered DOM and do not replace Vue state.
- Timelines are created in `onMounted()` or after relevant content becomes present.
- Cleanup happens with `ctx.revert()` in `onUnmounted()`.
- For route changes or deferred section mounts that affect scroll measurements, call `ScrollTrigger.refresh()` after the DOM update completes.

## Accessibility and Reduced Motion

- Use `gsap.matchMedia()` with a `reduceMotion` condition.
- In reduced-motion mode:
  - skip timeline choreography
  - set elements directly to final visible state
  - keep only essential state-change feedback if it is very short and non-disorienting
- Never rely on animation to expose content.

## Performance Constraints

- Prefer `y`, `scale`, `autoAlpha`, and `rotation` over layout properties.
- Keep glow and blur animation limited to the hero halo area.
- Use timeline defaults for consistent duration and easing.
- Avoid creating persistent background animations in lower sections.
- Refresh scroll triggers only when content structure changes.

## Implementation Plan Shape

1. Install and register GSAP.
2. Replace route-level CSS transition wrappers that GSAP will supersede.
3. Build hero timeline and hero interaction bursts.
4. Convert section reveals to scoped `ScrollTrigger` timelines.
5. Convert move expansion and evolution sequencing to GSAP.
6. Remove superseded CSS reveal classes and timeout-based logic.
7. Verify reduced motion, route changes, and build output.

## Error Handling and Edge Cases

- If a section renders without data, do not create a timeline for missing elements.
- If deferred lower sections mount after the first render, only refresh scroll triggers after the wrapper is present.
- If the user navigates between Pokemon quickly, old timelines must be reverted before new ones are created.
- If shiny artwork is missing, the interaction should degrade to the current static behavior without broken animation state.

## Verification

- `pnpm build` must pass.
- Manual checks:
  - hero reveal on first detail-page load
  - hero reveal on in-app Pokemon-to-Pokemon navigation
  - section reveals trigger when scrolled into view, not before
  - shiny toggle and favorite feel noticeably stronger
  - move expansion animates newly shown tags
  - reduced-motion mode shows all content immediately
  - mobile and desktop both remain smooth

## Risks

- Over-animating the detail page would make it feel slower instead of richer.
- Scroll-trigger timing can break if refresh points are missed after deferred rendering.
- Hero and section timelines must stay visually related; otherwise the page will feel patched together.

## Decision

Proceed with a GSAP + `ScrollTrigger` detail-page refresh centered on one strong hero reveal, viewport-timed section entry, and higher-value micro-interactions. This replaces the current mount-timed CSS reveals that users largely never notice.
