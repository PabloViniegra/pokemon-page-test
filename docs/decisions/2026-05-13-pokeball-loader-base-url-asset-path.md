# Pokeball Loader Asset Path Uses BASE_URL

Date: 2026-05-13

## Context

After introducing `PokeBallLoader.vue`, unit test suites that mount pages using the loader failed in jsdom with:

- `TypeError: The argument 'filename' must be a file URL object, file URL string, or absolute path string. Received 'file:///logo.svg'`

## Decision

Use a base-aware asset path in `PokeBallLoader.vue`:

- `const logoSrc = `${import.meta.env.BASE_URL}logo.svg``
- bind with `:src="logoSrc"`

instead of a hard-coded root path (`/logo.svg`).

## Rationale

- Aligns with existing project asset usage (`HomeView.vue` already uses `import.meta.env.BASE_URL`).
- Avoids root-absolute URL edge cases in jsdom test environments.
- Preserves correct behavior when app base is configured to `/pokemon-page-test/`.
