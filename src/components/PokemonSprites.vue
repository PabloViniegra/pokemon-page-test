<script setup lang="ts">
import type { PokemonSprites } from '../types/pokemon'

defineProps<{
    sprites: PokemonSprites
    pokemonName: string
}>()
</script>

<template>
  <section class="px-4 py-10 max-w-6xl mx-auto">
    <h2 class="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3" style="font-family: 'Fredoka', sans-serif;">
      <span class="w-3 h-8 rounded-full bg-yellow-400"></span>
      Sprites
    </h2>
    <div class="flex gap-4 overflow-x-auto pb-2">
      <div v-if="sprites.front_default" class="flex flex-col items-center gap-2 shrink-0">
        <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <img :src="sprites.front_default" :alt="pokemonName + ' front'" class="w-24 h-24 object-contain pixelated" />
        </div>
        <span class="text-gray-400 text-xs font-medium">Front</span>
      </div>
      <div v-if="sprites.back_default" class="flex flex-col items-center gap-2 shrink-0">
        <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <img :src="sprites.back_default" :alt="pokemonName + ' back'" class="w-24 h-24 object-contain pixelated" />
        </div>
        <span class="text-gray-400 text-xs font-medium">Back</span>
      </div>
      <div v-if="sprites.front_shiny" class="flex flex-col items-center gap-2 shrink-0">
        <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <img :src="sprites.front_shiny" :alt="pokemonName + ' front shiny'" class="w-24 h-24 object-contain pixelated" />
        </div>
        <span class="text-gray-400 text-xs font-medium">Front Shiny</span>
      </div>
      <div v-if="sprites.back_shiny" class="flex flex-col items-center gap-2 shrink-0">
        <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <img :src="sprites.back_shiny" :alt="pokemonName + ' back shiny'" class="w-24 h-24 object-contain pixelated" />
        </div>
        <span class="text-gray-400 text-xs font-medium">Back Shiny</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pixelated {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
