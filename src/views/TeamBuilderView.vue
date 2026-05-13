<script setup lang="ts">
import { ref, computed, useTemplateRef, watch } from 'vue'
import { gsap } from 'gsap'
import { useRoute, useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { useTeamStore } from '../stores/team'
import { getPokemonDetail } from '../helpers/pokemon-api'
import { pokemonKeys } from '../composables/usePokemonQueries'
import { useTeamDetailQueries } from '../composables/useTeamDetailQueries'
import { useTeamSuggestions } from '../composables/useTeamSuggestions'
import { useGsapContext } from '../composables/useGsapContext'
import TeamSlot from '../components/TeamSlot.vue'
import PokemonSelectorModal from '../components/PokemonSelectorModal.vue'
import TeamWeaknessChart from '../components/TeamWeaknessChart.vue'
import TeamSuggestionsPanel from '../components/TeamSuggestionsPanel.vue'

type ActiveTab = 'analysis' | 'suggestions'

const route = useRoute()
const router = useRouter()
const teamStore = useTeamStore()
const queryClient = useQueryClient()
const { teamTypes, memberTypesMap } = useTeamDetailQueries()
const {
  helpfulTypes,
  suggestedPokemon,
  isLoading: suggestionsLoading,
  isError: suggestionsError,
} = useTeamSuggestions()

const activeSlotIndex = ref<number | null>(null)
const showModal = ref(false)

const activeTab = ref<ActiveTab>('analysis')

let syncingTabFromUrl = false
let syncingTabToUrl = false

const tabs = [
  {
    key: 'analysis' as const,
    label: 'Weakness Analysis',
    caption: 'Spot stacked vulnerabilities before they become a problem.',
  },
  {
    key: 'suggestions' as const,
    label: 'Suggestions',
    caption: 'See the next picks that keep the squad balanced.',
  },
]

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

function readTabFromUrl() {
  syncingTabFromUrl = true
  activeTab.value = route.query.tab === 'suggestions' ? 'suggestions' : 'analysis'
  syncingTabFromUrl = false
}

function writeTabToUrl(tab: ActiveTab) {
  if (syncingTabFromUrl) return

  syncingTabToUrl = true
  const query = { ...route.query }

  if (tab === 'analysis') {
    delete query.tab
  } else {
    query.tab = tab
  }

  void router.replace({ query })
  syncingTabToUrl = false
}

watch(
  () => route.query.tab,
  () => {
    if (syncingTabToUrl) return
    readTabFromUrl()
  },
)

watch(activeTab, writeTabToUrl)

readTabFromUrl()

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

function handleSuggestionSelect(id: number, name: string) {
  if (teamStore.isFull) return
  teamStore.addMember({ id, name })
  queryClient.prefetchQuery({
    queryKey: pokemonKeys.detail(id),
    queryFn: () => getPokemonDetail(id),
    staleTime: 1000 * 60 * 60 * 24,
  })
}

function setActiveTab(tab: ActiveTab) {
  activeTab.value = tab
}

function handleClearTeam() {
  if (!window.confirm('Clear all 6 team slots?')) return
  teamStore.clearTeam()
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
  <main id="main-content" class="app-page min-h-screen">
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
            @click="handleClearTeam"
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

      <section class="space-y-4">
        <div
          class="relative overflow-hidden rounded-[2rem] border border-blue-100/80 bg-[linear-gradient(135deg,rgba(231,243,255,0.96),rgba(255,250,230,0.92))] p-4 shadow-[0_22px_50px_rgba(37,99,235,0.10)] dark:border-[rgba(90,110,154,0.28)] dark:bg-[linear-gradient(135deg,#0c1222,#131d35)] dark:shadow-[0_22px_50px_rgba(0,0,0,0.35)] sm:p-5"
        >
          <div
            class="absolute inset-0 opacity-60 dark:opacity-30"
            style="
              background-image:
                radial-gradient(circle at 20px 20px, rgba(59, 76, 202, 0.14) 6px, transparent 6px),
                radial-gradient(circle at 86px 54px, rgba(255, 203, 5, 0.18) 8px, transparent 8px),
                linear-gradient(135deg, rgba(255, 255, 255, 0.6), transparent 46%);
              background-size: 120px 120px, 160px 160px, 100% 100%;
            "
          ></div>

          <div class="relative z-10 space-y-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="max-w-2xl">
                <p
                  class="text-[11px] font-black uppercase tracking-[0.32em] text-blue-700/70 dark:text-blue-400/70"
                >
                  Team Insights
                </p>
                <h2
                  class="mt-2 font-display text-2xl leading-tight text-gray-900 dark:text-[var(--app-text)] sm:text-[2rem]"
                >
                  Keep the battle plan one tap away.
                </h2>
                <p class="mt-2 max-w-xl text-sm font-semibold text-gray-600 dark:text-[var(--app-text-muted)] sm:text-[15px]">
                  Swap between matchup pressure and suggested additions without losing sight of your squad.
                </p>
              </div>

              <div
                class="hidden shrink-0 rounded-[1.4rem] border border-white/70 bg-white/75 px-4 py-3 shadow-[0_16px_32px_rgba(15,23,42,0.08)] dark:border-[rgba(90,110,154,0.28)] dark:bg-[rgba(10,16,29,0.85)] dark:shadow-[0_16px_32px_rgba(0,0,0,0.25)] sm:block"
              >
                <p class="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600/70 dark:text-blue-400/70">
                  Active View
                </p>
                <p class="mt-1 font-display text-lg text-gray-900 dark:text-[var(--app-text)]">
                  {{ activeTab === 'analysis' ? 'Weakness Radar' : 'Next Best Picks' }}
                </p>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                class="group relative overflow-hidden rounded-[1.6rem] border px-4 py-4 text-left transition-[transform,background-color,border-color,color,box-shadow] duration-200 sm:px-5 sm:py-4"
                :class="
                  activeTab === tab.key
                    ? 'border-white/80 bg-[linear-gradient(135deg,#4f66f8_0%,#3659d8_52%,#243aa6_100%)] text-white shadow-[0_18px_34px_rgba(59,76,202,0.34)]'
                    : 'border-white/70 bg-white/78 text-gray-700 shadow-[0_12px_28px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white dark:border-[rgba(90,110,154,0.28)] dark:bg-[rgba(10,16,29,0.82)] dark:text-[var(--app-text-muted)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.25)] dark:hover:border-[rgba(90,110,154,0.40)] dark:hover:bg-[rgba(10,16,29,0.95)]'
                "
                :aria-pressed="activeTab === tab.key"
                @click="setActiveTab(tab.key)"
              >
                <div
                  v-if="activeTab === tab.key"
                  class="absolute inset-x-5 top-0 h-10 rounded-b-full bg-white/18 blur-xl"
                ></div>

                <div class="relative z-10 flex items-start gap-3">
                  <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-colors"
                    :class="
                      activeTab === tab.key
                        ? 'border-white/30 bg-white/16 text-white'
                        : 'border-blue-100 bg-blue-50 text-blue-700 group-hover:bg-blue-100 dark:border-[rgba(90,110,154,0.25)] dark:bg-[rgba(59,130,246,0.12)] dark:text-blue-400 dark:group-hover:bg-[rgba(59,130,246,0.20)]'
                    "
                  >
                    <svg
                      v-if="tab.key === 'analysis'"
                      class="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 20V10m5 10V4m5 16v-7"
                      />
                    </svg>
                    <svg
                      v-else
                      class="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9.813 15.904 9 18l-1.813-2.096L5 15l2.187-.904L9 12l.813 2.096L12 15l-2.187.904ZM18 13l-.973 2.292L14.5 16.5l2.527 1.208L18 20l.973-2.292L21.5 16.5l-2.527-1.208L18 13Z"
                      />
                    </svg>
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-3">
                      <p
                        class="font-display text-lg leading-tight sm:text-[1.35rem]"
                      >
                        {{ tab.label }}
                      </p>
                      <span
                        class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em]"
                        :class="
                          activeTab === tab.key
                            ? 'bg-white/18 text-white'
                            : 'bg-blue-50 text-blue-700 dark:bg-[rgba(59,130,246,0.12)] dark:text-blue-400'
                        "
                      >
                        {{ activeTab === tab.key ? 'Selected' : 'Open' }}
                      </span>
                    </div>
                    <p
                      class="mt-2 text-sm leading-relaxed"
                      :class="
                        activeTab === tab.key ? 'text-white/84' : 'text-gray-500 dark:text-[var(--app-text-soft)]'
                      "
                    >
                      {{ tab.caption }}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="relative px-1 sm:px-2">
          <div
            class="rounded-[1.75rem] border border-white/70 bg-white/72 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-[rgba(90,110,154,0.28)] dark:bg-[rgba(10,16,29,0.85)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:p-4"
          >
            <TeamWeaknessChart
              v-if="activeTab === 'analysis'"
              :team-types="teamTypes"
            />
            <TeamSuggestionsPanel
              v-else
              :helpful-types="helpfulTypes"
              :suggested-pokemon="suggestedPokemon"
              :is-loading="suggestionsLoading"
              :is-error="suggestionsError"
              :team-size="teamStore.teamSize"
              :is-full="teamStore.isFull"
              @select-pokemon="handleSuggestionSelect"
            />
          </div>
        </div>
      </section>
    </div>

    <PokemonSelectorModal
      :open="showModal"
      :exclude-ids="teamIds"
      @select="handleSelect"
      @close="showModal = false"
    />
  </main>
</template>
