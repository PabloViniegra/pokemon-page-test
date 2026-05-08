# Add a root light/dark theme toggle with Pokemon branding

## Date
2026-05-08

## Context
The app only had a light theme, and most colors were hardcoded in Vue templates with Tailwind utility classes. The new requirement was to add a dark mode that still feels Pokemon-themed, keep the light mode as the default, place the toggle at the top right of the app, and use a circular view transition when switching themes.

## Decision
- Add a root `useTheme` composable that stores the current mode in `localStorage` and applies a `dark` class on `document.documentElement`.
- Initialize the theme before app mount in `src/main.ts` so the shell renders in the correct mode immediately.
- Place a fixed top-right toggle in `App.vue` that uses Solgaleo and Lunala artwork to represent light and dark modes.
- Implement the circular theme animation with the View Transition API and a masked circle reveal whose origin is set from the toggle button position.
- Use a hybrid styling approach for dark mode: targeted shell/page classes for the major themed surfaces, plus global dark overrides for the repeated Tailwind gray/white utility classes already spread across the component tree.

## Consequences
- Theme state now persists across reloads without changing route state or store shape.
- The app keeps the existing light palette as the default experience while adding a darker cosmic palette for night mode.
- Dark mode can be applied across the current app without a large refactor of every component to token-only classes.
- App shell tests should avoid relying on raw button order because the fixed theme toggle adds another button to the DOM.
