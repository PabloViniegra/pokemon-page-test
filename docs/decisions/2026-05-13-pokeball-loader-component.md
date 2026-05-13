# Pokeball Loader Component

Date: 2026-05-13

## Context

The app had six separate inline loading indicators spread across views and components. Each used hand-rolled border-ring spinners with inconsistent sizes, colors, and animation styles. This made the loading experience feel fragmented and increased maintenance cost every time a visual tweak was needed.

## Decision

Replace all inline spinners with a single shared `PokeBallLoader` component that renders the existing `public/logo.svg` Poké Ball asset with a continuous rotation animation.

- Component lives at `src/components/PokeBallLoader.vue`
- Exposes a minimal prop surface: `label?: string` and `size?: 'sm' | 'md' | 'lg'`
- Uses Tailwind's built-in `animate-spin` class for the rotation
- Keeps existing loading copy and parent layout wrappers intact

## Rationale

- **Brand consistency**: reusing the favicon asset ties the loading state to the app identity
- **Maintainability**: one place to tune animation, sizing, or accessibility behavior
- **Minimal change scope**: no query logic, composables, or stores were modified
- **Context-aware sizing**: a single component can serve full-page, section, and compact panel states through size variants

## Consequences

- Loading text styling became slightly more uniform (all labels now use the component's default `text-gray-500 font-medium text-sm`)
- The `animate-pulse` effect previously applied to some labels was removed, making the motion calmer and matching the spec's "no extra decorative effects" rule
- Future loader changes require editing only one component
