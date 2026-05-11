<script setup lang="ts">
import { gsap } from 'gsap'
import type { PokemonCardDisplay } from '../types/pokemon'
import { useTemplateRef } from 'vue'
import { useGsapContext } from '../composables/useGsapContext'
import PokemonCard from './PokemonCard.vue'

const props = defineProps<{
  pokemons: PokemonCardDisplay[]
  animate?: boolean
}>()

defineEmits<{
  select: [name: string]
  hover: [name: string]
}>()

const gridRoot = useTemplateRef<HTMLElement>('gridRoot')

useGsapContext(gridRoot, ({ q }) => {
  if (!props.animate) return

  const cards = q('.pokemon-grid-card')
  if (!cards.length) return

  gsap.from(cards, {
    y: 26,
    scale: 0.96,
    autoAlpha: 0,
    duration: 0.42,
    stagger: 0.04,
    ease: 'power3.out',
    clearProps: 'transform,opacity,visibility',
  })
})
</script>

<template>
  <div
    ref="gridRoot"
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
  >
    <PokemonCard
      v-for="pokemon in pokemons"
      :key="pokemon.name"
      :name="pokemon.name"
      :url="pokemon.url"
      :imageUrl="pokemon.imageUrl"
      :paddedId="pokemon.paddedId"
      :isFavorited="pokemon.isFavorited"
      :accentColor="pokemon.accentColor"
      class="pokemon-grid-card"
      @select="$emit('select', $event)"
      @hover="$emit('hover', $event)"
    />
  </div>
</template>
