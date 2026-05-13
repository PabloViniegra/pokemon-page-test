<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, shallowRef, watch } from 'vue'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRouter } from 'vue-router'
import {
  usePokemonDetailQuery,
  usePokemonSpeciesQuery,
  useEvolutionChainQuery,
} from '../composables/usePokemonQueries'
import { TYPE_COLORS } from '../types/pokemon'
import { updateSeoHead } from '../composables/useSeoHead'
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
const pokemonId = computed(() => props.id)

const { data: pokemon, isLoading, isError } = usePokemonDetailQuery(pokemonId)
const { data: species } = usePokemonSpeciesQuery(
  pokemonId,
  computed(() => pokemon.value?.species.url),
)
const { data: evolutionChain } = useEvolutionChainQuery(
  computed(() => species.value?.evolution_chain.url),
)

const primaryTypeColor = computed(() => {
  if (!pokemon.value?.types[0]) return '#A8A77A'
  return TYPE_COLORS[pokemon.value.types[0].type.name]?.color || '#A8A77A'
})

const deferredSectionsReady = ref(false)

window.scrollTo({ top: 0, behavior: 'instant' })

queueMicrotask(() => {
  deferredSectionsReady.value = true
})

watch(
  () => props.id,
  () => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    showShiny.value = false
    deferredSectionsReady.value = false
    queueMicrotask(() => {
      deferredSectionsReady.value = true
    })
  },
)

watch(
  () => [deferredSectionsReady.value, species.value, evolutionChain.value],
  async ([ready]) => {
    if (!ready) return
    await nextTick()
    ScrollTrigger.refresh()
  },
)

const IMAGE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

watch(
  pokemon,
  (p) => {
    if (!p) return

    const types = p.types.map((t) => t.type.name)
    const description = species.value?.flavor_text_entries.find(
      (e) => e.language.name === 'en',
    )?.flavor_text.replace(/\f/g, ' ')

    updateSeoHead({
      title: `${p.name.charAt(0).toUpperCase() + p.name.slice(1)} (#${p.id})`,
      description:
        description ||
        `Pokédex entry for ${p.name} (#${p.id}). Type: ${types.join('/')}. Height: ${p.height / 10}m, Weight: ${p.weight / 10}kg.`,
      canonicalPath: `/pokemon/${p.id}`,
      robots: 'index, follow',
      ogImage: `${IMAGE_BASE}/${p.id}.png`,
      jsonLd: {
        id: 'jsonld-product',
        data: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: `${p.name.charAt(0).toUpperCase() + p.name.slice(1)} (#${p.id})`,
          image: `${IMAGE_BASE}/${p.id}.png`,
          description:
            description ||
            `Pokédex entry for ${p.name}. Type: ${types.join('/')}.`,
          brand: { '@type': 'Brand', name: 'Pokémon' },
          url: `/pokemon/${p.id}`,
        },
      },
    })
  },
  { immediate: true },
)

onUnmounted(() => {
  updateSeoHead({
    title: 'Pokédex – Explore Every Pokémon',
    canonicalPath: '/',
  })
})
</script>

<template>
  <main id="main-content" class="app-page min-h-screen">
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
        Loading Pokémon data…
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
        :key="`hero-${pokemon.id}`"
        :pokemon="pokemon"
        :species="species"
        :show-shiny="showShiny"
        @update:show-shiny="showShiny = $event"
        @back="router.back()"
      />

      <PokemonStats
        :key="`stats-${pokemon.id}`"
        :stats="pokemon.stats"
        :accent-color="primaryTypeColor"
      />

      <PokemonAbilities
        :key="`abilities-${pokemon.id}`"
        :abilities="pokemon.abilities"
      />

      <PokemonSprites
        :key="`sprites-${pokemon.id}`"
        :sprites="pokemon.sprites"
        :pokemon-name="pokemon.name"
      />

      <div v-if="deferredSectionsReady">
        <PokemonMoves
          :key="`moves-${pokemon.id}`"
          :moves="pokemon.moves"
          :game-indices="pokemon.game_indices"
          :held-items="pokemon.held_items"
          :past-types="pokemon.past_types"
        />

        <PokemonSpeciesInfo
          v-if="species"
          :key="`species-${pokemon.id}`"
          :species="species"
        />

        <section
          v-if="evolutionChain"
          class="px-4 py-10 max-w-6xl mx-auto evolution-section"
        >
          <h2
            class="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3"
            style="font-family: 'Fredoka', sans-serif"
          >
            <span
              class="w-3 h-8 rounded-full"
              :style="{ backgroundColor: primaryTypeColor }"
            ></span>
            Evolution Chain
          </h2>
          <EvolutionTree
            :key="`evolution-${pokemon.id}`"
            :node="evolutionChain"
            :accent-color="primaryTypeColor"
            :current-pokemon-id="pokemon.id"
          />
        </section>
      </div>
    </template>
  </main>
</template>
