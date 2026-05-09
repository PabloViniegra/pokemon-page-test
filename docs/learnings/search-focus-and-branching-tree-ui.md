# Learning: query-keyed KeepAlive remounts can break input focus, and branch connectors need group semantics

## What we observed

1. Search input focus was lost after each typed character on Home.
2. Evolution tree looked disconnected for wide branches (Eevee-like chains).

## Root cause and takeaway (search focus)

- The input itself was not the problem.
- `searchInput` syncs to URL query params, so every keystroke changed `route.fullPath`.
- `App.vue` keyed the routed component by `fullPath`, which remounted `HomeView` on each query update.

**Takeaway:** do not key KeepAlive-routed components with `fullPath` when query params are part of active local interaction state.

## Root cause and takeaway (evolution tree)

- Local child connectors alone are not enough for wide branching trees.
- Conditions tied to nodes (instead of edges) become noisy in multi-branch layouts.

**Takeaway:** for tree UIs with sibling branches, represent relationship semantics explicitly:
- parent trunk,
- sibling rail,
- child drops,
- edge condition labels.

This remains understandable across linear and high-fan-out chains.

## Test guardrails added

- App shell test now verifies query-only `fullPath` updates do not remount Home and do not drop focused input.
- Evolution tree tests now include a wide 8-branch chain assertion to ensure all branches are rendered.
