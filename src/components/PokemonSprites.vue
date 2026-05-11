<script setup lang="ts">
import { gsap } from 'gsap'
import type { PokemonSprites } from '../types/pokemon'
import { useTemplateRef } from 'vue'
import { useGsapContext } from '../composables/useGsapContext'

defineProps<{
  sprites: PokemonSprites
  pokemonName: string
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
    .from(q('.sprites-heading'), {
      y: 30,
      autoAlpha: 0,
      duration: 0.46,
    })
    .from(
      q('.sprite-card'),
      {
        y: 24,
        autoAlpha: 0,
        scale: 0.91,
        stagger: 0.1,
        duration: 0.36,
      },
      '-=0.08',
    )
})
</script>

<template>
  <section ref="sectionRef" class="px-4 py-10 max-w-6xl mx-auto">
    <h2
      class="sprites-heading text-2xl font-black text-gray-900 mb-4 flex items-center gap-3"
      style="font-family: 'Fredoka', sans-serif"
    >
      <span class="w-3 h-8 rounded-full bg-yellow-400"></span>
      Sprites
    </h2>
    <div class="flex flex-wrap gap-4">
      <div
        v-if="sprites.front_default"
        class="sprite-card flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105"
      >
        <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <img
            :src="sprites.front_default"
            :alt="pokemonName + ' front'"
            class="w-24 h-24 object-contain pixelated"
          />
        </div>
        <span class="text-gray-600 text-xs font-medium">Front</span>
      </div>
      <div
        v-if="sprites.back_default"
        class="sprite-card flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105"
      >
        <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <img
            :src="sprites.back_default"
            :alt="pokemonName + ' back'"
            class="w-24 h-24 object-contain pixelated"
          />
        </div>
        <span class="text-gray-600 text-xs font-medium">Back</span>
      </div>
      <div
        v-if="sprites.front_shiny"
        class="sprite-card flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105"
      >
        <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <img
            :src="sprites.front_shiny"
            :alt="pokemonName + ' front shiny'"
            class="w-24 h-24 object-contain pixelated"
          />
        </div>
        <span class="text-gray-600 text-xs font-medium">Front Shiny</span>
      </div>
      <div
        v-if="sprites.back_shiny"
        class="sprite-card flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105"
      >
        <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <img
            :src="sprites.back_shiny"
            :alt="pokemonName + ' back shiny'"
            class="w-24 h-24 object-contain pixelated"
          />
        </div>
        <span class="text-gray-600 text-xs font-medium">Back Shiny</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pixelated {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
