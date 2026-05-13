# Unit Tests After Guidelines Remediation

Date: 2026-05-13

## What broke

Accessibility and semantics updates changed several observable behaviors that tests asserted directly:

- `EvolutionTree` switched from `useRouter().push()` navigation to declarative `router-link`.
- Loading strings changed from `...` to `…`.
- `PokemonSelectorModal` autofocus became conditional on pointer/hover capability.
- `TeamBuilderView` now depends on both `useRoute()` and `router.replace()` for URL tab sync.

## Testing takeaway

When UI guidelines change behavior, tests should assert stable outcomes instead of old implementation details:

- Assert link `to` props for declarative navigation.
- Keep copy expectations aligned with canonical typography choices.
- Mock environment capabilities (`matchMedia`) when behavior is capability-gated.
- Expand router mocks when route/query synchronization is introduced.
