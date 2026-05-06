# AGENTS.md

## Commands

- **Dev server**: `pnpm dev` (Vite)
- **Typecheck + build**: `pnpm build` (runs `vue-tsc -b && vite build` — typecheck must pass before build)
- **Preview built app**: `pnpm preview`
- **Package manager**: pnpm (lockfile: `pnpm-lock.yaml`)
- No test framework, linter, or formatter is configured.

## Architecture

Vue 3 SPA using Composition API with `<script setup lang="ts">`.

**Routes** (see `src/router/index.ts`):
- `/` — HomeView: Pokémon grid with infinite scroll, search (debounced), type filters, sorting
- `/pokemon/:id` — DetailView: full Pokémon detail page

**Key directories**:
- `src/composables/` — Vue Query hooks (`usePokemonQueries.ts`) and UI composables
- `src/stores/` — Pinia stores (`filters.ts` syncs filter state to URL query params)
- `src/helpers/pokemon-api.ts` — all PokeAPI fetch functions (base URL: `https://pokeapi.co/api/v2`)
- `src/types/pokemon.ts` — all TypeScript interfaces and constants (`TYPE_COLORS`, `STAT_NAMES`, etc.), barrel-exported from `src/types/index.ts`

## Strict rules YOU MUST follow

- Document lessons learned and decisions in the `docs` *folder* (under `learnings` and `decisions`)
- **ALWAYS USE** `using-superpowers` skill before do anything.
- Before tackling an entire **task on your own**, check the `subagents` to see if you can delegate it.

## Gotchas

- **KeepAlive + scroll restoration**: See `docs/learnings/scroll-restoration-with-keepalive.md`. Must use `<router-view v-slot="{ Component }">` slot pattern; return `false` from `scrollBehavior` for same-route navigations; use `sessionStorage` (not component state) for scroll position; use `router.back()` not `router.push()` for back navigation.
- **Tailwind CSS v4**: Uses `@import "tailwindcss"` and `@theme` directive in `src/style.css` (not a `tailwind.config` file). Custom theme tokens defined there.
- **Vue Query**: 24-hour stale/gc time for Pokémon data; query key factory in `src/composables/usePokemonQueries.ts`; Vue Query Devtools enabled in `App.vue`.
- **Filter state ↔ URL sync**: Pinia `filters` store two-way-syncs `q`, `types`, and `sort` query params. Guard against re-entrancy with `syncingFromUrl`/`syncingToUrl` flags when modifying.
- **tsconfig**: Split project references (`tsconfig.app.json` for app, `tsconfig.node.json` for Vite config). Strict lint options enabled (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`).