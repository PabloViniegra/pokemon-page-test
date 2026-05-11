# Pokédex

A feature-rich Pokédex web application built with Vue 3, TypeScript, and Vite. Browse, search, and explore every Pokémon from the PokeAPI, build competitive teams, and test your knowledge with a "Who's That Pokémon?" game.

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3.5" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript 6.0" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white" alt="Vite 8.0" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4.2" />
  <img src="https://img.shields.io/badge/Pinia-3.0-DD0031?logo=pinia&logoColor=white" alt="Pinia 3.0" />
  <img src="https://img.shields.io/badge/Vue_Router-5.0-4FC08D?logo=vue.js&logoColor=white" alt="Vue Router 5.0" />
  <img src="https://img.shields.io/badge/TanStack_Query-5.100-FF4154?logo=reactquery&logoColor=white" alt="TanStack Query 5.100" />
  <img src="https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock&logoColor=white" alt="GSAP 3.15" />
  <img src="https://img.shields.io/badge/PNPM-10.33-F69220?logo=pnpm&logoColor=white" alt="pnpm 10.33" />
</p>

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Build](#build)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| State Management | Pinia |
| Routing | Vue Router |
| Data Fetching | TanStack Query (Vue Query) |
| Animations | GSAP |
| Testing | Vitest + Vue Test Utils |
| Formatting | Prettier |
| Package Manager | pnpm |
| API | PokeAPI v2 |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [pnpm](https://pnpm.io/) (v10 or later)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pokemon-page-test.git
cd pokemon-page-test

# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
# Typecheck and production build
pnpm build

# Preview the production build locally
pnpm preview
```

## Project Structure

```
src/
  assets/              # Static assets (images, sprites)
  components/          # Reusable Vue components
  composables/         # Vue Composition API hooks and utilities
  helpers/             # API client functions and utilities
  router/              # Vue Router configuration
  stores/              # Pinia stores (filters, favorites, team, game stats)
  types/               # TypeScript interfaces and type definitions
  views/               # Page-level components (Home, Detail, Team Builder, Game)
  App.vue              # Root component
  main.ts              # Application entry point
  style.css            # Global styles and Tailwind theme tokens
```

## Architecture

This application follows Vue 3 best practices with the Composition API and `<script setup>` syntax.

- **Data Layer**: All PokeAPI requests are handled through `src/helpers/pokemon-api.ts` and cached via TanStack Query with a 24-hour stale/gc time. Query keys are organized in a factory pattern in `usePokemonQueries.ts`.
- **State Management**: Pinia stores manage UI state (filters, favorites, team, game stats). The filters store syncs state bidirectionally with URL query parameters.
- **Routing**: Four routes (Home, Detail, Team Builder, Game) with route-level code splitting, scroll behavior handling, and dynamic SEO meta tags via `beforeEach` navigation guards.
- **Styling**: Tailwind CSS v4 with `@theme` directive for custom tokens.

## Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage report
pnpm test:coverage
```

Tests are written with Vitest and Vue Test Utils, covering view components and composables.

## Deployment

The project includes GitHub Actions workflows for CI/CD:

- `.github/workflows/test.yml` — runs tests on push/PR
- `.github/workflows/deploy.yml` — builds and deploys to GitHub Pages

The build script generates a `404.html` fallback for SPA routing on static hosts.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the contribution process.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
