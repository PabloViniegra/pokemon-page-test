<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { shallowRef } from 'vue'
import {
  usePokemonDetailQuery,
  usePokemonSpeciesQuery,
  useEvolutionChainQuery,
} from '../composables/usePokemonQueries'
import { TYPE_COLORS } from '../types/pokemon'
import PokemonHero from '../components/PokemonHero.vue'
import PokemonStats from '../components/PokemonStats.vue'
import PokemonAbilities from '../components/PokemonAbilities.vue'
import PokemonSprites from '../components/PokemonSprites.vue'
import PokemonMoves from '../components/PokemonMoves.vue'
import PokemonSpeciesInfo from '../components/PokemonSpeciesInfo.vue'
import EvolutionTree from '../components/EvolutionTree.vue'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const showShiny = shallowRef(false)

const { data: pokemon, isLoading, isError } = usePokemonDetailQuery(props.id)
const { data: species } = usePokemonSpeciesQuery(
  props.id,
  computed(() => pokemon.value?.species.url),
)
const { data: evolutionChain } = useEvolutionChainQuery(
  computed(() => species.value?.evolution_chain.url),
)

const primaryTypeColor = computed(() => {
  if (!pokemon.value?.types[0]) return '#A8A77A'
  return TYPE_COLORS[pokemon.value.types[0].type.name]?.color || '#A8A77A'
})
</script>

<template>
  <main class="app-page min-h-screen">
    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center min-h-screen gap-6"
    >
      <div class="relative w-24 h-24">
        <div
          class="absolute inset-0 border-4 border-gray-200 rounded-full"
        ></div>
        <div
          class="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
        ></div>
        <div
          class="absolute inset-3 border-4 border-transparent border-b-red-500 rounded-full animate-spin"
          style="animation-direction: reverse; animation-duration: 1.5s"
        ></div>
      </div>
      <p class="text-gray-500 font-semibold animate-pulse">
        Loading Pokémon data...
      </p>
    </div>

    <div
      v-else-if="isError"
      class="flex flex-col items-center justify-center min-h-screen gap-4"
    >
      <div class="text-6xl">⚠️</div>
      <p class="text-red-600 font-bold text-lg">Couldn't load this Pokémon</p>
      <p class="text-gray-500 font-medium text-sm">
        It might not exist, or there was a network problem.
      </p>
      <button
        @click="router.back()"
        class="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
      >
        ← Back to Pokédex
      </button>
    </div>

    <template v-else-if="pokemon">
      <PokemonHero
        :pokemon="pokemon"
        :species="species"
        :show-shiny="showShiny"
        @update:show-shiny="showShiny = $event"
        @back="router.back()"
      />

      <PokemonStats :stats="pokemon.stats" :accent-color="primaryTypeColor" />

      <PokemonAbilities :abilities="pokemon.abilities" />

      <PokemonSprites :sprites="pokemon.sprites" :pokemon-name="pokemon.name" />

      <PokemonMoves
        :moves="pokemon.moves"
        :game-indices="pokemon.game_indices"
        :held-items="pokemon.held_items"
        :past-types="pokemon.past_types"
      />

      <PokemonSpeciesInfo v-if="species" :species="species" />

      <section
        v-if="evolutionChain"
        class="px-4 sm:px-8 py-8 max-w-5xl mx-auto w-full"
      >
        <h2
          class="text-xl sm:text-2xl font-bold mb-6 text-center"
          :style="{ color: primaryTypeColor }"
        >
          Evolution Chain
        </h2>
        <EvolutionTree
            v-if="evolutionChain"
            :node="evolutionChain"
            :accent-color="primaryTypeColor"
          />
      </section>
    </template>
  </main>
</template>
