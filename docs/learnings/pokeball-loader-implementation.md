# Preserving Layout Wrappers When Replacing Inline Markup

Date: 2026-05-13

## What happened

When replacing the six inline spinner blocks with the new `PokeBallLoader` component, the first instinct was to replace the entire loader wrapper (the `div` with `v-if="isLoading"`) with the component. That would have stripped away layout classes like `flex flex-col items-center justify-center py-12 gap-4` that controlled vertical centering, padding, and spacing inside scrollable or flex parents.

## Lesson

Keep the existing layout wrapper and swap only the inner spinner markup and label text. The wrapper often carries:

- conditional rendering (`v-if`)
- flex centering (`items-center`, `justify-center`)
- spacing (`py-12`, `gap-4`)
- scroll or overflow behavior references

Replacing the wrapper risks subtle layout regressions, especially inside `flex-1 overflow-y-auto` containers where `justify-center` is required to vertically center the loader.

## Application

In `PokemonSelectorModal.vue`, the loader sits inside a `flex-1 overflow-y-auto p-2` container. Removing the wrapper would have left the loader top-aligned instead of centered. By keeping the wrapper and placing `PokeBallLoader` inside it, the modal loader stays exactly where it was before.

The same principle applied to `GameView.vue` and `HomeView.vue`, where parent wrappers provide `min-h-screen` or `py-24` spacing that the component itself should not own.
