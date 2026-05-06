# KeepAlive + Dynamic Route Params Bug

## Problem

Navigating from `/pokemon/charizard` to `/pokemon/volcarona` (via search then click) showed Charizard's data instead of Volcarona's.

## Root Cause

`<KeepAlive>` in `App.vue` was wrapping ALL routed components unconditionally. When navigating between two routes that use the same component (`DetailView`), Vue reuses the cached instance instead of creating a new one.

Even though `usePokemonDetailQuery(id)` uses `computed(() => pokemonKeys.detail(toValue(id)))` (which is reactive), the `<KeepAlive>` cache returns the stale component before the reactive query can update the DOM, resulting in the old Pokémon being shown.

## Fix

Two changes in `App.vue`:

1. **`<KeepAlive include="HomeView">`** - Only cache `HomeView` (needed for scroll restoration with infinite scroll). `DetailView` should never be cached.
2. **`:key="route.fullPath"`** on the dynamic component ensures a fresh instance is created when route params change.

```vue
<router-view v-slot="{ Component, route }">
  <KeepAlive include="HomeView">
    <component :is="Component" :key="route.fullPath" />
  </KeepAlive>
</router-view>
```

## Lesson

When using `<KeepAlive>` with Vue Router, always restrict caching to specific components via `include`/`exclude`. Never wrap all routes blindly - dynamic route components with path params should not be cached.
