# Team Builder GSAP Animation Design

## Summary

Add a more playful, more pronounced GSAP motion system to the Team Builder flow so adding, swapping, and evaluating Pokemon feels tactile and celebratory without slowing down repeat use. The motion budget should go to interaction feedback first, with a short entry orientation for the page and stronger state-change feedback in the slot grid, selector modal, and weakness analysis.

## Context

- Surface: `src/views/TeamBuilderView.vue`
- Supporting components: `src/components/TeamSlot.vue`, `src/components/PokemonSelectorModal.vue`, `src/components/TeamWeaknessChart.vue`
- Existing motion system: GSAP is already registered in `src/main.ts`
- Existing reduced-motion helper: `src/composables/useGsapContext.ts`
- Existing behavior to preserve: Pinia-backed team state, modal-based Pokemon selection, team weakness analysis, and current route behavior

## Register

Product

This surface is a tool, not a campaign page. Motion should strengthen feedback and hierarchy inside the workflow, even when the personality is more playful and pronounced than the rest of the app.

## Physical Scene

A Pokemon fan is building and tweaking a team on a phone or laptop in a relaxed setting, moving between experimenting and checking weaknesses, so motion should feel rewarding and punchy while staying short enough to support repeated edits.

## Goals

- Make team-building actions feel tactile and satisfying.
- Increase visual hierarchy on the Team Builder surface.
- Give clearer feedback when team composition changes affect analysis.
- Respect `prefers-reduced-motion`.
- Keep implementation local to the Team Builder feature.

## Non-Goals

- No route-transition system changes.
- No drag-and-drop reordering animation.
- No decorative continuous motion loops.
- No animation that blocks selection, removal, or analysis.

## Chosen Direction

Playful and pronounced, but still product-safe.

Compared with a subtle utility-only pass, this direction gives the Team Builder a stronger identity. Compared with a full theatrical page sequence, it keeps the animation budget concentrated on moments that signal state changes and feedback.

## Motion Plan

### 1. Entry Orientation

Give the Team Builder page a short first-mount orientation sequence.

- Header background pattern fades in with a slight upward drift.
- Back button, title, and supporting copy rise into place with a tight stagger.
- The main team panel settles in after the header so the surface feels assembled rather than abruptly rendered.
- The six slots reveal with a short stagger to establish that the grid is the primary interaction area.

Constraints:

- Keep the total sequence compact, roughly `350ms` to `650ms` across groups.
- Use `transform` and `opacity` only.
- Avoid a cinematic hero treatment. This is orientation, not spectacle.

### 2. Slot Feedback Layer

Make slot state changes more tactile.

- Empty slots can keep CSS hover states, but their first reveal should pop in slightly.
- Filled slots should animate in with a stronger scale-and-rise entrance when a Pokemon is added or replaced.
- Removal should use a quick shrink-and-fade exit before the empty state appears.
- If a slot changes from one Pokemon to another, treat it as a swap moment, not a silent content replacement.

Constraints:

- Repeated edits should still feel fast. Target roughly `140ms` to `240ms` for add, swap, and remove feedback.
- Do not animate layout dimensions.
- Preserve click targets and current event behavior.

### 3. Selector Modal Choreography

Keep the modal readable while making it feel intentional.

- Preserve the current overlay fade.
- Add a GSAP entrance on the modal surface using `y`, `scale`, and `autoAlpha`.
- Stagger the search/filter controls very lightly so the top of the modal feels composed.
- Stagger the first visible result rows when the modal opens or when a new filtered result set appears, limited to a small visible batch.

Constraints:

- Enter motion should feel confident and quick, roughly `220ms` to `320ms`.
- Exit motion should be faster than enter.
- Avoid reanimating the full 100-item result list on every small reactive change.

### 4. Analysis Feedback Layer

Make weakness analysis feel responsive to team changes.

- Alert rows for critical, major, or resistant states should slide and fade in when they appear.
- Type matchup bars should reveal from zero width when the analysis first becomes available.
- When the team changes, bars should animate to their new widths instead of jumping.
- Numeric effectiveness labels should appear just after the bar settles so the chart feels computed.

Constraints:

- Prefer GSAP-driven width updates only on the existing bar fill element.
- Keep updates short, roughly `180ms` to `260ms`.
- Avoid introducing `ScrollTrigger`; this is state-driven feedback, not scroll choreography.

## Component Responsibilities

### `src/views/TeamBuilderView.vue`

- Own page-level refs for header, main panel, and slot grid container.
- Run first-mount orientation motion.
- Pass stable animation hooks or keys down to child components only if needed.
- Keep state orchestration separate from animation logic where possible.

### `src/components/TeamSlot.vue`

- Own slot-level add, swap, and remove feedback.
- Expose clear root selectors or refs for icon, artwork, name, and type chips if sequencing needs them.
- Preserve current add/remove emits exactly.

### `src/components/PokemonSelectorModal.vue`

- Own modal-surface entrance and exit motion.
- Animate top controls and a limited visible subset of result rows.
- Keep focus behavior and backdrop close behavior intact.

### `src/components/TeamWeaknessChart.vue`

- Own alert reveal behavior.
- Own bar animation and label reveal.
- Re-run update animation when `teamTypes` changes meaningfully.

## Technical Approach

- Use GSAP timelines for page-level and modal-level sequencing.
- Use the existing `useGsapContext` helper for mount-scoped animations so reduced-motion users skip them automatically.
- Use Vue watchers plus scoped refs for state-driven slot and chart updates where mount-only GSAP context is not enough.
- Scope selectors to component roots with `gsap.context()` and revert or kill tweens on unmount.
- Prefer `autoAlpha`, `y`, `scale`, and short stagger values.

## State And Replay Rules

- Page-level orientation should run on Team Builder mount, not on every small reactive update.
- Modal entrance should run each time the modal opens.
- Slot feedback should run only for the slot being added, swapped, or removed.
- Chart updates should react to team composition changes, not unrelated renders.
- Reduced-motion users should see instant stable state updates with no hidden intermediate states.

## Accessibility

- Respect `prefers-reduced-motion` everywhere by routing mount sequences through the existing GSAP helper and keeping state changes safe without animation.
- Do not encode meaning in motion alone.
- Preserve keyboard focus behavior in the modal.
- Keep all controls interactive during or immediately after animation.

## Performance Constraints

- Animate `transform` and `opacity` for the main motion path.
- Limit width animation to the existing analysis bars only.
- Avoid animating large result lists indiscriminately.
- Keep cleanup explicit so reopening the modal or revisiting the route does not accumulate stale tweens.

## Verification Plan

1. Load Team Builder fresh and confirm the page feels more alive without delaying the task.
2. Add Pokemon into empty slots and verify slot entrance feedback feels punchy and fast.
3. Replace and remove team members and confirm only the affected slot animates.
4. Open and close the selector modal repeatedly, search, and filter by letter to confirm motion stays smooth.
5. Build a team that triggers warnings or strengths and confirm alert rows and bars animate clearly.
6. Test with reduced motion enabled and confirm the feature remains fully usable without animation.
7. Run `pnpm build` after implementation.

## Risks

- Over-animating the Team Builder could make a product workflow feel slower than intended.
- Slot-level state transitions can become brittle if they depend on broad reactive rerenders instead of precise change detection.
- Modal list staggering could become noisy or expensive if applied to too many result rows.
- Chart width animation can feel janky if it replays on every render instead of meaningful analysis changes.

## Recommendation

Implement the motion in this order: page orientation, slot feedback, modal choreography, then chart feedback. That order gives immediate user-facing value while keeping the higher-risk reactive animation work isolated and testable.
