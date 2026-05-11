# Home Page GSAP Motion

## Decision

Use mount-scoped GSAP timelines for the Pokedex home hero, toolbar, and initial grid reveal, instead of adding scroll-driven animation to the root page.

## Why

- The home route is cached with `KeepAlive`, so page-load motion must not replay when users return from a detail page.
- The home page already depends on sessionStorage-based scroll restoration and an intersection-observer infinite-scroll sentinel.
- A mount-only approach gives the page a stronger first impression without interfering with scroll restoration, list loading, or filter responsiveness.
- `ScrollTrigger` is already useful on the detail page, where sections enter the viewport later, but it would add unnecessary complexity on the browse-first home route.

## Constraints

- Respect `prefers-reduced-motion` by routing motion through the existing GSAP context helper.
- Prefer `transform` and `opacity` animation only.
- Keep the route view responsible for page-level motion and the grid component responsible for initial card reveal.
