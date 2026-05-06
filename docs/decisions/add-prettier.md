# Add Prettier for Code Formatting

## Date
2026-05-06

## Context
The project lacked a consistent code formatter. Adding Prettier ensures uniform code style across the codebase.

## Decision
Add Prettier with the following configuration:
- Single quotes only (`singleQuote: true`)
- No semicolons (`semi: false`)

## Consequences
- All source files will be formatted with consistent style
- `pnpm format` formats all files in `src/`
- `pnpm format:check` validates formatting (useful for CI)
- Existing code has been reformatted to match the new rules
