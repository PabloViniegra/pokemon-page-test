<script setup lang="ts">
import { TYPE_COLORS } from '../types/pokemon'

const props = defineProps<{
    pokemonType: string
}>()

const color = TYPE_COLORS[props.pokemonType]?.color || '#888'
</script>

<template>
  <span
    class="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border-2"
    :style="{ backgroundColor: color + '20', color: color, borderColor: color + '40' }"
  >
    {{ pokemonType }}
  </span>
</template>
