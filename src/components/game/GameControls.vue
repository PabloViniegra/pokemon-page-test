<script setup lang="ts">
import type { GameStatus } from '../../composables/useWhoIsThatPokemonGame'

defineProps<{
  status: GameStatus
  attempts: number
  hintUsed: boolean
  currentHint: string
  isSpeciesLoading: boolean
}>()

const emit = defineEmits<{
  guess: []
  next: []
  hint: []
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

    <div
      v-if="status !== 'correct'"
      class="text-center mt-2"
      aria-live="polite"
    >
      <button
        v-if="!hintUsed"
        @click="emit('hint')"
        :disabled="isSpeciesLoading"
        class="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
      >
        Give a hint
      </button>
      <p
        v-else
        class="text-amber-700 font-medium text-sm max-w-xs mx-auto"
      >
        {{ currentHint }}
      </p>
    </div>
  </div>
</template>
