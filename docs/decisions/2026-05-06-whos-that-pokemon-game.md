# Decision: "Who's that Pokémon?" Game Feature

## Context
We want to add a gamification page to the existing Pokédex app. The game shows a Pokémon sprite as a black silhouette, and the user guesses which Pokémon it is by selecting from a searchable list.

## Decision
We will implement the game as a new route `/game` using a dedicated Vue view (`GameView.vue`), feature-specific components, a composable for game logic, and a Pinia store for persistent stats.

## Architecture
- **Route**: `/game` added to `src/router/index.ts`.
- **View**: `src/views/GameView.vue` orchestrates the game round, modal, and confetti.
- **Composable**: `src/composables/useWhoIsThatPokemonGame.ts` handles random Pokémon selection, guess validation, state transitions (`idle`, `correct`, `incorrect`), and reset.
- **Store**: `src/stores/gameStats.ts` persists `totalRoundsPlayed`, `totalCorrectGuesses`, and `totalAttempts` to `localStorage`.
- **Components**:
  - `PokemonSilhouette.vue`: Renders official artwork with `filter: brightness(0)`, reveals on correct guess.
  - `GameControls.vue`: Buttons for "Guess", "Next Pokémon", and status messages.
  - Reuses existing `PokemonSelectorModal.vue` for the selection prompt.
- **Design**: Matches existing app patterns (Tailwind v4, Fredoka font, rounded-3xl cards, shadow-xl). Adds a shake animation for wrong guesses and a confetti burst for correct guesses using `canvas-confetti`.
- **Testing**: `vitest.config.ts` with `jsdom`. Unit tests for the composable (state transitions) and the view component (DOM updates, confetti trigger).

## Consequences
- Adds two new dependencies (`canvas-confetti`, `@types/canvas-confetti`).
- Introduces a new feature folder `src/components/game/` for co-located game UI.
- Requires setting up `vitest.config.ts` since it was missing.
