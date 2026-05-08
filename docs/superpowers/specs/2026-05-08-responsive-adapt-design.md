# Design: Responsive Adapt Pass

Date: 2026-05-08

## Goal

Adapt the current Pokedex app for phone-first use without turning the work into a redesign. The app should feel native on narrow screens, remain clean on tablet, and preserve the current desktop strengths.

## Context

- Register: product
- Primary target: phones first
- Secondary targets: tablet and desktop regression safety
- Usage scene: a casual Pokemon fan checking entries one-handed on a phone, often quickly, in a relaxed setting

## Recommended Approach

Use a structural phone-first pass rather than an overflow-only patch or a broader redesign.

This approach keeps the current visual language and interaction model, but removes desktop-row assumptions from the surfaces that compress poorly on small screens. It is the smallest change that should materially improve usability.

## Responsive Strategy

### Layout principles

- Stack controls on phones when horizontal competition hurts readability or tap comfort.
- Reintroduce horizontal grouping only where the layout has enough room.
- Delay dense grids until desktop-sized viewports.
- Let labels wrap or reflow instead of forcing fixed-height bars.
- Keep core actions available on mobile. Do not hide primary functionality.

### Interaction principles

- Preserve touch-friendly spacing and clear tap targets.
- Avoid hover-dependent understanding for important actions.
- Keep sticky surfaces usable without consuming excessive viewport height.

## File-by-File Plan

### `src/App.vue`

Adapt the sticky top navigation so it can survive narrow widths.

- Replace the single rigid `h-14` nav row with a layout that can become two rows on phones.
- Reduce the amount of permanently reserved right-side padding for the theme toggle on small screens.
- Let route actions wrap into a second row on narrow viewports instead of relying on horizontal scrolling.
- Preserve the current desktop presentation where it already works.

### `src/views/HomeView.vue`

Adapt the home hero and sticky control surface for phone-first use.

- Reduce the hero heading scale and vertical footprint on phones so the first viewport is not dominated by branding.
- Change the control bar from a mixed horizontal row to a vertical stack on phones, then restore a row layout at `md` and above.
- Keep `SearchBar` full width.
- Place `SortSelect` and the filter button into the same stacked control rhythm.
- Restore the horizontal arrangement on larger breakpoints.

### `src/components/SortSelect.vue`

Make the sort control behave like a responsive form field instead of a desktop-sized inline select.

- Use full width by default.
- Allow larger breakpoints to opt back into intrinsic width from `md` upward if the parent layout needs it.

### `src/views/TeamBuilderView.vue`

Reduce early grid density so team slots stay tappable and legible.

- Keep a 2-column layout on phones.
- Move to 3 columns at `sm`.
- Delay the 6-column team grid until `lg`.
- Preserve the current panel structure and header hierarchy.

### `src/components/TeamWeaknessChart.vue`

Restructure each analysis row for smaller screens.

- On phones, split the current single-row layout into two rows:
  - row 1: type badge and counts
  - row 2: full-width effectiveness bar
- Restore the denser single-row layout from `sm` upward.
- Keep the vulnerability alerts above the chart, but ensure they wrap cleanly.

### `src/components/PokemonHero.vue`

Tighten the detail hero so it stays expressive without becoming top-heavy.

- Reduce the default image size on phones.
- Reduce the base heading scale on phones.
- Let the name and favorite button wrap more naturally if needed.
- Tighten vertical spacing so meaningful content appears sooner.
- Keep the desktop two-column hero layout.

### `src/views/GameView.vue`

Adapt the game surface for small screens without changing the game flow.

- Reduce stage padding on phones.
- Let the stats summary become a compact wrapped grid on phones, then return to a single row once space allows.
- Preserve the centered stage and current interaction sequence.

## Edge Cases

- No horizontal scrolling at `320px` width.
- The theme toggle must not collide with or obscure nav actions.
- Long labels such as `Who's that Pokemon?` must remain readable.
- Team slots must stay comfortably tappable.
- Weakness-chart rows must remain understandable when split over multiple lines.
- The detail hero must still feel special on desktop after the mobile tightening.

## Verification Plan

Review the adapted UI at these widths:

- `320px`
- `375px`
- `430px`
- `768px`
- `1024px`
- wide desktop

Success criteria:

- no horizontal overflow
- no clipped labels
- no cramped tap targets
- no mobile views that feel like squeezed desktop rows
- no visible regression in desktop layout quality

## Files Expected To Change

1. `src/App.vue`
2. `src/views/HomeView.vue`
3. `src/components/SortSelect.vue`
4. `src/views/TeamBuilderView.vue`
5. `src/components/TeamWeaknessChart.vue`
6. `src/components/PokemonHero.vue`
7. `src/views/GameView.vue`

## Out of Scope

- Redesigning the app's visual identity
- Changing navigation architecture beyond responsive reflow
- Hiding core actions on mobile
- Reworking unrelated data, state, or API behavior
