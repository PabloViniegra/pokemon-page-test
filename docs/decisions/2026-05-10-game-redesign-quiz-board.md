# /game Redesign: Quiz-Board Decision

Date: 2026-05-10

## Context
A design critique of the `/game` (“Who's That Pokémon?”) page found that the guessing flow felt like a database search rather than a game. The primary interaction was a searchable modal with 26 alphabet chips, which created cognitive overload and flattened the emotional payoff.

## Decision
Replace the modal-based search with an **inline quiz-board** that presents four answer choices immediately per round.

## Rationale
1. **Playfulness over lookup.** Four visible options turn each round into a quick decision, not a memory/recall task. This aligns with the product principle “exploration is delight.”
2. **Accessibility.** A small set of large buttons is easier to navigate by keyboard and touch than a long scrollable modal with search and filter controls.
3. **Mobile ergonomics.** Large tap targets in a 2×2 grid work well one-handed; a full-screen modal with a search input and alphabet strip does not.
4. **Visual commitment.** Removing the modal lets the silhouette and game board become the focal point, which is the right hierarchy for this surface.

## What changed
- `GameView.vue` now loads the full Pokémon list once and generates a shuffled 4-choice set per round.
- `GameControls.vue` renders a 2×2 grid of answer buttons with clear correct/incorrect feedback, disabled wrong choices, and strong focus states.
- `PokemonSelectorModal` is no longer used on `/game`; it remains in the codebase because `TeamBuilderView` still depends on it.
- `useWhoIsThatPokemonGame.ts` hint generation was rewritten to return structured, high-value hints (type + generation) instead of random trivia.
- `gameStats.ts` gained `currentStreak` and `bestStreak` to reward repeated success and add arcade-like momentum.
- Confetti is now gated behind `prefers-reduced-motion`.
- The game board uses the target Pokémon’s primary type color as a border and subtle background tint, creating a committed color strategy per round.

## Trade-offs
- We lose the ability to guess any Pokémon by name. Players are limited to the four options. This is acceptable because the goal is a quick quiz-like loop, not an open-ended lookup.
- Generating choices requires the full Pokémon list (≈1,025 items). We load it once via `useAllPokemonListQuery` with 24-hour caching, so the cost is minimal.

## Consequences
- The `/game` page now reads as a single cohesive game board rather than a card + modal combination.
- Keyboard navigation is straightforward: Tab through choices, Enter/Space to select, focus moves to “Next Pokémon” on success.
- The visual identity is bolder and more Pokémon-specific without becoming childish.
