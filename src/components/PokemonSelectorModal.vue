<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAllPokemonListQuery } from '../composables/usePokemonQueries'
import { getPokemonId, getPokemonSpriteUrl } from '../helpers/pokemon-api'

const props = defineProps<{
    open: boolean
    excludeIds: number[]
}>()

const emit = defineEmits<{
    select: [id: number, name: string]
    close: []
}>()

const searchTerm = ref('')

const { data: allListData, isLoading } = useAllPokemonListQuery(computed(() => props.open))

const allPokemon = computed(() => allListData.value?.results ?? [])

const filteredPokemon = computed(() => {
    const term = searchTerm.value.toLowerCase().trim()
    let list = allPokemon.value
    if (term) {
        list = list.filter(p => p.name.toLowerCase().includes(term))
    }
    // Exclude already-selected Pokémon
    list = list.filter(p => !props.excludeIds.includes(getPokemonId(p.url)))
    return list.slice(0, 100)
})

const searchInputRef = ref<HTMLInputElement | null>(null)

watch(() => props.open, (isOpen) => {
    if (isOpen) {
        searchTerm.value = ''
        setTimeout(() => searchInputRef.value?.focus(), 50)
    }
})

function handleSelect(name: string, url: string) {
    emit('select', getPokemonId(url), name)
}

function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
        emit('close')
    }
}
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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click="handleBackdropClick"
      >
        <div
          class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
          @click.stop
        >
          <div class="p-5 border-b border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-900">Choose a Pokémon</h2>
              <button
                @click="$emit('close')"
                class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                aria-label="Close"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref="searchInputRef"
                v-model="searchTerm"
                type="text"
                placeholder="Search Pokémon..."
                class="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-2">
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 gap-4">
              <div class="relative w-10 h-10">
                <div class="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <p class="text-gray-500 font-medium text-sm">Loading Pokémon...</p>
            </div>

            <div v-else-if="filteredPokemon.length === 0" class="text-center py-12">
              <p class="text-gray-400 font-medium">No Pokémon found</p>
            </div>

            <div v-else class="grid grid-cols-1 gap-1">
              <button
                v-for="pokemon in filteredPokemon"
                :key="pokemon.name"
                class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left"
                @click="handleSelect(pokemon.name, pokemon.url)"
              >
                <img
                  :src="getPokemonSpriteUrl(getPokemonId(pokemon.url))"
                  :alt="pokemon.name"
                  class="w-10 h-10 object-contain"
                  loading="lazy"
                >
                <span class="capitalize font-semibold text-gray-800">{{ pokemon.name }}</span>
                <span class="ml-auto text-xs text-gray-400 font-mono">#{{ String(getPokemonId(pokemon.url)).padStart(4, '0') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
