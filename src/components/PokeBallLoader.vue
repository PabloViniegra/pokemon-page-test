<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md',
  },
)

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
}

const logoSrc = `${import.meta.env.BASE_URL}logo.svg`
</script>

<template>
  <div class="flex flex-col items-center gap-2" role="status">
    <img
      :src="logoSrc"
      alt=""
      :class="['animate-spin', sizeClasses[size]]"
      aria-hidden="true"
    />
    <span v-if="label" class="text-gray-500 font-medium text-sm">
      {{ label }}
    </span>
  </div>
</template>
