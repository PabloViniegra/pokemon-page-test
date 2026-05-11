# Detail Page GSAP Motion

## Decision

Use `gsap` with `ScrollTrigger` for the Pokemon detail page instead of the previous CSS-only mount-time reveals.

## Why

- The old animations were technically present but too subtle and too early, because many of them ran before the user scrolled to the section.
- The detail page needs one clear hero reveal, stronger section timing, and more noticeable stateful interactions.
- `ScrollTrigger` lets each section animate when it enters the viewport instead of when the component first mounts.
- GSAP timelines also make the hero reveal, stat-bar sequencing, and shiny/favorite micro-interactions easier to coordinate than layered CSS transitions.

## Constraints

- Keep the route view thin and let detail components own their own timelines.
- Respect `prefers-reduced-motion` by skipping choreography and leaving content fully visible.
- Prefer transform and opacity animation, not layout-property animation.
