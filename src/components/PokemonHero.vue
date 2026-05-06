<script setup lang="ts">
import type { PokemonDetail, PokemonSpeciesInfo } from '../types/pokemon'
import { getPokemonImageUrl } from '../helpers/pokemon-api'
import PokemonTypeBadge from './PokemonTypeBadge.vue'
import { TYPE_COLORS } from '../types/pokemon'
import { computed } from 'vue'
import { useFavoritesStore } from '../stores/favorites'

const props = defineProps<{
  pokemon: PokemonDetail
  species: PokemonSpeciesInfo | undefined
  showShiny: boolean
}>()

defineEmits<{
  'update:showShiny': [value: boolean]
  back: []
}>()

const favoritesStore = useFavoritesStore()
const isFavorited = computed(() => favoritesStore.isFavorite(props.pokemon.id))

const mainImage = computed(() =>
  getPokemonImageUrl(props.pokemon.id, props.showShiny),
)

const description = computed(() => {
  if (!props.species) return ''
  const entry = props.species.flavor_text_entries.find(
    (e) => e.language.name === 'en',
  )
  return entry ? entry.flavor_text.replace(/\f/g, ' ') : ''
})

const genus = computed(() => {
  if (!props.species) return ''
  const g = props.species.genera.find((g) => g.language.name === 'en')
  return g ? g.genus : ''
})

const primaryTypeColor = computed(() => {
  if (!props.pokemon.types[0]) return '#A8A77A'
  return TYPE_COLORS[props.pokemon.types[0].type.name]?.color || '#A8A77A'
})
</script>

<template>
  <section
    class="relative overflow-hidden"
    :style="{
      background: `linear-gradient(135deg, ${primaryTypeColor}15 0%, ${primaryTypeColor}05 50%, transparent 100%)`,
    }"
  >
    <div
      class="absolute right-0 top-0 w-96 h-96 opacity-5 transform translate-x-1/4 -translate-y-1/4"
    >
      <svg viewBox="0 0 100 100" class="w-full h-full">
        <circle cx="50" cy="50" r="50" fill="#333" />
        <path d="M0 50 Q50 20 100 50" fill="#f00" />
        <path d="M0 50 Q50 80 100 50" fill="white" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#333" stroke-width="8" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="#333" stroke-width="8" />
        <circle
          cx="50"
          cy="50"
          r="12"
          fill="white"
          stroke="#333"
          stroke-width="4"
        />
      </svg>
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-4 py-12">
      <button
        @click="$emit('back')"
        class="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold text-sm group"
      >
        <span class="group-hover:-translate-x-1 transition-transform">←</span>
        Back to Pokédex
      </button>

      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div class="relative flex flex-col items-center">
          <div class="relative w-72 h-72 md:w-96 md:h-96">
            <div
              class="absolute inset-0 rounded-full opacity-20 blur-3xl"
              :style="{ backgroundColor: primaryTypeColor }"
            ></div>
            <img
              :src="mainImage"
              :alt="pokemon.name"
              class="relative w-full h-full object-contain drop-shadow-xl animate-float"
            />
          </div>

          <button
            @click="$emit('update:showShiny', !showShiny)"
            class="mt-6 px-5 py-2 rounded-full border-2 border-gray-200 bg-white hover:bg-gray-100 transition-all font-bold text-sm flex items-center gap-2 shadow-sm"
            :class="{
              'border-yellow-400 text-yellow-600 bg-yellow-50': showShiny,
            }"
          >
            <span>✨</span>
            {{ showShiny ? 'Shiny' : 'Normal' }}
          </button>
        </div>

        <div class="space-y-6">
          <div>
            <p class="text-gray-600 font-bold text-sm mb-1">
              #{{ String(pokemon.id).padStart(4, '0') }}
            </p>
            <div class="flex items-center gap-3">
              <h1
                class="text-5xl md:text-6xl font-black capitalize tracking-tight text-gray-900"
                style="font-family: 'Fredoka', sans-serif"
              >
                {{ pokemon.name }}
              </h1>
              <button
                @click="favoritesStore.toggleFavorite(pokemon.id)"
                class="fav-hero-btn flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 bg-white transition-all duration-300 shadow-sm hover:shadow-md mt-1"
                :class="
                  isFavorited
                    ? 'border-red-300 text-red-500 bg-red-50/80 hover:border-red-400'
                    : 'border-gray-200 text-gray-300 hover:border-red-300 hover:text-red-400'
                "
                :aria-label="
                  isFavorited ? 'Remove from favorites' : 'Add to favorites'
                "
              >
                <svg
                  class="w-5 h-5 fav-heart"
                  :class="{ 'fav-heart--active': isFavorited }"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  />
                </svg>
              </button>
            </div>
            <p v-if="genus" class="text-gray-500 font-medium mt-2">
              {{ genus }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <PokemonTypeBadge
              v-for="t in pokemon.types"
              :key="t.type.name"
              :pokemon-type="t.type.name"
            />
          </div>

          <p v-if="description" class="text-gray-600 leading-relaxed text-lg">
            {{ description }}
          </p>

          <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="text-gray-600 font-bold">Height</span>
              <span class="font-black text-gray-900 font-mono"
                >{{ pokemon.height / 10
                }}<span class="text-gray-600 font-medium ml-0.5">m</span></span
              >
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-600 font-bold">Weight</span>
              <span class="font-black text-gray-900 font-mono"
                >{{ pokemon.weight / 10
                }}<span class="text-gray-600 font-medium ml-0.5">kg</span></span
              >
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-600 font-bold">Base XP</span>
              <span class="font-black text-gray-900 font-mono">{{
                pokemon.base_experience
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}
.animate-float {
  animation: float 3s ease-in-out infinite;
}

.fav-heart {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fav-heart--active {
  fill: #ef4444;
  stroke: #ef4444;
  animation: heart-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes heart-pop {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.35);
  }
  60% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}
</style>
