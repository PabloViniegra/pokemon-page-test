<script setup lang="ts">
import { TYPE_COLORS } from '../types/pokemon'
import { getPokemonSpriteUrl } from '../helpers/pokemon-api'
import type { TypeSuggestion, PokemonSuggestion } from '../helpers/team-suggestions'

const props = defineProps<{
  helpfulTypes: TypeSuggestion[]
  suggestedPokemon: PokemonSuggestion[]
  isLoading: boolean
  isError: boolean
  teamSize: number
  isFull: boolean
}>()

const emit = defineEmits<{
  selectPokemon: [id: number, name: string]
}>()

function handlePokemonClick(id: number, name: string) {
  if (!props.isFull) {
    emit('selectPokemon', id, name)
  }
}
</script>

<template>
  <section class="page-panel rounded-3xl border-2 border-gray-100 p-4 sm:p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-4">Balance Suggestions</h2>

    <div v-if="teamSize === 0" class="text-center py-8 text-gray-600">
      <p class="font-medium">
        Start building your team to get balance suggestions.
      </p>
    </div>

    <div v-else-if="isError" class="text-center py-6">
      <p class="text-sm text-red-500 font-medium">
        Suggestions are temporarily unavailable.
      </p>
    </div>

    <div v-else class="space-y-5">
      <!-- Helpful Types -->
      <div v-if="helpfulTypes.length > 0">
        <p class="text-sm font-semibold text-gray-700 mb-2">
          {{ isFull ? 'Your team would benefit from:' : 'Consider adding:' }}
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="t in helpfulTypes"
            :key="t.type"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white capitalize"
            :style="{ backgroundColor: TYPE_COLORS[t.type]?.color ?? '#999' }"
          >
            {{ t.type }}
          </span>
        </div>
      </div>

      <!-- Pokemon suggestions loading -->
      <div v-if="isLoading" class="flex items-center gap-3 py-2">
        <div class="relative w-5 h-5">
          <div
            class="absolute inset-0 border-2 border-gray-200 rounded-full"
          ></div>
          <div
            class="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"
          ></div>
        </div>
        <p class="text-sm text-gray-500 font-medium">
          Analyzing more Pokémon…
        </p>
      </div>

      <!-- Suggested Pokémon -->
      <div v-else-if="suggestedPokemon.length > 0">
        <p class="text-sm font-semibold text-gray-700 mb-2">
          {{ isFull ? 'Possible improvements' : 'Suggested Pokémon' }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            v-for="p in suggestedPokemon"
            :key="p.id"
            class="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50/50 text-left transition-colors"
            :class="
              isFull
                ? 'cursor-default opacity-60'
                : 'hover:bg-blue-50 hover:border-blue-200 cursor-pointer'
            "
            :disabled="isFull"
            @click="handlePokemonClick(p.id, p.name)"
          >
            <img
              :src="getPokemonSpriteUrl(p.id)"
              :alt="p.name"
              width="48"
              height="48"
              class="w-12 h-12 object-contain shrink-0"
              loading="lazy"
            />
            <div class="min-w-0">
              <p
                class="text-sm font-bold capitalize text-gray-800 truncate"
              >
                {{ p.name }}
              </p>
              <div class="flex gap-1 mt-1">
                <span
                  v-for="type in p.types"
                  :key="type"
                  class="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full capitalize"
                  :style="{
                    backgroundColor: TYPE_COLORS[type]?.color ?? '#999',
                  }"
                >
                  {{ type }}
                </span>
              </div>
              <p class="text-[11px] text-gray-500 mt-1 truncate">
                {{ p.explanation }}
              </p>
            </div>
          </button>
        </div>
      </div>

      <!-- Balanced message -->
      <div
        v-else-if="
          !isLoading &&
          helpfulTypes.length === 0 &&
          suggestedPokemon.length === 0
        "
        class="text-center py-4 text-gray-500 text-sm"
      >
        Your team looks well-balanced defensively.
      </div>
    </div>
  </section>
</template>
