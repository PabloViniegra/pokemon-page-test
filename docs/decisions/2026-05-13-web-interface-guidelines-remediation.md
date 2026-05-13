# Web Interface Guidelines Remediation

Date: 2026-05-13

## Decision

Use small, targeted fixes to address Web Interface Guidelines findings instead of broad UI refactors.

## Applied choices

- Add a shared skip link in `App.vue` and a shared `#main-content` target on route-level pages.
- Keep search controls inline, but make them accessible with `type="search"`, `name`, `autocomplete="off"`, and `aria-label`.
- Guard modal autofocus to desktop-like pointer environments only.
- Use `content-visibility: auto` for large repeated UI lists as the minimal performance fix instead of introducing virtualization.
- Deep-link Team Builder tab state with a `tab` query param and require confirmation before clearing the team.
- Replace broad `transition-all` usage with explicit property transitions or remove the transition when width animation was the only effect.
