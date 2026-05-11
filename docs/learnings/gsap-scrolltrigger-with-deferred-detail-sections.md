# GSAP ScrollTrigger With Deferred Detail Sections

When the Pokemon detail page mounts lower sections after the initial render, `ScrollTrigger` may need an explicit refresh after Vue finishes updating the DOM.

## What worked

- Register `ScrollTrigger` once in `src/main.ts`.
- Create section timelines inside the section component with `gsap.context()`-style scoping and cleanup.
- After `deferredSectionsReady`, species data, or evolution data changes in `DetailView.vue`, wait for `nextTick()` and then call `ScrollTrigger.refresh()`.
- Key detail child components by `pokemon.id` so hero and section timelines replay correctly when navigating from one Pokemon detail page to another without leaving the route.
- For this page, noticeable motion needed larger travel distances and looser stagger spacing than the initial pass. Small `12px-24px` moves and ultra-tight tag staggers were technically correct but still read as visually flat.

## Why it matters

Without the refresh, trigger positions can be computed against an earlier layout and lower-section reveals may feel inconsistent after deferred content appears.
