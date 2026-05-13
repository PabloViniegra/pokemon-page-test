import { computed, onBeforeUnmount, onDeactivated, ref } from 'vue'
import type { PokemonDetail } from '../types/pokemon'
import { usePokemonDetailQuery } from './usePokemonQueries'

const SUMMARY_DELAY_MS = 150
const SUMMARY_OFFSET_PX = 12
const SUMMARY_WIDTH_PX = 224
const VIEWPORT_PADDING_PX = 16
const TOP_PLACEMENT_MIN_PX = 176

export interface PokemonHoverSummaryTrigger {
  name: string
  id: number
  accentColor: string | null
  anchorEl: HTMLElement
}

interface PokemonHoverSummarySnapshot {
  id: number
  accentColor: string | null
  anchorRect: {
    top: number
    bottom: number
    left: number
    width: number
  }
}

interface PokemonHoverSummaryPosition {
  top: number
  left: number
  placement: 'top' | 'bottom'
}

function getAnchorRect(anchorEl: HTMLElement) {
  const { top, bottom, left, width } = anchorEl.getBoundingClientRect()

  return {
    top,
    bottom,
    left,
    width,
  }
}

function clampTooltipLeft(anchorLeft: number, anchorWidth: number) {
  const centeredLeft = anchorLeft + anchorWidth / 2
  const minLeft = VIEWPORT_PADDING_PX + SUMMARY_WIDTH_PX / 2
  const maxLeft = Math.max(
    minLeft,
    window.innerWidth - VIEWPORT_PADDING_PX - SUMMARY_WIDTH_PX / 2,
  )

  return Math.min(Math.max(centeredLeft, minLeft), maxLeft)
}

export function usePokemonHoverSummary() {
  const hoveredSummary = ref<PokemonHoverSummarySnapshot | null>(null)
  const delayElapsed = ref(false)
  let delayTimer: ReturnType<typeof setTimeout> | null = null

  const hoveredPokemonId = computed(() => hoveredSummary.value?.id ?? 0)
  const { data } = usePokemonDetailQuery(
    hoveredPokemonId,
    computed(() => hoveredSummary.value !== null),
  )

  function clearDelayTimer() {
    if (delayTimer !== null) {
      clearTimeout(delayTimer)
      delayTimer = null
    }
  }

  function showSummary(payload: PokemonHoverSummaryTrigger) {
    clearDelayTimer()
    hoveredSummary.value = {
      id: payload.id,
      accentColor: payload.accentColor,
      anchorRect: getAnchorRect(payload.anchorEl),
    }
    delayElapsed.value = false
    delayTimer = setTimeout(() => {
      delayElapsed.value = true
    }, SUMMARY_DELAY_MS)
  }

  function hideSummary() {
    clearDelayTimer()
    delayElapsed.value = false
    hoveredSummary.value = null
  }

  const summaryPosition = computed<PokemonHoverSummaryPosition | null>(() => {
    const anchorRect = hoveredSummary.value?.anchorRect

    if (!anchorRect) {
      return null
    }

    const placement = anchorRect.top > TOP_PLACEMENT_MIN_PX ? 'top' : 'bottom'

    return {
      top:
        placement === 'top'
          ? anchorRect.top - SUMMARY_OFFSET_PX
          : anchorRect.bottom + SUMMARY_OFFSET_PX,
      left: clampTooltipLeft(anchorRect.left, anchorRect.width),
      placement,
    }
  })

  const summaryPokemon = computed<PokemonDetail | null>(() => data.value ?? null)
  const summaryAccentColor = computed(() => hoveredSummary.value?.accentColor ?? null)
  const isSummaryVisible = computed(
    () => delayElapsed.value && summaryPosition.value !== null && !!summaryPokemon.value,
  )

  onBeforeUnmount(() => {
    hideSummary()
  })

  onDeactivated(() => {
    hideSummary()
  })

  return {
    summaryPokemon,
    summaryAccentColor,
    summaryPosition,
    isSummaryVisible,
    showSummary,
    hideSummary,
  }
}
