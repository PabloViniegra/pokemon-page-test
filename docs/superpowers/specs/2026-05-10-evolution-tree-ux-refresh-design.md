# Evolution Tree UX Refresh Design

## Summary

Redesign the Pokemon detail page evolution tree into a clearer lineage map that makes parent-child relationships explicit, keeps wide branching families readable, and preserves direct navigation between related Pokemon.

This spec extends the existing evolution-tree work rather than replacing the data model. The current stage-based layout solved wide-branch overflow, but it still leaves family structure too implicit. The new design keeps the resilience of stage grouping while shifting the presentation toward a branch rail map.

## Product Context

- Register: product
- Primary goal: stronger family relationship clarity
- User priority from shaping: allow a bigger redesign if it materially improves lineage readability
- Existing product tone to preserve: modern Pokedex, playful and colorful, but still task-oriented and trustworthy

## Scene

A fan is casually browsing a Pokemon detail page on a phone or laptop and wants to understand where this Pokemon sits in its family immediately, without mentally reconstructing the chain from a list of loosely connected cards.

This pushes the design toward a light-first, structure-driven interface with restrained color, explicit connectors, and a strong current-Pokemon anchor.

## Goals

1. Make parent-child relationships obvious at first glance.
2. Make the currently viewed Pokemon the orientation anchor within the family.
3. Keep wide branching chains like Eevee readable without dropped nodes or fragile connector geometry.
4. Preserve direct navigation to any related Pokemon.
5. Fit the detail page's existing visual language and dark-mode support.

## Non-Goals

1. Replace the current API layer or evolution parsing model.
2. Introduce a graph or diagram library.
3. Turn the section into a highly animated or playful toy-like interaction.
4. Rebuild the entire detail page layout.

## Approved Direction

Use a branch rail map.

The lineage remains stage-oriented from left to right, but each parent owns a visible relationship module:

- a parent trunk,
- a shared sibling rail,
- child drop lines,
- edge-mounted condition labels.

This keeps the wide-family resilience of the current stage grouping while making the relationship semantics explicit.

## Information Architecture

The section should read in this order:

1. Section heading
2. Brief orientation cue if needed for accessibility or single-stage families
3. Current Pokemon node, visually emphasized within the chain
4. Immediate upstream and downstream family relationships
5. Wider branch sets

The current Pokemon is not moved into a separate detached summary. It stays inside the family map so the relationship context remains intact.

## Structural Design

### Layout model

- Keep horizontal stage progression as the base mental model.
- Replace free-floating arrow separators with grouped relationship blocks.
- Each stage may contain one or more branch groups tied to a shared parent.
- Conditions belong on the edge between parent and child, not as detached node badges.
- Vertical spacing between unrelated sibling groups should be intentional and larger than intra-group spacing.

### Current Pokemon emphasis

- Pass `currentPokemonId` into the evolution surface.
- The active Pokemon node gets the strongest emphasis in the map.
- The emphasis should use surface treatment, contrast, and a compact marker such as `Current entry`, not a loud decorative flourish.
- Neighboring nodes remain clearly interactive but visually secondary.

### Branch semantics

- Linear families should read as a calm, obvious path.
- Forks should show one parent feeding a shared rail that splits into children.
- Late-stage forks such as Poliwag -> Poliwhirl -> Poliwrath or Politoed should visibly preserve the intermediate parent relationship.
- Wide sets such as Eevee should read as one parent with many valid outcomes, not as an accidental vertical list.

## Interaction Design

- Every Pokemon node remains clickable and routes to that Pokemon detail page.
- Hover and focus should strengthen one relationship path at a time: parent node, connector path, and child node.
- Focus treatment must be keyboard-visible and consistent with the app's other controls.
- Condition labels should be compact, human-readable, and easy to associate with their edge.
- Horizontal overflow remains acceptable, but the scroll region should feel intentional through edge fades or similar cues.
- Motion is limited to state feedback only: hover emphasis, focus states, subtle connector opacity changes.

## Visual Language

### Color strategy

Use a Restrained product-UI palette with one committed accent moment around the current Pokemon.

- Base surfaces, rails, and supporting labels rely on app neutrals.
- The active node and key emphasis states can borrow the page's primary type color.
- Do not saturate the entire tree with type color.
- Connector lines should stay neutral by default and strengthen only on active or hovered paths.

### Theme behavior

- Use existing app surface and border tokens instead of hard-coded white and gray values.
- The design must work in both light and dark modes.
- Contrast must remain sufficient when type-tinted accents are applied.

### Typography

- Section heading may keep the existing display voice.
- Node labels and conditions use the app's standard UI sans.
- Condition chips should feel more like route annotations than celebratory badges.

## Responsive Behavior

### Mobile

- Preserve horizontal scroll.
- Keep the connector system, but simplify geometry where necessary.
- Increase vertical breathing room between branch groups.
- Keep condition labels short, wrap-safe, and visually attached to the edge they describe.

### Desktop

- Allow wider spacing between stages.
- Use clearer alignment for sibling sets.
- Preserve scanability without turning the section into a dense engineering diagram.

### Wide families

- Branch groups should remain grouped by shared parent.
- Do not collapse branches into identical card stacks with no structural cues.
- Overflow cues should communicate that the family continues horizontally.

## States

### Loading

- Render a section shell with skeleton lineage placeholders.
- Avoid dropping the entire section while the rest of the page is visible.

### Error

- Keep the section shell visible.
- Show a compact inline error state if the evolution request fails independently.
- If retry is practical within current query patterns, expose it. Otherwise provide a clear failure message.

### Empty or single-stage family

- Render a meaningful single-node state.
- Include concise copy such as `No further evolutions` only when it adds clarity.

### Reduced motion

- Remove transition-driven emphasis while keeping contrast and borders strong enough to preserve structure.

## Component Boundaries

### Route/View layer

`DetailView.vue` remains a composition surface.

Responsibilities:

- fetch Pokemon, species, and evolution data
- pass `node`, `accentColor`, and `currentPokemonId` into the evolution feature
- keep section placement and page-level loading behavior

### Evolution feature

`EvolutionTree.vue` remains the feature entry component.

Potential internal split if needed:

- lineage layout/group helper or composable
- Pokemon node presentational component
- edge or connector presentational component

Split only if the branch-rail rendering becomes too dense for one file. The default preference is still the smallest maintainable implementation.

## Data and Formatting Rules

- Reuse the existing `EvolutionNode` tree structure.
- Reuse or extend current stage/group computation instead of replacing parsing.
- Normalize condition labels into human-readable copy where possible.
- Preserve deterministic rendering for tests with static tree input.

## Accessibility

1. Keyboard users must be able to tab through every Pokemon node.
2. Focus state must remain visible against both neutral and type-tinted surfaces.
3. Relationship clarity cannot depend on color alone.
4. Condition labels should be exposed as readable text, not icon-only markers.
5. Reduced-motion users should retain the same structural clarity.

## Testing Plan

Update component coverage to verify:

1. active Pokemon emphasis is applied correctly
2. edge-mounted condition labels render in the expected relationship context
3. wide branching families still render every descendant
4. multi-child parents preserve grouped relationship clarity
5. single-stage families render a meaningful state
6. node click still navigates to the related Pokemon detail page

Typecheck and production build remain required after implementation.

## Risks And Mitigations

- Risk: true freeform tree connectors become fragile on wide branches.
  Mitigation: keep stage grouping as the underlying layout model.

- Risk: condition labels clutter dense families.
  Mitigation: attach them to edges, keep them compact, and prioritize readable formatting.

- Risk: active-node emphasis overwhelms the rest of the family.
  Mitigation: use one committed accent moment only on the current node and interaction states.

- Risk: dark mode regressions from hard-coded colors.
  Mitigation: move the feature to app tokens and neutral surfaces.

## Acceptance Criteria

The redesign is successful when:

1. a user can identify the current Pokemon's place in the family immediately
2. parent-child links are visibly clearer than in the current stage-column implementation
3. wide branching chains remain complete and readable
4. the surface feels aligned with the detail page rather than visually bolted on
5. keyboard navigation, focus visibility, and reduced-motion behavior remain intact
