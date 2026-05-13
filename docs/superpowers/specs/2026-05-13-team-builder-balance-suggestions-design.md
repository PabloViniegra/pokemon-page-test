# Team Builder Balance Suggestions Design

Date: 2026-05-13

## Context

The app already includes a Team Builder route with:
- a `Pinia` store for the selected team
- a `useTeamDetailQueries` composable for loading team member details
- a `type-chart` helper that computes defensive weakness analysis
- a `TeamWeaknessChart` component that visualizes team vulnerabilities

The next feature is a recommendation system that helps users build a more balanced team while they are assembling it. The feature should provide both:
- helpful type guidance
- specific Pokemon suggestions

The user chose these product constraints for v1:
- show suggestions live on the Team Builder page
- show both helpful types and specific Pokemon
- rank suggestions with a balance-first priority
- use the defensive balance engine approach
- use broad candidate search rather than a small shortlist

## Goals

- Help users understand what their current team is missing.
- Suggest the next most useful types to add.
- Suggest specific Pokemon that improve team balance.
- Keep the logic explainable with short human-readable reasons.
- Reuse the current defensive type-analysis architecture.

## Non-Goals

- Offensive move coverage analysis
- Ability-based recommendation logic
- Base-stat or role-based recommendation logic
- Competitive team-building heuristics beyond simple duplicate-type penalties
- Replacing the existing weakness chart

## User Experience

Add a new live suggestions panel to the Team Builder page, positioned below or alongside the existing `TeamWeaknessChart`.

The panel updates whenever the team changes and shows two recommendation layers:

### 1. Helpful Types

Short guidance such as:
- "Your team would benefit from Water, Steel, or Ground coverage"
- "Adding a Steel-type would reduce Fairy and Ice pressure"

This layer gives the user fast strategic direction without requiring knowledge of individual Pokemon.

### 2. Suggested Pokemon

A ranked list of specific Pokemon not already on the team. Each item shows:
- sprite
- name
- types
- short explanation of why it helps

Example explanation patterns:
- "Helps against Electric and Rock pressure"
- "Adds a useful resistance to Ice and Fairy"
- "Improves one of your biggest shared weaknesses"

## Behavior Rules

- If the team is empty, show a neutral prompt asking the user to add Pokemon first.
- If the team has 1 to 5 Pokemon, frame recommendations as next additions.
- If the team has 6 Pokemon, frame recommendations as possible improvements or swaps.
- Recommendations must remain explainable and never appear as opaque scores only.
- The existing weakness chart remains visible and unchanged in purpose.

## Architecture

Keep the recommendation system as a separate layer on top of the current team-builder flow.

### Responsibilities

- `src/helpers/type-chart.ts`
  - remains the source of truth for defensive effectiveness math

- `src/helpers/team-suggestions.ts`
  - new pure helper module for ranking weaknesses, scoring candidate improvements, and generating explanation text

- `src/composables/useTeamDetailQueries.ts`
  - continues to load current team details and typings

- `src/composables/useTeamSuggestions.ts`
  - new composable responsible for candidate loading, scoring, ranking, explanations, and loading or error state

- `src/components/TeamSuggestionsPanel.vue`
  - new presentational component for rendering helpful types, suggested Pokemon, and panel states

- `src/views/TeamBuilderView.vue`
  - remains the route-level composition surface
  - wires together existing weakness analysis and the new suggestions panel

- `src/stores/team.ts`
  - remains unchanged
  - continues to own only selected team member state

## Data Flow

1. The team store exposes the selected team member IDs.
2. `useTeamDetailQueries` loads full detail data for the current team.
3. `useTeamSuggestions` consumes current team details and derives current defensive pressure from the existing weakness analysis.
4. `useTeamSuggestions` loads a broad candidate dataset containing only the minimum fields needed for ranking.
5. The composable ranks helpful types and specific Pokemon against the current team state.
6. `TeamBuilderView` passes the resulting suggestion data to `TeamSuggestionsPanel`.

## Recommendation Strategy

V1 uses a defensive improvement score.

### Current Team Pressure

For the current team, compute weakness analysis with the existing `analyzeTeamWeaknesses` helper.

Sort attacking types by:
- highest `averageEffectiveness`
- then highest `weakCount`

This produces the team's most important defensive gaps.

### Helpful Type Suggestions

For type suggestions:
- simulate adding a single candidate type at a time
- measure how much each candidate reduces the team's top weakness pressure
- rank candidates by total improvement

The result is a short list of recommended single-type directions the user should look for next.

### Specific Pokemon Suggestions

For Pokemon suggestions:
- evaluate candidate Pokemon not already on the team
- use each candidate's real typings
- score each candidate by how much it reduces the team's worst defensive pressure
- apply a small penalty for repeating an exact typing already present on the team so the list is less repetitive

The score should remain understandable and mostly driven by weakness reduction, not hidden heuristics.

## Explanation Text

Each recommendation should include a short reason derived from the actual weaknesses it improves.

Generation rules:
- identify the top 1 to 2 attacking types improved by the suggestion
- prefer plain-language phrasing
- avoid exposing raw internal formulas to the user

The explanation generator should be deterministic so it can be unit tested.

## Broad Candidate Search

The user chose broad candidate search for v1, but the page should remain responsive.

### Candidate Dataset Shape

Build a cached dataset containing only the fields needed for ranking:
- `id`
- `name`
- `types`
- `isDefault`

### Candidate Source

- Start from the existing all-Pokemon name list query.
- Progressively fetch candidate detail data in batches once the team has at least one member.
- Filter out:
  - Pokemon already on the team
  - non-default forms

### Loading Strategy

- Do not block the page on a full Pokedex fetch before showing results.
- Score against whatever candidate data is currently available.
- Improve and rerank results as more candidate batches are cached.
- Cache the dataset so repeated team edits do not trigger the full load again during the same session.

### User-Facing Behavior During Loading

- Show early suggestions quickly when possible.
- Show progress copy such as "Analyzing more Pokemon..." while the broader dataset is still loading.
- Keep the weakness chart fully functional even if suggestions are still warming up.

## UI States

`TeamSuggestionsPanel.vue` should support these states:

### Empty Team

Show a prompt like:
- "Start building your team to get balance suggestions."

### Partial Data Loading

Show:
- loading or skeleton UI
- progress copy for broad-search analysis
- best available early suggestions if they already exist

### Ready

Show:
- summary sentence describing the best missing coverage
- top helpful type chips
- top suggested Pokemon cards with reasons

### Dataset Error

Show a small non-blocking message such as:
- "Suggestions are temporarily unavailable."

The weakness chart must still work normally if suggestion loading fails.

## Interaction Details

- If the team has open slots, suggestion wording should focus on additions.
- If the team is full, wording should focus on possible swaps or improvements.
- Each suggested Pokemon card should display sprite, name, and type badges.
- In v1, the panel is a read-only guidance surface and does not directly modify the team.
- Team changes continue to happen through the existing picker flow.

## Component Boundaries

- `TeamBuilderView.vue`
  - page composition only
  - no heavy scoring logic

- `TeamSuggestionsPanel.vue`
  - rendering only
  - receives fully prepared view-model data

- `useTeamSuggestions.ts`
  - owns async candidate loading
  - owns ranking and explanation generation
  - exposes ready-to-render state

- suggestion scoring helpers
  - pure and framework-agnostic
  - isolated for unit testing

## Error Handling

- Candidate data fetch failures should not break the page.
- Existing team weakness analysis remains independent and available.
- Suggestion loading errors should degrade only the suggestion panel.
- Partial dataset availability is acceptable and should still produce best-effort results.

## Testing Strategy

Focus testing on the logic layer.

### Unit Tests

Add unit coverage for pure helpers that:
- rank the current team's top weaknesses
- score helpful type candidates
- score Pokemon candidates
- generate explanation text
- apply duplicate-typing penalties

### Composable Tests

Add targeted tests for:
- empty team state
- exclusion of current team members
- progressive broad-search loading behavior
- graceful fallback when candidate loading fails

### UI Testing

V1 does not require a large UI test suite if the scoring logic and composable behavior are covered well.

## Trade-offs

- Broad candidate search provides stronger recommendations than a tiny shortlist, but increases async complexity.
- Progressive loading keeps the page responsive, but means early results may improve over time.
- Defensive-only scoring is simpler and more explainable, but not as "smart" as a system that also uses moves, abilities, or roles.
- Keeping the store unchanged preserves architecture clarity, but requires a separate composable and cache layer for suggestions.

## Implementation Notes

- Prefer reusing existing Vue Query caching patterns already present in the project.
- Keep route-level components thin and use Composition API with `<script setup lang="ts">`.
- Do not mix suggestion-scoring rules into the Pinia team store.
- Keep recommendation helpers small and pure so they are easy to verify and evolve later.

## Open Decisions Deferred Beyond V1

These are intentionally out of scope for the first version:
- offensive move coverage recommendations
- role-based recommendations such as tank, speed control, or special attacker
- popularity or "iconic Pokemon" boosting
- region, generation, or user-preference filters for suggestions

## Summary

The feature adds a live Team Builder suggestions panel that complements the existing weakness chart. It recommends both helpful types and specific Pokemon using a defensive, balance-first scoring model. The implementation should rely on pure scoring helpers, a dedicated `useTeamSuggestions` composable, and progressive broad-search candidate loading so the UI remains responsive while recommendations get stronger over time.
