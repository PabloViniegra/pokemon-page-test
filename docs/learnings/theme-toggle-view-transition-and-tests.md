# Learning: root theme features affect bootstrap tests and global DOM state

## What we did
Added a root theme composable, initialized it in `main.ts`, and introduced a fixed app-shell toggle that updates the `html` class and triggers a View Transition API animation.

## What worked well
- A root composable kept theme persistence and DOM updates out of route views.
- Initializing theme state before mount prevented a visible flash of the wrong mode.
- Setting the view-transition origin from the clicked toggle made the circular reveal feel anchored to the control instead of the page center.

## Key takeaways
- Bootstrap tests that mock the entire `vue` module can break as soon as startup code imports composables that use normal Vue APIs like `ref` or `computed`; partial mocks are safer.
- App-shell tests should target buttons by label or intent, not by array index, when the shell can grow new controls.
- Theme tests and shared test setup should reset `document.documentElement` classes and inline style variables so one test's theme choice does not leak into the next one.
