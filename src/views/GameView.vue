<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import confetti from 'canvas-confetti'
import { useWhoIsThatPokemonGame } from '../composables/useWhoIsThatPokemonGame'
import { useGameStatsStore } from '../stores/gameStats'
import PokemonSilhouette from '../components/game/PokemonSilhouette.vue'
import GameControls from '../components/game/GameControls.vue'
import PokemonSelectorModal from '../components/PokemonSelectorModal.vue'

const {
  targetId,
  status,
  attempts,
  currentPokemon,
  isLoading,
  isError,
  isRevealed,
  currentHint,
  hintUsed,
  isSpeciesLoading,
  makeGuess,
  useHint,
  nextRound,
} = useWhoIsThatPokemonGame()

const stats = useGameStatsStore()
const showModal = ref(false)
const shakeSilhouette = ref(false)

watch(status, (newStatus, oldStatus) => {
  if (newStatus === 'correct' && oldStatus !== 'correct') {
    stats.recordRound(true, attempts.value)
    nextTick(() => {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      })
    })
  }
  if (newStatus === 'incorrect') {
    shakeSilhouette.value = true
    setTimeout(() => {
      shakeSilhouette.value = false
    }, 450)
  }
})

function handleGuess(name: string) {
  showModal.value = false
  makeGuess(name)
}

function handleNext() {
  nextRound()
}

function handleHint() {
  useHint()
}
</script>

<template>
  <div class="app-page max-w-2xl mx-auto px-4 py-6 sm:py-10">
    <div class="text-center mb-6 sm:mb-10">
      <h1
        class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-2"
        style="font-family: 'Fredoka', sans-serif"
      >
        Who's that Pokémon?
      </h1>
      <p class="text-gray-500 font-medium">
        Look at the silhouette and guess the Pokémon!
      </p>
    </div>

    <div class="game-stage rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-10">
      <div v-if="isLoading" class="flex flex-col items-center py-16 gap-4">
        <div class="relative w-12 h-12">
          <div class="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div
            class="absolute inset-0 border-4 border-transparent border-t-red-500 rounded-full animate-spin"
          ></div>
        </div>
        <p class="text-gray-500 font-medium">Loading Pokémon...</p>
      </div>

      <div v-else-if="isError" class="text-center py-16">
        <p class="text-red-600 font-bold text-lg mb-2">Oops!</p>
        <p class="text-gray-500 mb-6">
          Something went wrong while loading the Pokémon.
        </p>
        <button
          @click="nextRound"
          class="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>

      <template v-else-if="currentPokemon">
        <div class="text-center mb-2">
          <span
            v-if="isRevealed"
            class="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-bold text-gray-700 capitalize"
          >
            {{ currentPokemon.name }}
          </span>
          <span v-else class="text-sm font-bold text-gray-300">???</span>
        </div>

        <PokemonSilhouette
          :pokemon-id="targetId"
          :revealed="isRevealed"
          :shake="shakeSilhouette"
        />

        <GameControls
          :status="status"
          :attempts="attempts"
          :hint-used="hintUsed"
          :current-hint="currentHint"
          :is-species-loading="isSpeciesLoading"
          @guess="showModal = true"
          @next="handleNext"
          @hint="handleHint"
        />
      </template>
    </div>

    <div class="mt-6 sm:mt-8 grid grid-cols-3 sm:flex sm:items-center sm:justify-center gap-3 sm:gap-6 text-sm text-gray-400 font-medium">
      <div class="text-center sm:text-left">Rounds: <span class="text-gray-700 font-bold">{{ stats.totalRoundsPlayed }}</span></div>
      <div class="text-center sm:text-left">Correct: <span class="text-gray-700 font-bold">{{ stats.totalCorrectGuesses }}</span></div>
      <div class="text-center sm:text-left">Accuracy: <span class="text-gray-700 font-bold">
        {{ stats.totalRoundsPlayed > 0 ? Math.round((stats.totalCorrectGuesses / stats.totalRoundsPlayed) * 100) : 0 }}%
      </span></div>
    </div>
  </div>

  <PokemonSelectorModal
    :open="showModal"
    :exclude-ids="[]"
    @select="(_id, name) => handleGuess(name)"
    @close="showModal = false"
  />
</template>
