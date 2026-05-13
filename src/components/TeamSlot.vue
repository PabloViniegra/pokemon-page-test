<script setup lang="ts">
import { computed, watch, nextTick, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { getPokemonImageUrl } from '../helpers/pokemon-api'
import { TYPE_COLORS } from '../types/pokemon'

const props = defineProps<{
  id: number | null
  name: string | null
  types: string[]
  index: number
}>()

const emit = defineEmits<{
  add: [index: number]
  remove: [id: number]
}>()

const isEmpty = computed(() => props.id === null)

const imageUrl = computed(() => {
  if (props.id === null) return null
  return getPokemonImageUrl(props.id)
})

const typeColors = computed(() => {
  return props.types.map((t) => TYPE_COLORS[t]).filter(Boolean)
})

const filledContent = useTemplateRef<HTMLElement>('filledContent')
const emptyContent = useTemplateRef<HTMLElement>('emptyContent')

function animateIn(element: HTMLElement | null, isAdd: boolean) {
  if (!element) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  gsap.killTweensOf(element)

  if (isAdd) {
    gsap.from(element, {
      scale: 0.88,
      y: 18,
      autoAlpha: 0,
      duration: 0.22,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
    })
  } else {
    gsap.from(element, {
      scale: 0.95,
      autoAlpha: 0,
      duration: 0.14,
      ease: 'power2.out',
      clearProps: 'transform,opacity,visibility',
    })
  }
}

watch(
  () => props.id,
  async (newId) => {
    await nextTick()
    if (newId !== null) {
      animateIn(filledContent.value, true)
    } else {
      animateIn(emptyContent.value, false)
    }
  },
  { flush: 'post' },
)
</script>

<template>
  <button
    v-if="isEmpty"
    type="button"
    class="relative w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 cursor-pointer overflow-hidden transition-[background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
    @click="$emit('add', index)"
  >
    <div
      ref="emptyContent"
      class="flex flex-col items-center justify-center py-6 px-4 gap-2 min-h-[140px]"
    >
      <div
        class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <span class="text-xs font-semibold text-gray-600 uppercase tracking-wide"
        >Slot {{ index + 1 }}</span
      >
    </div>
  </button>

  <div
    v-else
    class="relative rounded-2xl border-2 border-gray-200 bg-white overflow-hidden transition-[box-shadow,transform,border-color] duration-200 hover:shadow-lg hover:-translate-y-1"
  >
    <div ref="filledContent" class="flex flex-col items-center py-4 px-3 gap-2 min-h-35">
      <button
        class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors z-10"
        aria-label="Remove Pokémon"
        @click.stop="$emit('remove', id!)"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <img
        :src="imageUrl!"
        :alt="name!"
        width="64"
        height="64"
        class="w-16 h-16 object-contain"
      />
      <p
        class="text-sm font-bold capitalize text-gray-800 text-center leading-tight"
      >
        {{ name }}
      </p>
      <div class="flex gap-1">
        <span
          v-for="(tc, i) in typeColors"
          :key="i"
          class="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
          :style="{ backgroundColor: tc.color }"
        >
          {{ types[i] }}
        </span>
      </div>
    </div>
  </div>
</template>
