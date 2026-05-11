# Detail Route Param Reactivity with Vue Query

## Issue

Clicking a different Pokemon in the evolution chain updated the route path, but the detail screen stayed on the previous Pokemon.

## Root Cause

`DetailView.vue` passed `props.id` as a plain primitive into query composables:

- `usePokemonDetailQuery(props.id)`
- `usePokemonSpeciesQuery(props.id, ...)`

Those composables support reactive inputs (`MaybeRefOrGetter`), but a primitive snapshot is not reactive. When route params changed on the same route component instance, query keys did not update.

## Fix

Use a reactive getter for the route param and pass it through:

```ts
const pokemonId = computed(() => props.id)
usePokemonDetailQuery(pokemonId)
usePokemonSpeciesQuery(pokemonId, ...)
```

## Result

Evolution-chain clicks now navigate to the selected Pokemon's detail data, not the previous one.
