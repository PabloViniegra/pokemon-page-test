<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'
import { useWhoIsThatPokemonGame } from '../composables/useWhoIsThatPokemonGame'
import { useGameStatsStore } from '../stores/gameStats'
import { useAllPokemonListQuery } from '../composables/usePokemonQueries'
import { TYPE_COLORS } from '../types/pokemon'
import PokemonSilhouette from '../components/game/PokemonSilhouette.vue'
import GameControls from '../components/game/GameControls.vue'
import PokeBallLoader from '../components/PokeBallLoader.vue'

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
const { data: allListData } = useAllPokemonListQuery(computed(() => true))

const boardRef = ref<HTMLDivElement | null>(null)
const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

const allPokemon = computed(() => allListData.value?.results ?? [])

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const choices = computed(() => {
  if (!currentPokemon.value || allPokemon.value.length === 0) return []
  const correct = currentPokemon.value.name
  const others = allPokemon.value.filter((p) => p.name !== correct)
  const distractors: string[] = []
  while (distractors.length < 3 && others.length > 0) {
    const idx = Math.floor(Math.random() * others.length)
    const pick = others.splice(idx, 1)[0]
    if (pick && !distractors.includes(pick.name)) {
      distractors.push(pick.name)
    }
  }
  return shuffle([correct, ...distractors])
})

const primaryTypeColor = computed(() => {
  const type = currentPokemon.value?.types[0]?.type.name
  return type ? TYPE_COLORS[type]?.color : undefined
})

const boardStyle = computed(() => {
  if (!primaryTypeColor.value) return {}
  return {
    borderColor: primaryTypeColor.value,
    backgroundColor: `${primaryTypeColor.value}14`,
  }
})

const accuracy = computed(() => {
  if (stats.totalRoundsPlayed === 0) return 0
  return Math.round((stats.totalCorrectGuesses / stats.totalRoundsPlayed) * 100)
})

watch(status, (newStatus, oldStatus) => {
  if (newStatus === 'correct' && oldStatus !== 'correct') {
    stats.recordRound(true, attempts.value)
    if (!prefersReducedMotion) {
      nextTick(() => {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        })
        if (boardRef.value) {
          gsap.killTweensOf(boardRef.value)
          gsap.fromTo(
            boardRef.value,
            { boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' },
            {
              boxShadow: `0 20px 60px ${primaryTypeColor.value ?? '#000000'}50`,
              duration: 0.3,
              ease: 'power2.out',
              yoyo: true,
              repeat: 1,
            },
          )
        }
      })
    }
  }
  if (newStatus === 'incorrect' && oldStatus !== 'incorrect') {
    if (!prefersReducedMotion && boardRef.value) {
      gsap.killTweensOf(boardRef.value)
      gsap.fromTo(
        boardRef.value,
        { x: 0 },
        {
          x: -6,
          duration: 0.09,
          ease: 'power2.in',
          yoyo: true,
          repeat: 3,
        },
      )
    }
  }
})

function handleGuess(name: string) {
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
  <main id="main-content" class="app-page max-w-2xl mx-auto px-4 py-6 sm:py-10">
    <div class="text-center mb-6 sm:mb-10">
      <h1
        class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-2"
        style="font-family: 'Fredoka', sans-serif"
      >
        Who's that Pokémon?
      </h1>
      <p class="text-gray-500 font-medium text-lg">
        Pick the right Pokémon from the choices below!
      </p>
    </div>

    <div
      ref="boardRef"
      class="game-board rounded-3xl border-4 shadow-2xl p-4 sm:p-6 md:p-10 transition-colors duration-500"
      :style="boardStyle"
    >
      <div v-if="isLoading" class="flex flex-col items-center py-16 gap-4">
        <PokeBallLoader size="md" label="Preparing next challenger…" />
      </div>

      <div v-else-if="isError" class="text-center py-16">
        <p class="text-red-600 font-black text-2xl mb-2">Connection lost</p>
        <p class="text-gray-600 mb-6">
          We couldn't load the next Pokémon. Please try again.
        </p>
        <button
          @click="nextRound"
          class="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>

      <template v-else-if="currentPokemon">
        <div class="text-center mb-4">
          <span
            v-if="isRevealed"
            class="inline-block px-4 py-1.5 bg-white/80 backdrop-blur rounded-full text-lg font-black text-gray-900 capitalize shadow-sm"
          >
            {{ currentPokemon.name }}
          </span>
          <span v-else class="text-lg font-black text-gray-300 tracking-widest uppercase">???</span>
        </div>

        <PokemonSilhouette
          :pokemon-id="targetId"
          :revealed="isRevealed"
          :shake="status === 'incorrect'"
          :type-color="primaryTypeColor"
        />

        <GameControls
          :status="status"
          :attempts="attempts"
          :hint-used="hintUsed"
          :current-hint="currentHint"
          :is-species-loading="isSpeciesLoading"
          :choices="choices"
          :correct-name="currentPokemon.name"
          @select="handleGuess"
          @next="handleNext"
          @hint="handleHint"
        />
      </template>
    </div>

    <div class="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm font-bold">
      <div class="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow border border-gray-100">
        <span class="text-gray-400">Streak</span>
        <span class="text-red-600 text-lg">{{ stats.currentStreak }}</span>
      </div>
      <div class="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow border border-gray-100">
        <span class="text-gray-400">Best</span>
        <span class="text-gray-900 text-lg">{{ stats.bestStreak }}</span>
      </div>
      <div class="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow border border-gray-100">
        <span class="text-gray-400">Accuracy</span>
        <span class="text-gray-900 text-lg">{{ accuracy }}%</span>
      </div>
    </div>
  </main>
</template>
