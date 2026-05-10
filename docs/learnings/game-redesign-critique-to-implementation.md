# Game Redesign: Critique to Implementation

Date: 2026-05-10

## What the critique found
The `/game` page scored **19/40** on Nielsen’s heuristics. Key failures:
- The guessing mechanic was a searchable modal, not a gameful interaction.
- Wrong guesses gave almost no progressive help.
- The modal lacked focus trapping, Escape handling, and dialog semantics.
- Confetti ignored `prefers-reduced-motion`.
- The visual language was safe and generic for a product whose brand calls for playful, nostalgic energy.

## How the commands mapped to code

### `impeccable shape`
- Ran a discovery interview confirming: quiz-show feel, casual-first audience, committed color strategy, production-ready scope.
- Produced a design brief that became the implementation blueprint.

### `impeccable harden`
- Added `role="group"` and `aria-label="Answer choices"` to the choice grid.
- Implemented focus return to the “Next Pokémon” button on correct answers.
- Gated confetti behind `prefers-reduced-motion`.
- Hardened loading and error states with clearer copy and retry actions.
- Ensured rapid double-taps cannot race because buttons disable after selection.

### `impeccable bolder`
- Replaced the white card with a game board framed by the target Pokémon’s type color.
- Increased title scale and weight for stronger hierarchy.
- Added a scanner-style ring around the silhouette.
- Switched stat labels from plain text to small badge-like cards, with streak prominently displayed.
- Used strong semantic color for feedback states (green correct, red incorrect, amber hint).

## Technical notes
- The full Pokémon list is loaded once and cached for 24 hours by Vue Query, so choice generation is cheap.
- `TYPE_COLORS` from `src/types/pokemon.ts` drives the per-round theming.
- Streak state is persisted to `localStorage` alongside existing stats.
- Build passed `vue-tsc` and `vite build` without errors on first attempt.

## Remaining open questions
- Should wrong answers eliminate one option automatically, or is disabling the tried choice enough?
- Should the answer set size vary with difficulty later?
- Should the separate `PokemonSelectorModal` be removed entirely or kept as a debug/fallback path?
