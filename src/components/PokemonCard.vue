<script setup lang="ts">
import { useFavoritesStore } from '../stores/favorites'

const props = defineProps<{
  name: string
  url: string
  imageUrl: string
  paddedId: string
  isFavorited: boolean
  accentColor: string | null
}>()

interface PokemonCardSummaryTrigger {
  name: string
  id: number
  accentColor: string | null
  anchorEl: HTMLElement
}

const emit = defineEmits<{
  select: [name: string]
  hover: [name: string]
  summaryEnter: [payload: PokemonCardSummaryTrigger]
  summaryLeave: []
}>()

const favoritesStore = useFavoritesStore()
const pokemonId = Number.parseInt(props.paddedId, 10)

function handleSummaryEnter(event: MouseEvent) {
  const anchorEl = event.currentTarget

  if (!(anchorEl instanceof HTMLElement)) {
    return
  }

  emit('hover', props.name)
  emit('summaryEnter', {
    name: props.name,
    id: pokemonId,
    accentColor: props.accentColor,
    anchorEl,
  })
}
</script>

<template>
  <router-link
    :to="{ name: 'pokemon-detail', params: { id: name } }"
    class="pokemon-card group relative bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-gray-100 block text-inherit no-underline"
    :class="accentColor ? 'hover:border-gray-200' : 'hover:border-gray-200'"
    @click="emit('select', name)"
    @mouseenter="handleSummaryEnter"
    @mouseleave="emit('summaryLeave')"
  >
    <div
      v-if="accentColor"
      class="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300"
      :style="{ backgroundColor: accentColor }"
    ></div>

    <div
      class="pokemon-card__art relative aspect-square p-4 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100/50"
    >
      <img
        :src="imageUrl"
        :alt="`${name} Pokémon`"
        class="w-24 h-24 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
        :loading="parseInt(paddedId) <= 20 ? 'eager' : 'lazy'"
        decoding="async"
      />
      <span class="absolute top-3 right-3 text-[10px] font-bold text-gray-300">
        #{{ paddedId }}
      </span>
      <button
        @click.stop="favoritesStore.toggleFavorite(parseInt(paddedId))"
        class="fav-btn absolute top-3 left-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all duration-200 hover:scale-115 active:scale-90"
        :class="
          isFavorited ? 'fav-btn--active' : 'text-gray-300 hover:text-red-400'
        "
        :aria-label="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
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

    <div class="p-3 text-center border-t border-gray-100">
      <p
        class="text-gray-800 font-bold capitalize text-sm tracking-wide group-hover:text-blue-600 transition-colors"
      >
        {{ name }}
      </p>
    </div>
  </router-link>
</template>

<style scoped>
.fav-heart {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fav-heart--active {
  fill: #ef4444;
  stroke: #ef4444;
  animation: heart-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fav-btn--active {
  color: #ef4444;
  background: rgba(254, 242, 242, 0.95);
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
