<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import type {
  PokemonMove,
  PokemonGameIndex,
  PokemonHeldItem,
  PokemonPastType,
} from '../types/pokemon'
import { useGsapContext } from '../composables/useGsapContext'
import PokemonTypeBadge from './PokemonTypeBadge.vue'

const props = defineProps<{
  moves: PokemonMove[]
  gameIndices: PokemonGameIndex[]
  heldItems: PokemonHeldItem[]
  pastTypes: PokemonPastType[]
}>()

const INITIAL_SLICE = 20
const showAllMoves = ref(false)
const rootRef = useTemplateRef<HTMLElement>('rootRef')

const displayedMoves = computed(() =>
  showAllMoves.value ? props.moves : props.moves.slice(0, INITIAL_SLICE)
)

const isExpanded = computed(() => showAllMoves.value || props.moves.length <= INITIAL_SLICE)

useGsapContext(rootRef, ({ root, q }) => {
  gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: {
      trigger: root,
      start: 'top 78%',
      once: true,
    },
  })
    .from(q('.moves-primary'), {
      y: 30,
      autoAlpha: 0,
      duration: 0.48,
    })
    .from(
      q('.move-tag'),
      {
        y: 18,
        autoAlpha: 0,
        scale: 0.9,
        stagger: { each: 0.024, amount: 0.68 },
        duration: 0.28,
      },
      '-=0.08',
    )
    .from(
      q('.moves-secondary-section'),
      {
        y: 26,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.34,
      },
      '-=0.14',
    )
    .from(
      q('.moves-secondary-item'),
      {
        y: 16,
        autoAlpha: 0,
        stagger: { each: 0.02, amount: 0.38 },
        duration: 0.24,
      },
      '-=0.08',
    )
})

watch(showAllMoves, async (expanded) => {
  if (!expanded) return

  await nextTick()

  if (!rootRef.value) return

  const extraTags = rootRef.value.querySelectorAll('.move-tag--extra')

  if (!extraTags.length) return

  gsap.fromTo(
    extraTags,
    {
      y: 18,
      autoAlpha: 0,
      scale: 0.88,
    },
    {
      y: 0,
      autoAlpha: 1,
      scale: 1,
      duration: 0.3,
      stagger: { each: 0.018, amount: 0.32 },
      ease: 'power3.out',
      overwrite: 'auto',
    },
  )

  ScrollTrigger.refresh()
})
</script>

<template>
  <div ref="rootRef">
    <section class="moves-primary px-4 py-10 max-w-6xl mx-auto">
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
          class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span v-if="isExpanded">Show fewer</span>
          <span v-else>Show all ({{ moves.length }})</span>
        </button>
      </div>
      <div class="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        <span
          v-for="(move, index) in displayedMoves"
          :key="move.move.name"
          class="move-tag px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 capitalize font-medium hover:bg-gray-100 transition-colors cursor-default"
          :class="{ 'move-tag--extra': index >= INITIAL_SLICE }"
        >
          {{ move.move.name.replace('-', ' ') }}
        </span>
      </div>
    </section>

    <section class="moves-secondary-section px-4 py-10 max-w-6xl mx-auto">
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
          class="moves-secondary-item px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 capitalize font-medium"
        >
          {{ game.version.name.replace('-', ' ') }}
        </span>
      </div>
    </section>

    <section
      v-if="heldItems.length > 0"
      class="moves-secondary-section px-4 py-10 max-w-6xl mx-auto"
    >
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
          class="moves-secondary-item bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
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

    <section
      v-if="pastTypes.length > 0"
      class="moves-secondary-section px-4 py-10 max-w-6xl mx-auto"
    >
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
          class="moves-secondary-item flex items-center gap-3"
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
