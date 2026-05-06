<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useFiltersStore } from '../stores/filters'
import { TYPE_COLORS } from '../types/pokemon'

const filtersStore = useFiltersStore()
const { selectedTypes, showFavoritesOnly } = storeToRefs(filtersStore)
const availableTypes = Object.keys(TYPE_COLORS)

function toggleType(type: string) {
    const index = selectedTypes.value.indexOf(type)
    if (index > -1) {
        selectedTypes.value.splice(index, 1)
    } else {
        selectedTypes.value.push(type)
    }
}

function toggleFavoritesOnly() {
    showFavoritesOnly.value = !showFavoritesOnly.value
}
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-4">
      <button
        @click="toggleFavoritesOnly"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all"
        :class="showFavoritesOnly
          ? 'bg-red-50 border-red-400 text-red-500 ring-2 ring-red-200'
          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'"
        :aria-pressed="showFavoritesOnly"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {{ showFavoritesOnly ? 'Favorites only' : 'Show favorites' }}
      </button>
    </div>
    <p class="text-gray-500 text-sm mb-3 font-bold">Filter by Type:</p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="type in availableTypes"
        :key="type"
        @click="toggleType(type)"
        class="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2"
        :class="selectedTypes.includes(type)
          ? 'ring-2 ring-gray-900 ring-offset-2 scale-105'
          : 'hover:scale-105 opacity-75 hover:opacity-100'"
        :style="{ backgroundColor: TYPE_COLORS[type]?.color + '25', color: TYPE_COLORS[type]?.color, borderColor: TYPE_COLORS[type]?.color + '50' }"
      >
        {{ type }}
      </button>
    </div>
  </div>
</template>
