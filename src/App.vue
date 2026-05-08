<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { getPokemonImageUrl } from './helpers/pokemon-api'
import { useTheme } from './composables/useTheme'

const route = useRoute()
const router = useRouter()
const { theme, isDark, toggleLabel, toggleTheme } = useTheme()

const solgaleoArtwork = getPokemonImageUrl(791)
const lunalaArtwork = getPokemonImageUrl(792)

const isHome = computed(() => route.name === 'home')
const isTeamBuilder = computed(() => route.name === 'team-builder')
const isGame = computed(() => route.name === 'game')
</script>

<template>
  <div class="app-shell min-h-screen text-gray-900 relative overflow-x-hidden">
    <button
      class="theme-toggle"
      :class="{ 'theme-toggle--dark': isDark }"
      :aria-label="toggleLabel"
      :title="toggleLabel"
      @click="toggleTheme"
    >
      <span class="theme-toggle__track" aria-hidden="true">
        <img
          :src="solgaleoArtwork"
          alt=""
          class="theme-toggle__portrait theme-toggle__portrait--light"
          loading="eager"
          decoding="async"
        />
        <img
          :src="lunalaArtwork"
          alt=""
          class="theme-toggle__portrait theme-toggle__portrait--dark"
          loading="eager"
          decoding="async"
        />
        <span class="theme-toggle__thumb">
          <img
            :src="theme === 'dark' ? lunalaArtwork : solgaleoArtwork"
            alt=""
            class="theme-toggle__thumb-image"
            loading="eager"
            decoding="async"
          />
        </span>
      </span>
      <span class="theme-toggle__label">
        {{ theme === 'dark' ? 'Lunala' : 'Solgaleo' }}
      </span>
    </button>

    <nav
      class="app-nav sticky top-0 z-50 backdrop-blur-md border-b border-gray-200"
    >
      <div
        class="max-w-7xl mx-auto px-4 pr-24 sm:pr-32 h-14 flex items-center justify-between gap-3"
      >
        <button
          @click="router.push({ name: 'home' })"
          class="flex items-center gap-2 font-black text-lg tracking-tight"
          :class="isHome ? 'text-red-600' : 'text-gray-700 hover:text-red-600'"
          style="font-family: 'Fredoka', sans-serif"
        >
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path
              d="M12 2a10 10 0 0 1 10 10H12V2z"
              fill="currentColor"
              fill-opacity="0.2"
            />
            <line x1="2" y1="12" x2="22" y2="12" />
            <circle cx="12" cy="12" r="3" fill="white" stroke-width="2" />
          </svg>
          Pokédex
        </button>
        <div class="flex items-center gap-1 min-w-0">
          <button
            @click="router.push({ name: 'home' })"
            class="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
            :class="
              isHome
                ? 'bg-red-50 text-red-700'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            "
          >
            Pokédex
          </button>
          <button
            @click="router.push({ name: 'team-builder' })"
            class="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
            :class="
              isTeamBuilder
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            "
          >
            Team Builder
          </button>
          <button
            @click="router.push({ name: 'game' })"
            class="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
            :class="
              isGame
                ? 'bg-yellow-50 text-yellow-700'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            "
          >
            Who's that Pokémon?
          </button>
        </div>
      </div>
    </nav>

    <router-view v-slot="{ Component, route: r }">
      <KeepAlive include="HomeView">
        <component :is="Component" :key="r.fullPath" />
      </KeepAlive>
    </router-view>
    <VueQueryDevtools />
  </div>
</template>
