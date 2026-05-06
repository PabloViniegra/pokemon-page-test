# Scroll Restoration with KeepAlive in Vue Router

## The Problem

When navigating back from a Pokemon detail page to the Pokedex list, users were taken to the top of the page instead of returning to their previous scroll position. This made the infinite-scroll list unusable for anyone browsing deep into the catalog.

## Root Causes

The bug was caused by **three interacting issues**:

### 1. Incorrect `<KeepAlive>` usage with `<router-view>`

Vue Router 4 no longer supports wrapping `<router-view>` directly inside `<KeepAlive>`:

```vue
<!-- WRONG — causes lifecycle and navigation glitches -->
<KeepAlive>
  <router-view />
</KeepAlive>

<!-- CORRECT — use the slot props pattern -->
<router-view v-slot="{ Component }">
  <KeepAlive>
    <component :is="Component" />
  </KeepAlive>
</router-view>
```

The old pattern caused a **spurious navigation event** where Vue Router logged `{to: 'home', from: 'home'}` — a phantom route change from home to home that shouldn't exist.

### 2. Spurious `scrollBehavior` call scrolling to top

That phantom `home → home` navigation triggered a second `scrollBehavior` call with `savedPosition: null`. Since `null` didn't match any special condition, it fell through to `return { top: 0 }`, **overriding** the correct scroll restoration that had just happened.

The full sequence when navigating back from detail was:

1. `scrollBehavior({to: 'home', from: 'pokemon-detail', savedPosition: {top: 6700}})` — correctly restores scroll to 6700
2. `scrollBehavior({to: 'home', from: 'home', savedPosition: null})` — **scrolls to top**, undoing step 1

### 3. `onDeactivated` corrupting the saved scroll value

Using `onDeactivated` to save scroll position was wrong. It fires **after** `onBeforeRouteLeave`, during the component teardown/deactivation phase when the scroll position has already partially shifted due to the navigation transition. This overwrote the correct value captured by `onBeforeRouteLeave`.

Example from console logs:

```
onBeforeRouteLeave, savedScrollY: 6700   ← correct
onActivated,     savedScrollY: 1556      ← corrupted by onDeactivated
```

## The Fix

### A. Use the slot-based KeepAlive pattern

```vue
<!-- App.vue -->
<router-view v-slot="{ Component }">
  <KeepAlive>
    <component :is="Component" />
  </KeepAlive>
</router-view>
```

### B. Neutralize the spurious `home → home` scroll call

```ts
// router/index.ts
scrollBehavior(to, from, savedPosition) {
    // KeepAlive causes a phantom home→home navigation that would
    // scroll to top. Returning false tells Vue Router to leave
    // the scroll position alone.
    if (to.name === 'home' && from.name === 'home') {
        return false
    }

    // When coming back from a detail page, read the saved position
    // from sessionStorage instead of relying on Vue Router's
    // savedPosition (which is unreliable with KeepAlive).
    if (to.name === 'home' && from.name === 'pokemon-detail') {
        const stored = sessionStorage.getItem('pokedex-scroll-y')
        if (stored) {
            return { top: parseInt(stored, 10), behavior: 'instant' }
        }
        return { top: 0 }
    }

    if (savedPosition) {
        return { ...savedPosition, behavior: 'instant' }
    }
    return { top: 0 }
}
```

### C. Save scroll position to `sessionStorage` — not component state

```ts
// HomeView.vue
onBeforeRouteLeave(() => {
    sessionStorage.setItem('pokedex-scroll-y', String(window.scrollY))
})
```

Do NOT use `onDeactivated` or a module-level variable. Component-level state can be corrupted by KeepAlive lifecycle hooks, and `onDeactivated` fires at the wrong time with an already-shifted scroll position.

`sessionStorage` is immune to all of this — it persists across navigations, is isolated per tab, and clears when the tab closes.

### D. Use `router.back()` instead of `router.push()`

```vue
<!-- DetailView.vue -->
<PokemonHero @back="router.back()" />
```

`router.push({ name: 'home' })` is a forward navigation, which means Vue Router won't provide a `savedPosition`. `router.back()` triggers a proper history back-navigation that allows `scrollBehavior` to detect the `from → to` direction correctly.

## Rules to Remember

| Rule | Why |
|------|-----|
| Always use `<router-view v-slot="{ Component }">` with KeepAlive | The old `<KeepAlive><router-view/></KeepAlive>` pattern causes phantom navigations |
| Return `false` from `scrollBehavior` for spurious same-route navigations | Prevents KeepAlive glitches from scrolling to top |
| Use `sessionStorage` for scroll position, not component state | Avoids corruption from `onDeactivated` and component re-creation |
| Only save scroll in `onBeforeRouteLeave`, never `onDeactivated` | `onDeactivated` fires too late with a shifted scroll value |
| Use `router.back()` for back navigation, not `router.push()` | Forward navigation doesn't carry `savedPosition` |
| Always specify `behavior: 'instant'` in scroll returns | Prevents smooth-scroll race conditions with CSS `scroll-behavior: smooth` |
