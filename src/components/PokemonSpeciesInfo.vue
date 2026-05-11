<script setup lang="ts">
import { gsap } from 'gsap'
import type { PokemonSpeciesInfo } from '../types/pokemon'
import { useTemplateRef } from 'vue'
import { useGsapContext } from '../composables/useGsapContext'

defineProps<{
  species: PokemonSpeciesInfo
}>()

const sectionRef = useTemplateRef<HTMLElement>('sectionRef')

useGsapContext(sectionRef, ({ root, q }) => {
  gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: {
      trigger: root,
      start: 'top 80%',
      once: true,
    },
  })
    .from(q('.species-heading'), {
      y: 30,
      autoAlpha: 0,
      duration: 0.46,
    })
    .from(
      q('.species-row'),
      {
        y: 20,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.32,
      },
      '-=0.08',
    )
    .from(
      q('.species-badges > span'),
      {
        y: 18,
        autoAlpha: 0,
        scale: 0.9,
        stagger: 0.1,
        duration: 0.32,
      },
      '-=0.06',
    )
})

function formatGenderRate(rate: number): string {
  if (rate === -1) return 'Genderless'
  const female = (rate / 8) * 100
  const male = 100 - female
  return `${male}% Male / ${female}% Female`
}
</script>

<template>
  <section ref="sectionRef" class="px-4 py-10 max-w-6xl mx-auto pb-24">
    <h2
      class="species-heading text-2xl font-black text-gray-900 mb-6 flex items-center gap-3"
      style="font-family: 'Fredoka', sans-serif"
    >
      <span class="w-3 h-8 rounded-full bg-yellow-400"></span>
      Species Info
    </h2>

    <dl class="species-grid grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
      <div class="species-row">
        <dt class="text-gray-600 font-bold text-xs mb-0.5">Color</dt>
        <dd class="text-gray-900 font-bold capitalize">
          {{ species.color.name }}
        </dd>
      </div>
      <div class="species-row">
        <dt class="text-gray-600 font-bold text-xs mb-0.5">Shape</dt>
        <dd class="text-gray-900 font-bold capitalize">
          {{ species.shape.name }}
        </dd>
      </div>
      <div class="species-row">
        <dt class="text-gray-600 font-bold text-xs mb-0.5">Habitat</dt>
        <dd class="text-gray-900 font-bold capitalize">
          {{ species.habitat?.name || 'Unknown' }}
        </dd>
      </div>
      <div class="species-row">
        <dt class="text-gray-600 font-bold text-xs mb-0.5">Growth Rate</dt>
        <dd class="text-gray-900 font-bold capitalize">
          {{ species.growth_rate.name.replace('-', ' ') }}
        </dd>
      </div>
      <div class="species-row">
        <dt class="text-gray-600 font-bold text-xs mb-0.5">Capture Rate</dt>
        <dd class="text-gray-900 font-bold">{{ species.capture_rate }}</dd>
      </div>
      <div class="species-row">
        <dt class="text-gray-600 font-bold text-xs mb-0.5">Base Happiness</dt>
        <dd class="text-gray-900 font-bold">{{ species.base_happiness }}</dd>
      </div>
      <div class="species-row">
        <dt class="text-gray-600 font-bold text-xs mb-0.5">Gender</dt>
        <dd class="text-gray-900 font-bold">
          {{ formatGenderRate(species.gender_rate) }}
        </dd>
      </div>
      <div class="species-row">
        <dt class="text-gray-600 font-bold text-xs mb-0.5">Egg Groups</dt>
        <dd class="text-gray-900 font-bold capitalize">
          {{ species.egg_groups.map((g) => g.name).join(', ') || 'Unknown' }}
        </dd>
      </div>
      <div class="species-row">
        <dt class="text-gray-600 font-bold text-xs mb-0.5">Hatch Counter</dt>
        <dd class="text-gray-900 font-bold">
          {{ species.hatch_counter * 255 }} steps
        </dd>
      </div>
    </dl>

    <div
      v-if="species.is_legendary || species.is_mythical || species.is_baby"
      class="flex flex-wrap gap-3 mt-8 species-badges"
    >
      <span
        v-if="species.is_legendary"
        class="px-4 py-2 bg-yellow-50 border-2 border-yellow-300 rounded-full text-yellow-700 text-sm font-black uppercase tracking-wider"
      >
        ⭐ Legendary
      </span>
      <span
        v-if="species.is_mythical"
        class="px-4 py-2 bg-indigo-50 border-2 border-indigo-200 rounded-full text-indigo-700 text-sm font-black uppercase tracking-wider"
      >
        ✨ Mythical
      </span>
      <span
        v-if="species.is_baby"
        class="px-4 py-2 bg-pink-50 border-2 border-pink-200 rounded-full text-pink-700 text-sm font-black uppercase tracking-wider"
      >
        🍼 Baby
      </span>
    </div>
  </section>
</template>
