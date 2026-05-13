<script setup lang="ts">
import { ref, watch, nextTick, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
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
const successRef = ref<HTMLDivElement | null>(null)
const incorrectRef = ref<HTMLDivElement | null>(null)
const hintAreaRef = ref<HTMLDivElement | null>(null)

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function isReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION).matches
}

const buttonRefs = useTemplateRef<HTMLButtonElement[]>('choice-btn')

watch(
  () => props.status,
  (newStatus, oldStatus) => {
    if (newStatus === 'idle' && oldStatus !== 'idle') {
      triedNames.value.clear()
    }
    if (newStatus === 'correct') {
      nextTick(() => nextButtonRef.value?.focus())
      if (!isReducedMotion()) {
        animateSuccessEntrance()
      }
    }
    if (newStatus === 'incorrect' && oldStatus !== 'incorrect') {
      if (!isReducedMotion()) {
        animateIncorrectEntrance()
      }
    }
  },
)

watch(
  () => props.hintUsed,
  (used) => {
    if (used) {
      if (!isReducedMotion()) {
        animateHintReveal()
      }
    }
  },
)

function animateSuccessEntrance() {
  if (!successRef.value) return
  gsap.killTweensOf(successRef.value)
  const tl = gsap.timeline()
  tl.fromTo(
    successRef.value,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' },
  )
}

function animateIncorrectEntrance() {
  if (!incorrectRef.value) return
  gsap.killTweensOf(incorrectRef.value)
  gsap.fromTo(
    incorrectRef.value,
    { opacity: 0, y: -6 },
    { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' },
  )
}

function animateHintReveal() {
  if (!hintAreaRef.value) return
  gsap.killTweensOf(hintAreaRef.value)
  gsap.fromTo(
    hintAreaRef.value,
    { opacity: 0, y: -4 },
    { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' },
  )
}

function animateWrongPress(el: HTMLButtonElement) {
  if (isReducedMotion()) return
  gsap.killTweensOf(el)
  gsap.fromTo(
    el,
    { scale: 1 },
    {
      scale: 0.93,
      duration: 0.1,
      ease: 'power2.in',
      yoyo: true,
      repeat: 1,
    },
  )
}

function handleSelect(name: string) {
  if (props.status === 'correct') return
  const isWrong = name !== props.correctName
  triedNames.value.add(name)

  if (isWrong && buttonRefs.value) {
    const btn = buttonRefs.value.find((b) => b?.textContent?.trim() === name)
    if (btn) {
      animateWrongPress(btn)
    }
  }

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
        :ref="(el) => {
          if (!buttonRefs) return
          const arr = buttonRefs as unknown as HTMLButtonElement[]
          const idx = arr.indexOf(el as HTMLButtonElement)
          if (idx === -1) arr.push(el as HTMLButtonElement)
        }"
        :disabled="isDisabled(name)"
        class="relative px-4 py-4 rounded-2xl font-black text-lg capitalize transition-[transform,box-shadow,background-color,border-color,color] duration-200 border-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2"
        :class="choiceClass(name)"
        @click="handleSelect(name)"
      >
        {{ name }}
      </button>
    </div>

    <div v-if="status === 'correct'" ref="successRef" class="text-center">
      <p class="text-green-700 font-black text-2xl mb-2">Correct!</p>
      <p class="text-gray-600 font-medium text-sm mb-6">
        You got it in
        <span class="font-bold text-gray-900">{{ attempts }}</span>
        attempt{{ attempts === 1 ? '' : 's' }}.
      </p>
      <button
        ref="nextButtonRef"
        @click="emit('next')"
        class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-[transform,box-shadow,background-color] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
      >
        Next Pokémon
      </button>
    </div>

    <div v-else-if="status === 'incorrect'" ref="incorrectRef" class="text-center">
      <p class="text-red-600 font-black text-lg mb-2">Not quite!</p>
      <p class="text-gray-500 text-sm mb-4">
        Attempt <span class="font-bold text-gray-700">{{ attempts }}</span>
      </p>
    </div>

    <div
      v-if="status !== 'correct'"
      ref="hintAreaRef"
      class="text-center mt-2"
      aria-live="polite"
    >
      <button
        v-if="!hintUsed"
        @click="emit('hint')"
        :disabled="isSpeciesLoading"
        class="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-[transform,box-shadow,background-color] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
      >
        Give a hint
      </button>
      <p
        v-else
        ref="hintTextRef"
        class="text-amber-800 font-bold text-sm max-w-xs mx-auto bg-amber-50 rounded-xl px-4 py-3 border border-amber-200"
      >
        {{ currentHint }}
      </p>
    </div>
  </div>
</template>
