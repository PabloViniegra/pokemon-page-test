<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  value: number
  max?: number
  color?: string
  description?: string
}>()

const maxValue = props.max || 255
const percentage = computed(() => Math.min((props.value / maxValue) * 100, 100))
const barColor = props.color || '#A8A77A'
</script>

<template>
  <div class="stat-row flex items-center gap-3" :title="description">
    <span
      class="stat-label text-gray-500 text-xs font-bold w-20 text-right shrink-0 cursor-help"
      >{{ name }}</span
    >
    <div class="stat-track flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        class="stat-fill h-full rounded-full"
        :style="{
          width: `${percentage}%`,
          backgroundColor: barColor,
        }"
      ></div>
    </div>
    <span class="stat-value text-gray-700 font-mono text-xs font-bold w-8">{{
      value
    }}</span>
  </div>
</template>
