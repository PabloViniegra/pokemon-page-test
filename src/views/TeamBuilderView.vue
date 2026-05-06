<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { useTeamStore } from '../stores/team'
import { getPokemonDetail } from '../helpers/pokemon-api'
import { pokemonKeys } from '../composables/usePokemonQueries'
import { useTeamDetailQueries } from '../composables/useTeamDetailQueries'
import TeamSlot from '../components/TeamSlot.vue'
import PokemonSelectorModal from '../components/PokemonSelectorModal.vue'
import TeamWeaknessChart from '../components/TeamWeaknessChart.vue'

const router = useRouter()
const teamStore = useTeamStore()
const queryClient = useQueryClient()
const { teamTypes, memberTypesMap } = useTeamDetailQueries()

const activeSlotIndex = ref<number | null>(null)
const showModal = ref(false)

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
</script>

<template>
  <main class="min-h-screen bg-[#f8f8f8]">
    <!-- Header -->
    <header
      class="relative overflow-hidden"
      style="
        background: linear-gradient(
          135deg,
          #3b4cca 0%,
          #2a3693 50%,
          #1a2266 100%
        );
      "
    >
      <div
        class="absolute inset-0 opacity-10"
        style="
          background-image:
            radial-gradient(circle at 20px 20px, white 8px, transparent 8px),
            radial-gradient(circle at 80px 80px, white 8px, transparent 8px);
          background-size: 100px 100px;
        "
      ></div>
      <div class="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div class="flex items-center gap-4 mb-4">
          <button
            @click="router.back()"
            class="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-semibold text-sm"
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
          class="text-4xl md:text-5xl font-black tracking-tighter text-white"
          style="
            font-family: 'Fredoka', sans-serif;
            text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
          "
        >
          Team Builder
        </h1>
        <p
          class="text-white/80 text-lg max-w-xl font-medium mt-2"
          style="text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2)"
        >
          Build your dream team of 6 and analyze type weaknesses
        </p>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <!-- Team slots -->
      <section class="bg-white rounded-3xl border-2 border-gray-100 p-6">
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

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <TeamSlot
            v-for="slot in slots"
            :key="slot.index"
            :id="slot.id"
            :name="slot.name"
            :types="slot.id ? (memberTypesMap.get(slot.id) ?? []) : []"
            :index="slot.index"
            @add="openSelector"
            @remove="handleRemove"
          />
        </div>
      </section>

      <!-- Weakness chart -->
      <TeamWeaknessChart :team-types="teamTypes" />
    </div>

    <!-- Selector modal -->
    <PokemonSelectorModal
      :open="showModal"
      :exclude-ids="teamIds"
      @select="handleSelect"
      @close="showModal = false"
    />
  </main>
</template>
