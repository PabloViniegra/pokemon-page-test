# Decision: Team Builder Balance Suggestions

Date: 2026-05-13

## Context

The Team Builder page already lets users assemble a team of 6 Pokémon and analyze defensive type weaknesses. The next request was to surface live suggestions that guide users toward a more balanced team, showing both helpful types and specific Pokémon.

## Decisions

### 1. Defensive-only, explainable scoring

V1 uses a purely defensive improvement score. For each candidate, we simulate adding it to the current team and measure how much the team’s worst shared weaknesses improve. This keeps the logic transparent and easy to explain with short sentences like “Helps against Electric and Rock pressure.”

Offensive coverage, abilities, stats, and competitive roles are intentionally out of scope for v1.

### 2. GraphQL for broad candidate search

Fetching detailed typing for all ~1,000 default Pokémon via the REST API would require hundreds of sequential requests, which is impractical in the browser. We use PokeAPI’s GraphQL endpoint (`beta.pokeapi.co/graphql/v1beta`) to fetch all default-form Pokémon with their types in a single request. This makes a true broad search feasible with minimal latency.

Trade-off: the GraphQL endpoint is labeled beta, but it has been stable for years. If it becomes unavailable, the suggestion panel degrades gracefully and shows a non-blocking error message.

### 3. Pure helper module

All scoring, ranking, and explanation logic lives in `src/helpers/team-suggestions.ts`, a framework-agnostic pure module. This makes it trivial to unit-test without mounting Vue components or mocking Vue Query.

### 4. Read-only guidance panel in v1

The `TeamSuggestionsPanel` component is a read-only guidance surface. It does not directly add or replace team members. Users continue to use the existing picker flow. This keeps v1 simple and avoids adding new interaction patterns before they are needed.

### 5. Duplicate-typing filter

Candidates that repeat an exact typing already present on the team receive a small penalty. In practice, this almost always pushes their score below zero, which filters them out. The result is that the suggestion list avoids redundant typings without needing complex deduplication rules.

## Files Added or Changed

- `src/helpers/team-suggestions.ts` — pure scoring and explanation helpers
- `src/helpers/pokemon-api.ts` — added `getAllDefaultPokemonWithTypes` GraphQL fetch
- `src/composables/useTeamSuggestions.ts` — composable that loads candidates and derives suggestions
- `src/components/TeamSuggestionsPanel.vue` — presentational panel
- `src/views/TeamBuilderView.vue` — integrated the panel
- `tests/unit/helpers/team-suggestions.test.ts` — unit tests for scoring logic
- `tests/unit/views/team-builder-view.test.ts` — updated mocks to include `useQuery` and the new panel stub
- `docs/superpowers/specs/2026-05-13-team-builder-balance-suggestions-design.md` — design spec

## Open Decisions for Later

- Direct “Add to team” action on suggestion cards
- Offensive coverage and move-set awareness
- Popularity or generation-based boosting
- User preference filters (e.g., only suggest Pokémon from specific generations)
