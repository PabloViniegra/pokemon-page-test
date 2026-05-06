<script setup lang="ts">
import type { PokemonStat } from '../types/pokemon'
import StatBar from './StatBar.vue'
import { STAT_NAMES, STAT_DESCRIPTIONS } from '../types/pokemon'
import { computed } from 'vue'

const props = defineProps<{
  stats: PokemonStat[]
  accentColor: string
}>()

const totalStats = computed(() =>
  props.stats.reduce((sum, s) => sum + s.base_stat, 0),
)
</script>

<template>
  <section class="px-4 py-12 max-w-6xl mx-auto">
    <h2
      class="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3"
      style="font-family: 'Fredoka', sans-serif"
    >
      <span
        class="w-3 h-8 rounded-full"
        :style="{ backgroundColor: accentColor }"
      ></span>
      Base Stats
    </h2>
    <div
      class="bg-white border-2 border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm"
    >
      <StatBar
        v-for="stat in stats"
        :key="stat.stat.name"
        :name="STAT_NAMES[stat.stat.name] || stat.stat.name"
        :description="STAT_DESCRIPTIONS[stat.stat.name]"
        :value="stat.base_stat"
        :color="accentColor"
      />
      <div class="pt-4 border-t-2 border-gray-100 flex items-center gap-3">
        <span class="text-gray-500 text-xs font-bold w-20 text-right shrink-0"
          >Total</span
        >
        <div class="flex-1"></div>
        <span
          class="font-black font-mono text-sm px-2 py-1 rounded-lg bg-gray-100 text-gray-900"
          >{{ totalStats }}</span
        >
      </div>
    </div>
  </section>
</template>
