# Evolution Chain Card Width Consistency

## Issue

Evolution cards appeared with different widths because each card sized itself from its content (especially species name length).

## Fix

Use fixed column widths at stage level and stretch cards to fill that width:

- set `.evo-stage` width to `7rem` (`8.5rem` on `sm+`)
- set `.evo-entry` to `width: 100%` and `align-items: stretch`
- set `.evo-entry__card` to `width: 100%`

## Result

All cards in a stage are visually consistent regardless of text length, while keeping the existing evolution tree structure and interactions.
