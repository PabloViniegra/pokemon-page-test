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
  <div class="flex items-center gap-3" :title="description">
    <span
      class="text-gray-500 text-xs font-bold w-20 text-right shrink-0 cursor-help"
      >{{ name }}</span
    >
    <div class="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-1000 ease-out"
        :style="{ width: `${percentage}%`, backgroundColor: barColor }"
      ></div>
    </div>
    <span class="text-gray-700 font-mono text-xs font-bold w-8">{{
      value
    }}</span>
  </div>
</template>
