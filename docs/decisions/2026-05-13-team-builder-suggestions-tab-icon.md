# Team Builder Suggestions Tab Icon

Date: 2026-05-13

## Context

The Team Builder tab switcher used a custom sparkle path for the `Suggestions` tab icon.
The path rendered inconsistently with the rest of the outlined icon set and looked visually off compared to the `Weakness Analysis` icon.

## Decision

Replace the `Suggestions` tab icon path in `src/views/TeamBuilderView.vue` with a standard outlined sparkles glyph that matches the existing stroke-based icon style.

## Rationale

- Keeps icon language consistent across tabs.
- Improves recognizability of the `Suggestions` tab affordance.
- Uses a valid outline path that renders reliably with `fill="none"` and `stroke="currentColor"`.
