<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { GameStatus } from '../../composables/useWhoIsThatPokemonGame'

const props = defineProps<{
  status: GameStatus
  attempts: number
  hintUsed: boolean
  currentHint: string
  isSpeciesLoading: boolean
  choices: string[]
  correctName: string
}>()

const emit = defineEmits<{
  select: [name: string]
  next: []
  hint: []
}>()

const triedNames = ref<Set<string>>(new Set())
const nextButtonRef = ref<HTMLButtonElement | null>(null)

watch(
  () => props.status,
  (newStatus, oldStatus) => {
    if (newStatus === 'idle' && oldStatus !== 'idle') {
      triedNames.value.clear()
    }
    if (newStatus === 'correct') {
      nextTick(() => nextButtonRef.value?.focus())
    }
  },
)

function handleSelect(name: string) {
  if (props.status === 'correct') return
  triedNames.value.add(name)
  emit('select', name)
}

function isDisabled(name: string): boolean {
  if (props.status === 'correct') return true
  if (triedNames.value.has(name) && name !== props.correctName) return true
  return false
}

function choiceClass(name: string): string {
  if (props.status === 'correct' && name === props.correctName) {
    return 'bg-green-600 text-white border-green-600 shadow-lg scale-105 focus-visible:ring-green-300'
  }
  if (triedNames.value.has(name) && name !== props.correctName) {
    return 'bg-red-100 text-red-700 border-red-300 cursor-not-allowed focus-visible:ring-red-300'
  }
  return 'bg-white text-gray-900 border-gray-200 hover:border-gray-400 hover:shadow-md shadow-sm focus-visible:ring-blue-300'
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 mt-6">
    <div
      v-if="status !== 'correct'"
      role="group"
      aria-label="Answer choices"
      class="grid grid-cols-2 gap-3 w-full max-w-md"
    >
      <button
        v-for="name in choices"
        :key="name"
        :disabled="isDisabled(name)"
        class="relative px-4 py-4 rounded-2xl font-black text-lg capitalize transition-all duration-200 border-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2"
        :class="choiceClass(name)"
        @click="handleSelect(name)"
      >
        {{ name }}
      </button>
    </div>

    <div v-if="status === 'correct'" class="text-center">
      <p class="text-green-700 font-black text-2xl mb-2">Correct!</p>
      <p class="text-gray-600 font-medium text-sm mb-6">
        You got it in
        <span class="font-bold text-gray-900">{{ attempts }}</span>
        attempt{{ attempts === 1 ? '' : 's' }}.
      </p>
      <button
        ref="nextButtonRef"
        @click="emit('next')"
        class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
      >
        Next Pokémon
      </button>
    </div>

    <div v-else-if="status === 'incorrect'" class="text-center">
      <p class="text-red-600 font-black text-lg mb-2">Not quite!</p>
      <p class="text-gray-500 text-sm mb-4">
        Attempt <span class="font-bold text-gray-700">{{ attempts }}</span>
      </p>
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
        class="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
      >
        Give a hint
      </button>
      <p
        v-else
        class="text-amber-800 font-bold text-sm max-w-xs mx-auto bg-amber-50 rounded-xl px-4 py-3 border border-amber-200"
      >
        {{ currentHint }}
      </p>
    </div>
  </div>
</template>
