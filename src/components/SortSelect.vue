<script setup lang="ts">
const model = defineModel<string>({ default: 'id-asc' })
</script>

<template>
  <select
    v-model="model"
    aria-label="Sort Pokémon"
    class="bg-gray-100 border-2 border-gray-200 rounded-2xl px-5 py-3 text-gray-900 focus:outline-none focus:border-blue-500 cursor-pointer font-semibold"
  >
    <option value="id-asc">ID ↑</option>
    <option value="id-desc">ID ↓</option>
    <option value="name-asc">Name A-Z</option>
    <option value="name-desc">Name Z-A</option>
  </select>
</template>
