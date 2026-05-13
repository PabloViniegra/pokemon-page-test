<script setup lang="ts">
import { computed, watch, nextTick, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { TYPE_COLORS } from '../types/pokemon'
import { analyzeTeamWeaknesses } from '../helpers/type-chart'
import type { PokemonTypeName } from '../helpers/type-chart'

const props = defineProps<{
  teamTypes: PokemonTypeName[][]
}>()

const analysis = computed(() => analyzeTeamWeaknesses(props.teamTypes))

const sortedAnalysis = computed(() => {
  return [...analysis.value].sort(
    (a, b) => b.averageEffectiveness - a.averageEffectiveness,
  )
})

const maxAvg = computed(() => {
  return Math.max(...analysis.value.map((a) => a.averageEffectiveness), 1)
})

function getBarBgClass(avg: number): string {
  if (avg >= 2) return 'bg-red-500'
  if (avg > 1) return 'bg-orange-500'
  if (avg === 1) return 'bg-yellow-500'
  if (avg < 1 && avg > 0) return 'bg-green-500'
  return 'bg-gray-500'
}

function getWarningText(item: (typeof analysis.value)[number]): string | null {
  if (item.weakCount === props.teamTypes.length && props.teamTypes.length > 0) {
    return `Your whole team is weak to ${item.type}!`
  }
  if (item.weakCount >= 3) {
    return `${item.weakCount} of your Pokémon are weak to ${item.type}`
  }
  return null
}

const vulnerabilitySummary = computed(() => {
  const critical = analysis.value.filter(
    (a) => a.weakCount === props.teamTypes.length && props.teamTypes.length > 0,
  )
  const major = analysis.value.filter(
    (a) => a.weakCount >= 3 && a.weakCount < props.teamTypes.length,
  )
  const resistant = analysis.value.filter(
    (a) =>
      a.resistantCount + a.immuneCount === props.teamTypes.length &&
      props.teamTypes.length > 0,
  )
  return { critical, major, resistant }
})

const chartRoot = useTemplateRef<HTMLElement>('chartRoot')

function animateBars() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  nextTick(() => {
    const root = chartRoot.value
    if (!root) return

    const bars = root.querySelectorAll<HTMLElement>('.matchup-bar')
    const labels = root.querySelectorAll<HTMLElement>('.matchup-label')

    bars.forEach((bar, i) => {
      const item = sortedAnalysis.value[i]
      if (!item) return

      const targetWidth = `${Math.min((item.averageEffectiveness / maxAvg.value) * 100, 100)}%`

      gsap.killTweensOf(bar)
      gsap.fromTo(
        bar,
        { width: '0%' },
        {
          width: targetWidth,
          duration: 0.22,
          ease: 'power2.out',
        },
      )
    })

    labels.forEach((label) => {
      gsap.killTweensOf(label)
      gsap.fromTo(
        label,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.15,
          delay: 0.12,
          ease: 'power2.out',
        },
      )
    })
  })
}

watch(
  () => props.teamTypes,
  () => {
    if (props.teamTypes.length > 0) {
      animateBars()
    }
  },
  { immediate: true, flush: 'post' },
)

function onAlertEnter(el: Element, done: () => void) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    done()
    return
  }
  gsap.from(el, {
    x: -16,
    autoAlpha: 0,
    duration: 0.2,
    ease: 'power3.out',
    onComplete: done,
    clearProps: 'transform,opacity,visibility',
  })
}

function onAlertLeave(el: Element, done: () => void) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    done()
    return
  }
  gsap.to(el, {
    x: 16,
    autoAlpha: 0,
    duration: 0.15,
    ease: 'power2.in',
    onComplete: done,
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Summary alerts -->
    <TransitionGroup
      tag="div"
      class="space-y-3"
      @enter="onAlertEnter"
      @leave="onAlertLeave"
    >
      <div
        v-for="item in vulnerabilitySummary.critical"
        :key="`critical-${item.type}`"
        class="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3"
      >
        <div
          class="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <p class="font-bold text-red-700 text-sm">
            Critical vulnerability detected!
          </p>
          <p class="text-red-600 text-xs">{{ getWarningText(item) }}</p>
        </div>
      </div>

      <div
        v-for="item in vulnerabilitySummary.major"
        :key="`major-${item.type}`"
        class="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3"
      >
        <div
          class="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <p class="font-bold text-orange-700 text-sm">Major vulnerability</p>
          <p class="text-orange-600 text-xs">{{ getWarningText(item) }}</p>
        </div>
      </div>

      <div
        v-for="item in vulnerabilitySummary.resistant"
        :key="`resistant-${item.type}`"
        class="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3"
      >
        <div
          class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <p class="font-bold text-green-700 text-sm">Team strength</p>
          <p class="text-green-600 text-xs">
            Your whole team resists {{ item.type }}!
          </p>
        </div>
      </div>
    </TransitionGroup>

    <!-- Chart -->
    <div ref="chartRoot" class="bg-white rounded-3xl border-2 border-gray-100 p-5">
      <h3 class="text-lg font-bold text-gray-900 mb-4">
        Type Matchup Analysis
      </h3>

      <div v-if="teamTypes.length === 0" class="text-center py-8 text-gray-600">
        <p class="font-medium">
          Add Pokémon to your team to see weakness analysis
        </p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="item in sortedAnalysis" :key="item.type" class="group">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div class="flex items-center justify-between gap-2">
              <div
                class="w-24 shrink-0 rounded-xl px-2 py-1 text-center"
                :style="{
                  backgroundColor: TYPE_COLORS[item.type]?.color ?? '#999',
                }"
              >
                <span class="text-xs font-bold text-white capitalize">{{
                  item.type
                }}</span>
              </div>

              <div class="shrink-0 flex gap-2 text-[10px] font-semibold">
                <span v-if="item.weakCount > 0" class="text-red-500"
                  >{{ item.weakCount }} weak</span
                >
                <span v-if="item.resistantCount > 0" class="text-green-500"
                  >{{ item.resistantCount }} resist</span
                >
                <span v-if="item.immuneCount > 0" class="text-gray-500"
                  >{{ item.immuneCount }} immune</span
                >
              </div>
            </div>

            <div
              class="flex-1 h-8 bg-gray-100 rounded-xl overflow-hidden relative"
            >
              <div
                class="matchup-bar h-full rounded-xl flex items-center px-2"
                :class="getBarBgClass(item.averageEffectiveness)"
                :style="{
                  width: `${Math.min((item.averageEffectiveness / maxAvg) * 100, 100)}%`,
                }"
              >
                <span
                  class="matchup-label text-[10px] font-bold text-white whitespace-nowrap"
                >
                  {{ item.averageEffectiveness.toFixed(2) }}x
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
