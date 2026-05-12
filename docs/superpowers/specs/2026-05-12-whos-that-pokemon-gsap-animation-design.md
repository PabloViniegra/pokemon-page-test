# Who's That Pokemon GSAP Animation Design

## Summary

Add a game-show style GSAP motion system to the `/game` flow so each guess feels tactile and the correct reveal feels staged, playful, and satisfying without slowing the round loop. The motion budget should concentrate on interaction feedback and the silhouette reveal, not on page-load choreography.

## Context

- Surface: `src/views/GameView.vue`
- Supporting components: `src/components/game/PokemonSilhouette.vue`, `src/components/game/GameControls.vue`
- Supporting logic: `src/composables/useWhoIsThatPokemonGame.ts`, `src/stores/gameStats.ts`
- Existing animation infrastructure: GSAP is already installed and registered in `src/main.ts`
- Existing reduced-motion patterns: `src/composables/useGsapContext.ts` and inline `matchMedia('(prefers-reduced-motion: reduce)')` checks on the game page
- Existing behavior to preserve: four visible answer choices, one-hint-per-round behavior, streak and accuracy tracking, and confetti on correct answers for users who allow motion

## Register

Product

This surface is an interactive game loop inside the app. Motion should reward state changes and clarify results while staying short enough for repeated rounds.

## Physical Scene

A casual Pokemon fan is tapping through quick rounds on a phone or laptop during a break, in a bright relaxed setting, and wants the reveal to feel playful and game-like without adding drag to the next round.

## Goals

- Make each guess feel acknowledged immediately.
- Turn the correct answer into one signature reveal moment.
- Keep the rest of the round loop fast and product-safe.
- Reuse existing page structure and state flow instead of redesigning the feature.
- Respect `prefers-reduced-motion`.

## Non-Goals

- No route transition or page-entry choreography.
- No continuous decorative loops.
- No modal, drawer, or layout changes.
- No rewrite of game state, answer generation, hint logic, or stats persistence.
- No animation that blocks the next guess or next round.

## Chosen Direction

Relay Show.

Compared with a subtle polish-only pass, this direction gives the game page a stronger identity and a more satisfying success moment. Compared with a maximal arcade treatment, it keeps the animation budget focused on the interaction loop so the page still behaves like a fast product surface.

## Motion Plan

### 1. Wrong-Guess Feedback

Make incorrect attempts feel decisive without over-punishing the player.

- The selected wrong answer compresses briefly, then releases into its disabled error state.
- The silhouette stage recoils horizontally with a short transform-only hit reaction.
- The board can take a small type-tinted jolt or shadow pulse so the error is felt at the surface level, not only on the button.

Constraints:

- Keep wrong-answer feedback tight, roughly `140ms` to `220ms`.
- Use `x`, `scale`, `autoAlpha`, and shadow or filter changes only where they remain small and bounded.
- Do not replay the full reaction on every reactive rerender, only on a new incorrect guess.

### 2. Correct Reveal Sequence

This is the page's single signature motion moment.

- A scanner ring or reveal sweep travels across the silhouette frame.
- The hidden sprite lifts slightly, brightness returns, and the artwork settles into its revealed state.
- The name pill, success copy, and `Next Pokemon` button land in a short staged sequence after the sprite resolves.
- The board takes a quick type-colored pulse so the reveal feels coordinated with the current Pokemon identity.

Constraints:

- Keep the full reveal compact, roughly `380ms` to `420ms`.
- Use `transform`, `opacity`, and controlled filter or color shifts, not layout-driving properties.
- Confetti remains additive and should not be required for the reveal to feel complete.

### 3. Hint And Secondary State Smoothing

Reduce abrupt swaps in the supporting UI.

- The hint button and revealed hint text can fade between states instead of snapping.
- Incorrect-state helper copy can settle in with a short upward fade so the board feels responsive instead of binary.
- Stats should remain stable and readable; no celebratory number-counting animation is needed.

Constraints:

- Keep these supporting motions in the `140ms` to `200ms` range.
- Avoid drawing more attention to the hint than to the answer flow.

### 4. Next-Round Reset

Make a new round feel prepared rather than abruptly swapped.

- When the target Pokemon changes, the silhouette, ring, and board pulse state reset immediately to the hidden stage.
- New answer choices can enter with a light stagger or shared fade-up if it remains very short.
- Reset must leave no stale transforms, filters, or hidden elements behind.

Constraints:

- Reset should feel nearly instant, roughly `120ms` to `180ms` if animated at all.
- Do not introduce page-load style choreography.
- Prioritize state correctness over flourish.

## Component Responsibilities

### `src/views/GameView.vue`

- Keep ownership of round state, board theming, and confetti trigger logic.
- Add scoped refs for the game board and any board-level accent elements that need success or error pulses.
- Watch `status` for board-level feedback only.
- Keep child communication declarative through props that already exist.

### `src/components/game/PokemonSilhouette.vue`

- Own the silhouette recoil, reveal sweep, and reset behavior.
- Add explicit refs for the frame, reveal ring, and image element.
- Watch `revealed`, `shake`, and `pokemonId` to determine when to run reveal, incorrect feedback, and round reset.
- Keep the final visible state aligned with the current prop values even when animation is skipped.

### `src/components/game/GameControls.vue`

- Own answer-button press feedback, success-state entrance, and hint swap smoothing.
- Keep current emits and focus-return behavior intact.
- Watch `status`, `choices`, `hintUsed`, and `currentHint` as needed for localized motion.
- Ensure button disabled states remain authoritative even if a tween is interrupted.

## Technical Approach

- Use GSAP timelines for the correct-reveal sequence because it has multiple dependent steps.
- Use short standalone tweens for wrong-answer and hint-state feedback.
- Scope selectors to component roots with `gsap.context()` and clean them up on unmount.
- Reuse the existing reduced-motion approach: mount-only work can use `useGsapContext`, while state-driven animation checks `window.matchMedia('(prefers-reduced-motion: reduce)')` before running.
- Prefer `autoAlpha`, `x`, `y`, `scale`, and short stagger values.
- Use `clearProps` or explicit reset state after animated entrances where Vue's reactive classes and inline styles need to remain authoritative.

## Data Flow And Replay Rules

- `GameView.vue` stays the source of truth for status and round progression.
- Child components react to prop changes and animate their own DOM. The parent should not call exposed imperative child animation methods.
- Wrong-guess motion runs only when status changes into `incorrect` for a fresh attempt.
- Correct-reveal motion runs only when status changes into `correct`.
- Round reset runs when a new `pokemonId` arrives or when status returns to `idle`, whichever is the more stable trigger in implementation.
- Reduced-motion users should see immediate, stable state changes with no hidden intermediate state.

## Accessibility

- Respect `prefers-reduced-motion` by skipping travel, staged sequencing, and recoil movement while preserving visible state changes.
- Do not rely on motion alone to communicate correct or incorrect outcomes.
- Preserve current focus management on the `Next Pokemon` button after a correct answer.
- Keep answer buttons keyboard-operable throughout the interaction cycle.
- Ensure any added decorative ring or pulse remains non-essential to understanding the result.

## Performance Constraints

- Favor `transform` and `opacity` for the main motion path.
- Keep any filter, shadow, or color-shift effects small and isolated to the board or silhouette frame.
- Kill or overwrite in-flight tweens when rapid interactions would otherwise stack motion.
- Avoid animating the full page or unrelated stats for every state change.
- Make cleanup explicit so repeated rounds do not accumulate stale inline styles.

## Verification Plan

1. Load `/game` and verify the page does not wait on a page-entry animation.
2. Select a wrong answer and confirm the button feedback and silhouette recoil feel fast and clear.
3. Select the correct answer and confirm the reveal reads as the hero moment without delaying the next step.
4. Trigger a hint and confirm the hint swap feels smoother but still secondary.
5. Move through several rounds quickly and confirm no stale transforms or repeated animations linger.
6. Enable reduced motion and confirm the page remains fully understandable and playable without travel-based animation.
7. Run `pnpm build` after implementation.

## Risks

- Over-staging the reveal could make repeat rounds feel slower than intended.
- If wrong-answer feedback is tied too broadly to reactive renders, the page could replay motion unexpectedly.
- Decorative scanner effects can become noisy if they overpower the silhouette itself.
- Reset logic can leave stale styles behind if cleanup is not explicit after each round.

## Recommendation

Implement the motion in this order: silhouette reveal and reset, wrong-answer feedback, control-state smoothing, then board-level pulses. That order delivers the main value first and keeps the higher-risk cross-component feedback layered on last.
