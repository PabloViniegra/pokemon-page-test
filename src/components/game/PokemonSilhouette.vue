<script setup lang="ts">
import { getPokemonImageUrl } from '../../helpers/pokemon-api'

const props = defineProps<{
  pokemonId: number
  revealed: boolean
  shake: boolean
}>()
</script>

<template>
  <div
    class="relative w-full aspect-square max-w-xs mx-auto flex items-center justify-center"
    :class="{ shake: shake }"
  >
    <img
      :src="getPokemonImageUrl(props.pokemonId)"
      alt="Mystery Pokémon"
      class="w-full h-full object-contain transition-all duration-700 ease-out"
      :class="revealed ? 'brightness-100 drop-shadow-xl' : 'brightness-0'"
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
