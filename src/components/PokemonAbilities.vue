<script setup lang="ts">
import { computed } from 'vue'
import { useQueries } from '@tanstack/vue-query'
import type { PokemonAbility } from '../types/pokemon'
import { getAbilityDetail } from '../helpers/pokemon-api'

const props = defineProps<{
  abilities: PokemonAbility[]
}>()

const STALE_TIME = 1000 * 60 * 60 * 24

const abilityQueries = useQueries({
  queries: computed(() =>
    props.abilities.map((a) => ({
      queryKey: ['ability', a.ability.name],
      queryFn: () => getAbilityDetail(a.ability.name),
      staleTime: STALE_TIME,
    })),
  ),
})

function getShortEffect(index: number): string {
  const data = abilityQueries.value[index]?.data
  if (!data) return ''
  const entry = data.effect_entries.find((e) => e.language.name === 'en')
  return entry?.short_effect ?? ''
}
</script>

<template>
  <section class="px-4 py-10 max-w-6xl mx-auto">
    <h2
      class="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3"
      style="font-family: 'Fredoka', sans-serif"
    >
      <span class="w-3 h-8 rounded-full bg-red-500"></span>
      Abilities
    </h2>
    <div class="flex flex-wrap gap-3">
      <div
        v-for="(ability, index) in abilities"
        :key="ability.ability.name"
        class="flex flex-col gap-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 max-w-sm"
      >
        <div class="flex items-center gap-2">
          <span class="text-gray-900 font-bold capitalize text-sm">{{
            ability.ability.name.replace('-', ' ')
          }}</span>
          <span
            v-if="ability.is_hidden"
            class="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold uppercase"
            title="This ability is only visible in-game with specific items or conditions"
            >Hidden</span
          >
        </div>
        <p
          v-if="getShortEffect(index)"
          class="text-gray-500 text-xs leading-relaxed"
        >
          {{ getShortEffect(index) }}
        </p>
      </div>
    </div>
  </section>
</template>
