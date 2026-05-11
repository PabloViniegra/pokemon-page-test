<script setup lang="ts">
import { gsap } from 'gsap'
import type { PokemonStat } from '../types/pokemon'
import { computed, useTemplateRef } from 'vue'
import { useGsapContext } from '../composables/useGsapContext'
import StatBar from './StatBar.vue'
import { STAT_NAMES, STAT_DESCRIPTIONS } from '../types/pokemon'

const props = defineProps<{
  stats: PokemonStat[]
  accentColor: string
}>()

const totalStats = computed(() =>
  props.stats.reduce((sum, s) => sum + s.base_stat, 0),
)

const sectionRef = useTemplateRef<HTMLElement>('sectionRef')

useGsapContext(sectionRef, ({ root, q }) => {
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: {
      trigger: root,
      start: 'top 78%',
      once: true,
    },
  })

  tl.from(q('.stats-heading'), {
    y: 30,
    autoAlpha: 0,
    duration: 0.48,
  })
    .from(
      q('.stats-shell'),
      {
        y: 24,
        autoAlpha: 0,
        duration: 0.36,
      },
      '-=0.16',
    )
    .from(
      q('.stat-row'),
      {
        y: 20,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.32,
      },
      '-=0.06',
    )
    .fromTo(
      q('.stat-fill'),
      {
        scaleX: 0,
        transformOrigin: 'left center',
      },
      {
        scaleX: 1,
        stagger: 0.1,
        duration: 0.72,
        ease: 'expo.out',
      },
      '+=0.1',
    )
    .from(
      q('.stats-total'),
      {
        y: 14,
        autoAlpha: 0,
        scale: 0.96,
        duration: 0.28,
      },
      '-=0.1',
    )
})
</script>

<template>
  <section ref="sectionRef" class="px-4 py-12 max-w-6xl mx-auto">
    <h2
      class="stats-heading text-2xl font-black text-gray-900 mb-6 flex items-center gap-3"
      style="font-family: 'Fredoka', sans-serif"
    >
      <span
        class="w-3 h-8 rounded-full"
        :style="{ backgroundColor: accentColor }"
      ></span>
      Base Stats
    </h2>
    <div
      class="stats-shell bg-white border-2 border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm"
    >
      <StatBar
        v-for="stat in stats"
        :key="stat.stat.name"
        :name="STAT_NAMES[stat.stat.name] || stat.stat.name"
        :description="STAT_DESCRIPTIONS[stat.stat.name]"
        :value="stat.base_stat"
        :color="accentColor"
      />
      <div class="stats-total pt-4 border-t-2 border-gray-100 flex items-center gap-3">
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
