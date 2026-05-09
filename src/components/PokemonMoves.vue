<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  PokemonMove,
  PokemonGameIndex,
  PokemonHeldItem,
  PokemonPastType,
} from '../types/pokemon'
import PokemonTypeBadge from './PokemonTypeBadge.vue'

const props = defineProps<{
  moves: PokemonMove[]
  gameIndices: PokemonGameIndex[]
  heldItems: PokemonHeldItem[]
  pastTypes: PokemonPastType[]
}>()

const INITIAL_SLICE = 20
const showAllMoves = ref(false)

const displayedMoves = computed(() =>
  showAllMoves.value ? props.moves : props.moves.slice(0, INITIAL_SLICE)
)

const isExpanded = computed(() => showAllMoves.value || props.moves.length <= INITIAL_SLICE)
</script>

<template>
  <div>
    <section class="px-4 py-10 max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-4">
        <h2
          class="text-2xl font-black text-gray-900 flex items-center gap-3"
          style="font-family: 'Fredoka', sans-serif"
        >
          <span class="w-3 h-8 rounded-full bg-blue-500"></span>
          Moves ({{ moves.length }})
        </h2>
        <button
          v-if="moves.length > INITIAL_SLICE"
          @click="showAllMoves = !showAllMoves"
          class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span v-if="isExpanded">Show fewer</span>
          <span v-else>Show all ({{ moves.length }})</span>
        </button>
      </div>
      <div
        class="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto custom-scrollbar"
      >
        <span
          v-for="move in displayedMoves"
          :key="move.move.name"
          class="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 capitalize font-medium hover:bg-gray-100 transition-colors cursor-default"
        >
          {{ move.move.name.replace('-', ' ') }}
        </span>
      </div>
    </section>

    <section class="px-4 py-10 max-w-6xl mx-auto">
      <h2
        class="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3"
        style="font-family: 'Fredoka', sans-serif"
      >
        <span class="w-3 h-8 rounded-full bg-red-500"></span>
        Game Appearances
      </h2>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="game in gameIndices"
          :key="game.version.name"
          class="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 capitalize font-medium"
        >
          {{ game.version.name.replace('-', ' ') }}
        </span>
      </div>
    </section>

    <section v-if="heldItems.length > 0" class="px-4 py-10 max-w-6xl mx-auto">
      <h2
        class="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3"
        style="font-family: 'Fredoka', sans-serif"
      >
        <span class="w-3 h-8 rounded-full bg-blue-500"></span>
        Held Items
      </h2>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="item in heldItems"
          :key="item.item.name"
          class="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
        >
          <p class="text-gray-900 font-bold capitalize text-sm">
            {{ item.item.name.replace('-', ' ') }}
          </p>
          <div class="mt-1 flex flex-wrap gap-1">
            <span
              v-for="vd in item.version_details"
              :key="vd.version.name"
              class="text-[10px] text-gray-400 font-medium"
            >
              {{ vd.version.name.replace('-', ' ') }} (rarity: {{ vd.rarity }})
            </span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="pastTypes.length > 0" class="px-4 py-10 max-w-6xl mx-auto">
      <h2
        class="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3"
        style="font-family: 'Fredoka', sans-serif"
      >
        <span class="w-3 h-8 rounded-full bg-red-500"></span>
        Past Types
      </h2>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="pt in pastTypes"
          :key="pt.generation.name"
          class="flex items-center gap-3"
        >
          <span class="text-gray-500 text-sm font-medium capitalize">{{
            pt.generation.name.replace('-', ' ')
          }}</span>
          <div class="flex gap-2">
            <PokemonTypeBadge
              v-for="t in pt.types"
              :key="t.type.name"
              :pokemon-type="t.type.name"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>
