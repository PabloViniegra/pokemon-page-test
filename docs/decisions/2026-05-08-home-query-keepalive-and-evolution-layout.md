# Decision: preserve HomeView instance on query changes and redesign evolution tree layout

Date: 2026-05-08

## Context

Two regressions were reported:
- Typing in the home search input caused focus loss after every keystroke.
- Wide branching chains (for example Eevee) were hard to read and appeared visually broken.

## Decisions

### 1) Stop keying the routed component by `route.fullPath`

In `App.vue`, the KeepAlive-rendered route component was keyed with `r.fullPath`. Because home filters sync into query params, each keystroke changed `fullPath`, forcing a remount of `HomeView`.

We removed the `:key` from the routed component so query-only updates no longer remount HomeView and the search input keeps focus while typing.

### 2) Move evolution condition rendering to edges and add shared sibling connectors

The first tree implementation rendered conditions per node and only local vertical connectors. This degraded readability in wide branches.

We reworked `EvolutionTree.vue` to:
- compute child branches in the parent step,
- render evolution conditions on the parent-to-child edge,
- draw a shared horizontal connector rail for sibling branches,
- keep per-child drop lines,
- preserve recursive rendering and zero external dependencies.

### 3) Keep no-dependency approach for tree graphics

We intentionally did not add graph libraries. The evolution-chain domain remains small enough for a CSS + recursive Vue component, and this keeps bundle size and maintenance overhead low.

## Consequences

- Search input focus now remains stable while URL query params update.
- Evolution trees are clearer for both linear and wide branching chains.
- Tree layout remains responsive via scrollable container plus stronger connector semantics.
- Behavior is now covered by unit tests to reduce regressions.
