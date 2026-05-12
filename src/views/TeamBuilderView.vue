<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { useTeamStore } from '../stores/team'
import { getPokemonDetail } from '../helpers/pokemon-api'
import { pokemonKeys } from '../composables/usePokemonQueries'
import { useTeamDetailQueries } from '../composables/useTeamDetailQueries'
import { useGsapContext } from '../composables/useGsapContext'
import TeamSlot from '../components/TeamSlot.vue'
import PokemonSelectorModal from '../components/PokemonSelectorModal.vue'
import TeamWeaknessChart from '../components/TeamWeaknessChart.vue'

const router = useRouter()
const teamStore = useTeamStore()
const queryClient = useQueryClient()
const { teamTypes, memberTypesMap } = useTeamDetailQueries()

const activeSlotIndex = ref<number | null>(null)
const showModal = ref(false)

const pageHeader = useTemplateRef<HTMLElement>('pageHeader')
const slotsGrid = useTemplateRef<HTMLElement>('slotsGrid')

const teamIds = computed(() => teamStore.team.map((m) => m.id))

const slots = computed(() =>
  Array.from({ length: 6 }, (_, i) => {
    const member = teamStore.team[i]
    return member
      ? { id: member.id, name: member.name, index: i }
      : { id: null, name: null, index: i }
  }),
)

function openSelector(index: number) {
  activeSlotIndex.value = index
  showModal.value = true
}

function handleSelect(id: number, name: string) {
  if (activeSlotIndex.value !== null) {
    const existing = teamStore.team[activeSlotIndex.value]
    if (existing) teamStore.removeMember(existing.id)
    teamStore.addMember({ id, name })
    queryClient.prefetchQuery({
      queryKey: pokemonKeys.detail(id),
      queryFn: () => getPokemonDetail(id),
      staleTime: 1000 * 60 * 60 * 24,
    })
  }
  showModal.value = false
  activeSlotIndex.value = null
}

function handleRemove(id: number) {
  teamStore.removeMember(id)
}

useGsapContext(pageHeader, ({ q }) => {
  const tl = gsap.timeline({
    defaults: {
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
    },
  })

  tl.from(q('.header-pattern'), {
    y: -10,
    autoAlpha: 0,
    duration: 0.35,
  })
    .from(
      q('.header-back-btn'),
      { y: 12, autoAlpha: 0, duration: 0.25 },
      0.1,
    )
    .from(
      q('.header-title'),
      { y: 18, autoAlpha: 0, duration: 0.3 },
      0.15,
    )
    .from(
      q('.header-copy'),
      { y: 14, autoAlpha: 0, duration: 0.25 },
      0.22,
    )
})

useGsapContext(slotsGrid, ({ q }) => {
  const slots = q('.team-slot-root')
  if (!slots.length) return

  gsap.from(slots, {
    y: 20,
    scale: 0.97,
    opacity: 0,
    duration: 0.28,
    stagger: 0.04,
    ease: 'power3.out',
    delay: 0.15,
    clearProps: 'transform,opacity',
  })
})
</script>

<template>
  <main class="app-page min-h-screen">
    <header ref="pageHeader" class="pokemon-page-header pokemon-page-header--team relative overflow-hidden">
      <div
        class="header-pattern absolute inset-0 opacity-10"
        style="
          background-image:
            radial-gradient(circle at 20px 20px, white 8px, transparent 8px),
            radial-gradient(circle at 80px 80px, white 8px, transparent 8px);
          background-size: 100px 100px;
        "
      ></div>
      <div class="relative z-10 max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div class="flex items-center gap-4 mb-3 sm:mb-4">
          <button
            @click="router.back()"
            class="header-back-btn flex items-center gap-2 text-white/80 hover:text-white transition-colors font-semibold text-sm"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
        </div>
        <h1
          class="header-title text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white"
          style="
            font-family: 'Fredoka', sans-serif;
            text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
          "
        >
          Team Builder
        </h1>
        <p
          class="header-copy text-white/80 text-lg max-w-xl font-medium mt-2"
          style="text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2)"
        >
          Build your dream team of 6 and analyze type weaknesses
        </p>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <section class="page-panel rounded-3xl border-2 border-gray-100 p-4 sm:p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xl font-bold text-gray-900">
            Your Team
            <span class="text-sm font-semibold text-gray-600 ml-2"
              >({{ teamStore.teamSize }}/6)</span
            >
          </h2>
          <button
            v-if="teamStore.hasMembers"
            @click="teamStore.clearTeam()"
            class="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div ref="slotsGrid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <TeamSlot
            v-for="slot in slots"
            :key="slot.index"
            :id="slot.id"
            :name="slot.name"
            :types="slot.id ? (memberTypesMap.get(slot.id) ?? []) : []"
            :index="slot.index"
            class="team-slot-root"
            @add="openSelector"
            @remove="handleRemove"
          />
        </div>
      </section>

      <TeamWeaknessChart :team-types="teamTypes" />
    </div>

    <PokemonSelectorModal
      :open="showModal"
      :exclude-ids="teamIds"
      @select="handleSelect"
      @close="showModal = false"
    />
  </main>
</template>
