<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { gsap } from 'gsap'
import { getPokemonImageUrl } from '../../helpers/pokemon-api'

const props = defineProps<{
  pokemonId: number
  revealed: boolean
  shake: boolean
  typeColor?: string
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const frameRef = ref<HTMLDivElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const scannerRef = ref<HTMLDivElement | null>(null)

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function isReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION).matches
}

function animateReveal() {
  if (!imageRef.value || !frameRef.value || !scannerRef.value) return
  if (isReducedMotion()) {
    gsap.set(imageRef.value, { scale: 1, filter: 'brightness(1)' })
    gsap.set(frameRef.value, { opacity: 1 })
    return
  }
  gsap.killTweensOf([imageRef.value, frameRef.value, scannerRef.value])

  gsap.set(scannerRef.value, { clipPath: 'inset(0 100% 0 0)', opacity: 1 })

  const tl = gsap.timeline()

  tl.to(scannerRef.value, {
    clipPath: 'inset(0 0% 0 0)',
    duration: 0.28,
    ease: 'power2.inOut',
  })
    .to(
      imageRef.value,
      {
        scale: 1.05,
        filter: 'brightness(1)',
        duration: 0.22,
        ease: 'power2.out',
      },
      0.1,
    )
    .to(
      imageRef.value,
      {
        scale: 1,
        duration: 0.15,
        ease: 'power2.out',
      },
      0.32,
    )
    .to(scannerRef.value, { opacity: 0, duration: 0.12, ease: 'power2.in' }, 0.32)
    .to(frameRef.value, { opacity: 1, duration: 0.18, ease: 'power2.out' }, 0.1)
}

function animateRecoil() {
  if (!containerRef.value || isReducedMotion()) return
  gsap.killTweensOf(containerRef.value)
  gsap.fromTo(
    containerRef.value,
    { x: 0 },
    {
      x: -10,
      duration: 0.08,
      ease: 'power2.in',
      yoyo: true,
      repeat: 5,
    },
  )
}

function resetSilhouette() {
  if (!imageRef.value || !frameRef.value || !scannerRef.value) return
  gsap.killTweensOf([imageRef.value, frameRef.value, scannerRef.value])
  gsap.set(imageRef.value, { scale: 1, filter: 'brightness(0)' })
  gsap.set(scannerRef.value, { opacity: 0 })
  gsap.set(frameRef.value, { opacity: 0.4 })
}

watch(() => props.revealed, (revealed) => {
  if (revealed) animateReveal()
})

watch(() => props.shake, (shaking) => {
  if (shaking) animateRecoil()
})

watch(() => props.pokemonId, () => {
  resetSilhouette()
})

onMounted(() => {
  resetSilhouette()
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-full aspect-square max-w-sm mx-auto flex items-center justify-center"
  >
    <div
      ref="frameRef"
      class="absolute inset-0 rounded-3xl border-4 transition-colors duration-700"
      :style="typeColor ? { borderColor: typeColor } : undefined"
      :class="revealed ? 'opacity-100' : 'opacity-40'"
    ></div>
    <div
      ref="scannerRef"
      class="absolute inset-0 rounded-3xl pointer-events-none z-10 overflow-hidden"
      style="clip-path: inset(0 100% 0 0); opacity: 0;"
      :style="typeColor ? { background: `linear-gradient(90deg, transparent 0%, ${typeColor}60 50%, transparent 100%)` } : undefined"
    ></div>
    <img
      ref="imageRef"
      :src="getPokemonImageUrl(props.pokemonId)"
      alt="Mystery Pokémon"
      width="320"
      height="320"
      class="w-full h-full object-contain p-4"
      :class="revealed ? 'drop-shadow-2xl' : ''"
      draggable="false"
    />
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  img {
    transition: none;
  }
}
</style>
