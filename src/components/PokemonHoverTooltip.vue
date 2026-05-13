<script setup lang="ts">
import { computed } from 'vue'
import type { PokemonDetail } from '../types/pokemon'
import { TYPE_COLORS } from '../types/pokemon'

const props = defineProps<{
  pokemon: PokemonDetail | null
  accentColor: string | null
  position: {
    top: number
    left: number
    placement: 'top' | 'bottom'
  } | null
  visible: boolean
}>()

const typeBadges = computed(() =>
  props.pokemon?.types.slice(0, 2).map((entry) => entry.type.name) ?? [],
)

const sizeFacts = computed(() => {
  if (!props.pokemon) {
    return []
  }

  return [
    { label: 'Ht', value: `${(props.pokemon.height / 10).toFixed(1)} m` },
    { label: 'Wt', value: `${(props.pokemon.weight / 10).toFixed(1)} kg` },
  ]
})

const abilitySummary = computed(() =>
  props.pokemon?.abilities.slice(0, 2).map((entry) => {
    const abilityName = entry.ability.name.replace(/-/g, ' ')
    return entry.is_hidden ? `${abilityName} (hidden)` : abilityName
  }) ?? [],
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible && pokemon && position"
      class="pointer-events-none fixed z-[70] w-56 rounded-2xl border border-slate-200/80 bg-slate-50/96 shadow-[0_18px_48px_rgba(15,23,42,0.18)] backdrop-blur-sm"
      :class="
        position.placement === 'top'
          ? '-translate-x-1/2 -translate-y-full'
          : '-translate-x-1/2'
      "
      :style="{
        top: `${position.top}px`,
        left: `${position.left}px`,
        animation: 'pokemon-hover-tooltip 180ms cubic-bezier(0.22, 1, 0.36, 1)',
      }"
      aria-hidden="true"
    >
      <div
        v-if="accentColor"
        class="h-1.5 rounded-t-2xl"
        :style="{ backgroundColor: accentColor }"
      ></div>

      <div class="space-y-3 p-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-bold tracking-[0.18em] text-slate-400">
            #{{ String(pokemon.id).padStart(4, '0') }}
          </span>
          <div class="flex flex-wrap justify-end gap-1">
            <span
              v-for="type in typeBadges"
              :key="type"
              class="rounded-full px-2 py-1 text-[10px] font-semibold capitalize text-slate-50"
              :style="{ backgroundColor: TYPE_COLORS[type]?.color ?? '#64748b' }"
            >
              {{ type }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div
            v-for="fact in sizeFacts"
            :key="fact.label"
            class="rounded-xl bg-slate-100/90 px-2.5 py-2"
          >
            <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {{ fact.label }}
            </p>
            <p class="mt-1 font-semibold text-slate-700">{{ fact.value }}</p>
          </div>
        </div>

        <div v-if="abilitySummary.length" class="space-y-1">
          <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Abilities
          </p>
          <p
            v-for="ability in abilitySummary"
            :key="ability"
            class="truncate text-xs font-medium capitalize text-slate-600"
          >
            {{ ability }}
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes pokemon-hover-tooltip {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
