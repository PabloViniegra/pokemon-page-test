<script setup lang="ts">
import { getPokemonImageUrl } from '../../helpers/pokemon-api'

const props = defineProps<{
  pokemonId: number
  revealed: boolean
  shake: boolean
  typeColor?: string
}>()
</script>

<template>
  <div
    class="relative w-full aspect-square max-w-sm mx-auto flex items-center justify-center"
    :class="{ shake: shake }"
  >
    <div
      class="absolute inset-0 rounded-3xl border-4 transition-colors duration-700"
      :style="typeColor ? { borderColor: typeColor } : undefined"
      :class="revealed ? 'opacity-100' : 'opacity-40'"
    ></div>
    <img
      :src="getPokemonImageUrl(props.pokemonId)"
      alt="Mystery Pokémon"
      class="w-full h-full object-contain transition-all duration-700 ease-out p-4"
      :class="revealed ? 'brightness-100 drop-shadow-2xl scale-105' : 'brightness-0'"
      draggable="false"
    />
  </div>
</template>

<style scoped>
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-8px);
  }
  40% {
    transform: translateX(8px);
  }
  60% {
    transform: translateX(-6px);
  }
  80% {
    transform: translateX(6px);
  }
}

.shake {
  animation: shake 0.4s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .shake {
    animation: none;
  }
  img {
    transition: none;
  }
}
</style>
