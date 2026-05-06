<script setup lang="ts">
import type { GameStatus } from '../../composables/useWhoIsThatPokemonGame'

defineProps<{
  status: GameStatus
  attempts: number
}>()

const emit = defineEmits<{
  guess: []
  next: []
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-4 mt-6">
    <div v-if="status === 'idle'" class="text-center">
      <p class="text-gray-500 text-sm font-medium mb-4">
        Can you guess who this Pokémon is?
      </p>
      <button
        @click="emit('guess')"
        class="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
      >
        Guess
      </button>
    </div>

    <div v-else-if="status === 'incorrect'" class="text-center">
      <p class="text-red-600 font-bold text-lg mb-2">Try again!</p>
      <p class="text-gray-500 text-sm mb-4">
        Attempts: <span class="font-bold text-gray-700">{{ attempts }}</span>
      </p>
      <button
        @click="emit('guess')"
        class="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
      >
        Guess Again
      </button>
    </div>

    <div v-else-if="status === 'correct'" class="text-center">
      <p class="text-green-600 font-bold text-xl mb-2">Correct!</p>
      <p class="text-gray-500 text-sm mb-6">
        You got it in
        <span class="font-bold text-gray-700">{{ attempts }}</span>
        attempt{{ attempts === 1 ? '' : 's' }}.
      </p>
      <button
        @click="emit('next')"
        class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
      >
        Next Pokémon
      </button>
    </div>
  </div>
</template>
