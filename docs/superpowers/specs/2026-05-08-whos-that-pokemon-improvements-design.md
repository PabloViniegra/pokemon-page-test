# Design: "Who's that Pokémon?" Improvements

Date: 2026-05-08

## Feature 1: Browse All Pokémon Without Typing (Alphabet Jump Index)

### Problem
`PokemonSelectorModal` loads all 1,025 Pokémon but always slices to the first 100. Without typing, users only ever see the first 100.

### Solution
Add a horizontal row of A–Z buttons above the search input. Clicking a letter filters the list to Pokémon starting with that letter. An "All" button resets to the default first-100 view.

### Behavior
- The jump row is scrollable horizontally on small screens.
- When a letter is clicked, the search term is cleared and the list shows Pokémon whose name starts with that letter.
- If no Pokémon match the letter, show "No Pokémon found starting with X".
- The "All" button restores the original behavior (first 100 items).

### Performance
- The full list is already in memory (`allPokemon`).
- Filtering by prefix is O(n) over 1,025 items, negligible.
- DOM still renders at most ~50–60 items per letter.

## Feature 2: "Give a Hint" Button

### Design
- Add a "Give a hint" button in `GameControls`, visible only when `status === 'idle'` or `'incorrect'`.
- When clicked, generate one random hint from available data and display it below the buttons.
- The button becomes disabled after use; hint state resets on `nextRound()`.

### Hint Pool (randomly selected each round)
1. **Type:** "This Pokémon is a [Fire] type." (or "a [Fire/Flying] type" for dual-types)
2. **Generation:** "This Pokémon was introduced in [generation-i]." (from species data)
3. **Move:** "This Pokémon can learn the move [thunderbolt]."
4. **Ability:** "This Pokémon has the ability [static]."
5. **Description:** A snippet from the Pokédex flavor text (from species data, English only, cleaned of newlines/form feeds)
6. **First letter:** "This Pokémon's name starts with the letter [P]."
7. **Color:** "This Pokémon is [yellow] in color." (from species data)

### Data Requirements
To support generation, color, habitat, and flavor text, the game composable will fetch species data via the existing `usePokemonSpeciesQuery`.

### State Management
- `hintUsed` boolean in `useWhoIsThatPokemonGame`, reset on `nextRound()`.
- `currentHint` string in `useWhoIsThatPokemonGame`, generated on first button click.
- The hint is generated once per round (not randomized on every click), so clicking again shows the same hint.

## Architecture Changes

### Files to Modify
1. `src/components/PokemonSelectorModal.vue` — Add A–Z jump index row and "All" button.
2. `src/composables/useWhoIsThatPokemonGame.ts` — Add hint state, hint generation logic, species query.
3. `src/components/game/GameControls.vue` — Add "Give a hint" button and hint display.
4. `src/views/GameView.vue` — Wire hint state from composable to GameControls.
5. Tests: update `useWhoIsThatPokemonGame.spec.ts` and `GameView.spec.ts`.

### Data Flow
- `useWhoIsThatPokemonGame` exposes `hintUsed`, `currentHint`, `useHint()`.
- `GameControls` emits `hint` when button is clicked; `GameView` calls `useHint()`.
- Alternatively, `GameControls` directly receives `hintUsed`/`currentHint` as props and emits `hint`.

### Hint Generation Logic
```
function generateHint(pokemon: PokemonDetail, species: PokemonSpeciesInfo): string {
  const generators = [
    () => `This Pokémon is ${formatTypes(pokemon.types)}.`,
    () => `This Pokémon was introduced in ${species.generation.name}.`,
    () => `This Pokémon can learn the move ${randomMove(pokemon.moves)}.`,
    () => `This Pokémon has the ability ${randomAbility(pokemon.abilities)}.`,
    () => randomFlavorText(species.flavor_text_entries),
    () => `This Pokémon's name starts with the letter "${pokemon.name[0].toUpperCase()}".`,
    () => `This Pokémon is ${species.color.name} in color.`,
  ]
  const pick = Math.floor(Math.random() * generators.length)
  return generators[pick]()
}
```
- Guards: if `species` is not yet loaded, disable hint button.
- If a generator fails (e.g., no moves), fall back to the first-letter hint.

## Accessibility
- A–Z buttons have `aria-label="Filter by letter X"`.
- "Give a hint" button is clearly labeled.
- Hint text is announced via a live region (`aria-live="polite"`).

## Testing
- `useWhoIsThatPokemonGame.spec.ts`: verify `hintUsed` resets, `currentHint` is generated, `useHint()` works.
- `GameView.spec.ts`: verify hint button renders, click emits/calls correctly, hint text appears.
- `PokemonSelectorModal`: verify jump row filters correctly, "All" resets.
