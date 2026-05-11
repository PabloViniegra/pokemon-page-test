<script setup lang="ts">
const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="relative flex-1 w-full">
    <input
      v-model="model"
      type="text"
      placeholder="Search Pokémon..."
      class="w-full bg-gray-100 border-2 border-gray-200 rounded-2xl px-5 py-3 pl-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-semibold"
    />
    <svg
      class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <button
      v-if="model"
      type="button"
      class="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
      @click="model = ''"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
