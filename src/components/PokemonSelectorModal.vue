<script setup lang="ts">
import { ref, computed, watch, nextTick, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { useAllPokemonListQuery } from '../composables/usePokemonQueries'
import { getPokemonId, getPokemonSpriteUrl } from '../helpers/pokemon-api'
import PokeBallLoader from './PokeBallLoader.vue'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

const props = defineProps<{
  open: boolean
  excludeIds: number[]
}>()

const emit = defineEmits<{
  select: [id: number, name: string]
  close: []
}>()

const searchTerm = ref('')
const selectedLetter = ref<string | null>(null)

const { data: allListData, isLoading } = useAllPokemonListQuery(
  computed(() => props.open),
)

const allPokemon = computed(() => allListData.value?.results ?? [])

const filteredPokemon = computed(() => {
  let list = allPokemon.value
  if (selectedLetter.value) {
    list = list.filter((p) =>
      p.name.toLowerCase().startsWith(selectedLetter.value!),
    )
  } else {
    const term = searchTerm.value.toLowerCase().trim()
    if (term) {
      list = list.filter((p) => p.name.toLowerCase().includes(term))
    }
  }
  list = list.filter((p) => !props.excludeIds.includes(getPokemonId(p.url)))
  return list.slice(0, 100)
})

watch(searchTerm, (term) => {
  if (term.trim()) selectedLetter.value = null
})

watch(selectedLetter, (letter) => {
  if (letter) searchTerm.value = ''
})

const searchInputRef = ref<HTMLInputElement | null>(null)

function shouldAutofocusSearch() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      searchTerm.value = ''
      if (shouldAutofocusSearch()) {
        setTimeout(() => searchInputRef.value?.focus(), 50)
      }
    }
  },
)

function handleSelect(name: string, url: string) {
  emit('select', getPokemonId(url), name)
}

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

function handleLetterClick(letter: string) {
  selectedLetter.value = selectedLetter.value === letter ? null : letter
}

const modalSurface = useTemplateRef<HTMLElement>('modalSurface')
const hasAnimatedRows = ref(false)

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      hasAnimatedRows.value = false
      return
    }

    await nextTick()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const surface = modalSurface.value
    if (!surface) return

    gsap.from(surface, {
      y: 36,
      scale: 0.96,
      autoAlpha: 0,
      duration: 0.28,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
    })

    const controls = surface.querySelectorAll('.modal-control')
    gsap.from(controls, {
      y: 10,
      autoAlpha: 0,
      duration: 0.18,
      stagger: 0.03,
      ease: 'power3.out',
      delay: 0.06,
      clearProps: 'transform,opacity,visibility',
    })
  },
)

watch(
  () => [props.open, isLoading.value] as const,
  async ([open, loading]) => {
    if (!open || loading || hasAnimatedRows.value) return

    await nextTick()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const surface = modalSurface.value
    if (!surface) return

    const rows = surface.querySelectorAll('.modal-result-row')
    const visibleRows = Array.from(rows).slice(0, 8)

    if (visibleRows.length) {
      gsap.from(visibleRows, {
        y: 8,
        autoAlpha: 0,
        duration: 0.16,
        stagger: 0.02,
        ease: 'power2.out',
        delay: 0.08,
        clearProps: 'transform,opacity,visibility',
      })
      hasAnimatedRows.value = true
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click="handleBackdropClick"
      >
        <div
          ref="modalSurface"
          class="modal-surface bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden overscroll-contain"
          @click.stop
        >
          <div class="p-5 border-b border-gray-100">
            <div class="modal-control flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-900">Choose a Pokémon</h2>
              <button
                @click="$emit('close')"
                class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                aria-label="Close"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div class="modal-control relative">
              <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref="searchInputRef"
                v-model="searchTerm"
                type="search"
                name="pokemon-search"
                aria-label="Search Pokémon"
                autocomplete="off"
                placeholder="Search Pokémon…"
                class="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
            <div class="modal-control mt-4 flex items-center gap-1 overflow-x-auto pb-1">
              <button
                class="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                :class="
                  selectedLetter === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                "
                @click="selectedLetter = null"
              >
                All
              </button>
              <button
                v-for="letter in ALPHABET"
                :key="letter"
                class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors uppercase"
                :class="
                  selectedLetter === letter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                "
                :aria-label="`Filter by letter ${letter}`"
                @click="handleLetterClick(letter)"
              >
                {{ letter }}
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-2">
            <div
              v-if="isLoading"
              class="flex flex-col items-center justify-center py-12 gap-4"
            >
              <PokeBallLoader size="md" label="Loading Pokémon…" />
            </div>

            <div
              v-else-if="filteredPokemon.length === 0"
              class="text-center py-12"
            >
              <p v-if="selectedLetter" class="text-gray-400 font-medium">
                No Pokémon found starting with "{{ selectedLetter.toUpperCase() }}"
              </p>
              <p v-else class="text-gray-400 font-medium">No Pokémon found</p>
            </div>

            <div v-else class="grid grid-cols-1 gap-1">
              <button
                v-for="pokemon in filteredPokemon"
                :key="pokemon.name"
                class="modal-result-row flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left"
                style="content-visibility: auto; contain-intrinsic-size: 56px;"
                @click="handleSelect(pokemon.name, pokemon.url)"
              >
                <img
                  :src="getPokemonSpriteUrl(getPokemonId(pokemon.url))"
                  :alt="pokemon.name"
                  width="40"
                  height="40"
                  class="w-10 h-10 object-contain"
                  loading="lazy"
                />
                <span class="capitalize font-semibold text-gray-800">{{
                  pokemon.name
                }}</span>
                <span class="ml-auto text-xs text-gray-400 font-mono"
                  >#{{
                    String(getPokemonId(pokemon.url)).padStart(4, '0')
                  }}</span
                >
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
