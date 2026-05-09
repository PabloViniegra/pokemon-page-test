<script setup lang="ts">
import type { PokemonCardDisplay } from '../types/pokemon'
import PokemonCard from './PokemonCard.vue'
import { ref, onMounted } from 'vue'

defineProps<{
  pokemons: PokemonCardDisplay[]
  animate?: boolean
}>()

defineEmits<{
  select: [name: string]
  hover: [name: string]
}>()

const hasMounted = ref(false)
onMounted(() => {
  hasMounted.value = true
})
</script>

<template>
  <div
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
  >
    <PokemonCard
      v-for="(pokemon, index) in pokemons"
      :key="pokemon.name"
      :name="pokemon.name"
      :url="pokemon.url"
      :imageUrl="pokemon.imageUrl"
      :paddedId="pokemon.paddedId"
      :isFavorited="pokemon.isFavorited"
      :accentColor="pokemon.accentColor"
      :class="{ 'animate-fade-in-up': animate && !hasMounted }"
      :style="
        animate && !hasMounted ? { animationDelay: `${index * 30}ms` } : {}
      "
      @select="$emit('select', $event)"
      @hover="$emit('hover', $event)"
    />
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
  opacity: 0;
}
</style>