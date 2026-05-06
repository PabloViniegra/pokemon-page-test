# Vitest Coverage Gotchas

## 1. Public asset URLs in SFC templates can break Windows test resolution

`HomeView.vue` used a direct template URL of `/pokemon.svg`.

Under Vitest on Windows, that path was transformed into an invalid `file:///pokemon.svg` resolution during SFC processing. Binding the path from script setup instead of relying on the template transform avoided the issue:

```ts
const pokemonLogo = '/pokemon.svg'
```

```vue
<img :src="pokemonLogo" alt="Pokémon" />
```

## 2. Remove impossible defensive branches when the composable contract already guarantees the shape

`HomeView.vue` originally used:

```ts
if (selectedTypes.value.length > 0) return typeResults.value || []
```

`usePokemonMultiTypeQuery()` always returns an array-like query result, so the fallback was not needed in real runtime behavior. Removing that dead fallback simplified the code and eliminated an otherwise artificial coverage branch.

## 3. Router/store sync guards are easiest to verify with synchronous watcher mocks

The `filters.ts` store has two re-entrancy guards:

- `syncingFromUrl` to block writes while reading query params
- `syncingToUrl` to block reads while pushing query params

The normal async watcher timing makes these guard branches hard to hit directly. A dedicated test that imports the store under a mocked synchronous `watch()` implementation makes those branches observable without changing production behavior.
