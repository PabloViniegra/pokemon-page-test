# /game Redesign — Design Spec

## Feature Summary
The `/game` page becomes a production-ready quiz-show style guessing game for casual Pokémon fans. The redesign replaces the utilitarian list-search feel with a fast round loop: look at the silhouette, pick from visible choices, get clear feedback, continue to the next round. The tone should be energetic and playful, but not toy-like or juvenile.

## Primary User Action
Pick the most plausible answer quickly from a small, readable set of visible choices, then respond to the feedback and move to the next round.

## Design Direction
- **Color strategy:** Committed
- **Theme scene sentence:** A casual player is chasing a streak in a bright arcade-like setting, on a phone or laptop, with enough energy to feel game-like but enough clarity to stay easy to read.
- **Anchor references:** the anime-style “Who’s That Pokémon?” reveal rhythm, Nintendo DS-era Pokédex hardware cues, and arcade results boards with strong state emphasis
- **Anti-goal:** playful without becoming toy-like or juvenile

## Scope
- **Fidelity:** production-ready
- **Breadth:** `/game` route only, including its direct child components
- **Interactivity:** shipped-quality component behavior, not just visual mockup
- **Time intent:** polish until it can ship

## Layout Strategy
The page should read as a single game board, not a generic content card.
- Hero silhouette first, centered and large, with a stronger frame that suggests a Pokédex scanner or stage reveal.
- Answer area becomes the main interaction zone: visible answer choices in a compact 2×2 layout on mobile and desktop, large enough for confident tapping.
- Secondary information (streak, round stats, hint status) should sit in a quieter status rail so it supports the round without competing with it.

Hierarchy should be dramatic but controlled:
1. Hero silhouette
2. Visible choices
3. Feedback and next-step action
4. Long-term stats

## Key States
- **Loading:** the board should feel like the next challenger is being prepared, with a skeleton or stage-ready loading treatment rather than a generic spinner.
- **Default:** silhouette visible, 4 answer choices shown, one optional hint action available, streak/status visible but subdued.
- **Incorrect:** wrong choice is clearly marked, the right answer is still hidden, the player gets a useful clue or narrowed set instead of a dead-end “try again”.
- **Correct:** reveal should feel rewarding, with clear answer confirmation, silhouette reveal, celebratory treatment, and a strong next-round action.
- **Hint used:** hint should appear as a structured clue, not random filler, and should reduce uncertainty meaningfully.
- **Error:** failed load should preserve the game framing and offer a confident retry path.
- **Reduced motion:** celebration and reveal stay satisfying without confetti or abrupt movement.
- **Edge cases:** long names, duplicate-looking options, network failure, repeated rapid taps, and interrupted mobile sessions should all stay readable and stable.

## Interaction Model
Each round should be one visible loop:
1. New silhouette loads into the game board.
2. Player sees 4 answer options immediately.
3. Player taps or keyboard-selects one answer.
4. Interface gives immediate feedback.
5. If wrong, the round stays alive with narrowed uncertainty or stronger clueing.
6. If correct, the reveal lands cleanly and the next-round action becomes primary.

Interaction rules:
- Answer choices must be full buttons with strong focus states and disabled/locked behavior during transitions.
- Keyboard users should be able to tab through choices and activate with Enter/Space.
- Hint should be supportive, not the main path.
- Confetti and shake should respect `prefers-reduced-motion`.
- Rapid double taps should not create race conditions or duplicate state changes.

## Content Requirements
- Stronger intro line under the title that frames the challenge in one sentence.
- Clear round feedback copy for correct and incorrect outcomes.
- Hint copy that escalates logically, ideally type/generation/name-letter before looser flavor text.
- Better error copy than “Oops,” with a retry action that feels stable and specific.
- Persistent stat labels that reward play without sounding like analytics UI.

Dynamic ranges:
- Pokémon names can be long and need wrapping or balanced scaling.
- Hint text can vary from short to moderately long.
- Answer choices may include visually similar names and need strong legibility.
- Accuracy and streak values should handle small and large numbers without breaking layout.

## Recommended References
- `harden.md`
- `bolder.md`
- `polish.md`
- Vue component/data flow discipline
- Accessibility patterns for dialog-free primary actions, keyboard interaction, and live region feedback

## Open Questions
- Whether wrong answers should eliminate one option, reveal a structured clue, or both.
- Whether stats should emphasize streak first, accuracy first, or equal weight.
- Whether the answer set should always be 4 options or vary with difficulty later.
- Whether the current separate Pokémon selector modal should be removed entirely or left only as a fallback/debug path.
