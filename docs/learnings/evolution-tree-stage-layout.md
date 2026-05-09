# Learning: stage-based evolution layout for wide branching chains

## What we observed

The original vertical recursive tree with CSS connector lines (`::before` pseudo-elements, `w-px` divs) broke visually for wide branching chains like Eevee (8 evolutions). Connectors didn't align, branches overlapped, and horizontal scrolling clipped content.

## Root cause

A top-down recursive tree requires group-aware connectors (shared horizontal rail between siblings, drop lines from rail to each child). Pure CSS cannot reliably compute sibling-center alignment for variable-width branches without JavaScript measurement or fixed widths that break responsiveness.

## What worked

Replacing the recursive vertical tree with a **stage-based horizontal column layout**:

1. Flatten the evolution tree into depth levels (`computeEvolutionStages`).
2. Render each stage as a vertical column of Pokémon cards.
3. Between columns, show right-pointing arrow indicators.
4. Condition badges appear above each card (not on connectors).
5. Extra vertical spacing separates groups with different parents within the same column.

This layout handles all chain patterns naturally:
- **Linear** (Bulbasaur → Ivysaur → Venusaur): three columns, one card each.
- **Wide branching** (Eevee → 8 evolutions): two columns, eight cards stacked vertically in column 2.
- **Fork after linear** (Poliwag → Poliwhirl → Poliwrath/Politoed): three columns, two cards in the last column.
- **Single Pokémon** (Mew): one column, one card.

## Key takeaway

For tree-like data with potentially wide fan-out, prefer a **flattened stage/level layout** over recursive tree rendering. It avoids the connector-alignment problem entirely and degrades gracefully via horizontal scroll.