# Evolution Tree Design

## Summary
Add a Pokémon family tree (evolution chain) to the DetailView, showing previous evolutions and possible future evolutions as a visual tree/graph using data from the PokeAPI.

## Architecture

### Data Flow
1. `DetailView` fetches `species` via `usePokemonSpeciesQuery`.
2. The species response contains `evolution_chain.url`.
3. A new `useEvolutionChainQuery(url)` fetches the raw PokeAPI evolution chain.
4. A parser converts the nested PokeAPI `chain` object into a clean `EvolutionNode[]` tree.
5. `EvolutionTree.vue` recursively renders the tree.

### Types
- `EvolutionChainRaw`: PokeAPI raw response shape.
- `EvolutionNode`: parsed tree node with `speciesName`, `speciesId`, `imageUrl`, `evolutionDetails` (trigger, minLevel, item, etc.), and `evolvesTo: EvolutionNode[]`.

### API
- `getEvolutionChain(url: string)` in `pokemon-api.ts`.
- `parseEvolutionChain(chain)` in `pokemon-api.ts` (pure function).
- `useEvolutionChainQuery(url: MaybeRefOrGetter<string>)` in `usePokemonQueries.ts`.

### Components
- `EvolutionTree.vue`: root container, recursively renders children.
- `EvolutionNode.vue`: single node card (sprite image, name, evolution condition).

### Layout
- Vertical tree: root at top, children below.
- Each parent → child connection rendered with a vertical line and a small arrow/branch marker.
- For branching evolutions (e.g., Eevee), children are laid out horizontally in a flex row.
- Nodes are clickable and navigate to that Pokémon's detail page.

### Styling
- Uses Tailwind CSS only.
- Colors adapt to the Pokémon's primary type (passed as prop from DetailView).
- Responsive: horizontal scroll on very wide trees (Eevee).

### Testing
- Unit test `parseEvolutionChain` with mocked linear and branching chains.
- Unit test `EvolutionTree.vue` rendering with `@vue/test-utils` using mocked node trees.
- No new test framework dependencies; uses existing Vitest + `@vue/test-utils`.

## Decisions
- **No external graph library**: The evolution chain is small (max depth ~3, max width ~8). A custom recursive Vue component with CSS is simpler, lighter, and sufficient.
- **Parser in `pokemon-api.ts`**: Keeps data shaping close to the API layer, making the component purely presentational.
