<script setup lang="ts">
import { gsap } from 'gsap'
import type { PokemonDetail, PokemonSpeciesInfo } from '../types/pokemon'
import { getPokemonImageUrl } from '../helpers/pokemon-api'
import PokemonTypeBadge from './PokemonTypeBadge.vue'
import { TYPE_COLORS } from '../types/pokemon'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { useGsapContext } from '../composables/useGsapContext'
import { useFavoritesStore } from '../stores/favorites'

const props = defineProps<{
  pokemon: PokemonDetail
  species: PokemonSpeciesInfo | undefined
  showShiny: boolean
}>()

defineEmits<{
  'update:showShiny': [value: boolean]
  back: []
}>()

const favoritesStore = useFavoritesStore()
const isFavorited = computed(() => favoritesStore.isFavorite(props.pokemon.id))

const mainImage = computed(() =>
  getPokemonImageUrl(props.pokemon.id, props.showShiny),
)

const description = computed(() => {
  if (!props.species) return ''
  const entry = props.species.flavor_text_entries.find(
    (e) => e.language.name === 'en',
  )
  return entry ? entry.flavor_text.replace(/\f/g, ' ') : ''
})

const genus = computed(() => {
  if (!props.species) return ''
  const g = props.species.genera.find((g) => g.language.name === 'en')
  return g ? g.genus : ''
})

const primaryTypeColor = computed(() => {
  if (!props.pokemon.types[0]) return '#A8A77A'
  return TYPE_COLORS[props.pokemon.types[0].type.name]?.color || '#A8A77A'
})

const heroRoot = useTemplateRef<HTMLElement>('heroRoot')
const artworkImageRef = useTemplateRef<HTMLImageElement>('artworkImageRef')
const haloRef = useTemplateRef<HTMLElement>('haloRef')
const favoriteRippleRef = useTemplateRef<HTMLElement>('favoriteRippleRef')
const favoriteIconRef = useTemplateRef<SVGSVGElement>('favoriteIconRef')

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

useGsapContext(heroRoot, ({ q }) => {
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from(q('.hero-back'), {
      y: -18,
      autoAlpha: 0,
      duration: 0.32,
    })
    .from(
      q('.hero-id'),
      {
        y: 18,
        autoAlpha: 0,
        duration: 0.34,
      },
      0.06,
    )
    .from(
      q('.hero-artwork-shell'),
      {
        y: 74,
        autoAlpha: 0,
        scale: 0.84,
        duration: 0.82,
        ease: 'expo.out',
      },
      0.1,
    )
    .from(
      q('.hero-halo'),
      {
        scale: 0.66,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power2.out',
      },
      0.12,
    )
    .from(
      q('.hero-title-row'),
      {
        y: 34,
        autoAlpha: 0,
        duration: 0.5,
      },
      0.44,
    )
    .from(
      q('.hero-genus'),
      {
        y: 22,
        autoAlpha: 0,
        duration: 0.36,
      },
      0.54,
    )
    .from(
      q('.hero-types > *'),
      {
        y: 22,
        autoAlpha: 0,
        scale: 0.92,
        stagger: 0.09,
        duration: 0.38,
      },
      0.6,
    )
    .from(
      q('.hero-description'),
      {
        y: 32,
        autoAlpha: 0,
        duration: 0.5,
      },
      0.68,
    )
    .from(
      q('.hero-meta > *'),
      {
        y: 24,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.32,
      },
      0.74,
    )
    .from(
      q('.hero-toggle'),
      {
        y: 22,
        autoAlpha: 0,
        duration: 0.3,
      },
      0.8,
    )
})

watch(
  () => props.showShiny,
  async (_, previous) => {
    if (previous === undefined || prefersReducedMotion()) return

    await nextTick()

    if (!artworkImageRef.value || !haloRef.value) return

    gsap.killTweensOf([artworkImageRef.value, haloRef.value])

    gsap.fromTo(
      artworkImageRef.value,
      {
        autoAlpha: 0.56,
        scale: 0.88,
        rotation: previous ? 4 : -4,
      },
      {
        autoAlpha: 1,
        scale: 1,
        rotation: 0,
        duration: 0.5,
        ease: 'power4.out',
      },
    )

    gsap.fromTo(
      haloRef.value,
      {
        scale: 0.88,
        autoAlpha: 0.18,
      },
      {
        scale: 1.18,
        autoAlpha: 0.42,
        duration: 0.28,
        ease: 'power3.out',
        yoyo: true,
        repeat: 1,
      },
    )
  },
)

watch(
  isFavorited,
  async (favorited, previous) => {
    if (previous === undefined || prefersReducedMotion()) return

    await nextTick()

    if (!favoriteIconRef.value || !favoriteRippleRef.value) return

    gsap.killTweensOf([favoriteIconRef.value, favoriteRippleRef.value])

    if (favorited) {
      gsap.fromTo(
        favoriteRippleRef.value,
        {
          scale: 0.4,
          autoAlpha: 0.55,
        },
        {
          scale: 1.95,
          autoAlpha: 0,
          duration: 0.52,
          ease: 'power2.out',
        },
      )

      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .fromTo(
          favoriteIconRef.value,
          {
            scale: 0.84,
            rotation: -16,
          },
          {
            scale: 1.28,
            rotation: 0,
            duration: 0.2,
          },
        )
        .to(favoriteIconRef.value, {
          scale: 1,
          duration: 0.2,
          ease: 'power2.inOut',
        })

      return
    }

    gsap.fromTo(
      favoriteIconRef.value,
      {
        scale: 1.04,
      },
      {
        scale: 0.92,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        ease: 'power1.out',
      },
    )
  },
)
</script>

<template>
  <section
    ref="heroRoot"
    class="relative overflow-hidden"
    :style="{
      background: `linear-gradient(135deg, ${primaryTypeColor}15 0%, ${primaryTypeColor}05 50%, transparent 100%)`,
    }"
  >
    <div
      class="absolute right-0 top-0 w-64 sm:w-96 h-64 sm:h-96 opacity-5 transform translate-x-1/4 -translate-y-1/4"
    >
      <svg viewBox="0 0 100 100" class="w-full h-full">
        <circle cx="50" cy="50" r="50" fill="#333" />
        <path d="M0 50 Q50 20 100 50" fill="#f00" />
        <path d="M0 50 Q50 80 100 50" fill="white" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#333" stroke-width="8" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="#333" stroke-width="8" />
        <circle
          cx="50"
          cy="50"
          r="12"
          fill="white"
          stroke="#333"
          stroke-width="4"
        />
      </svg>
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <button
        @click="$emit('back')"
        class="hero-back mb-6 sm:mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold text-sm group"
      >
        <span class="group-hover:-translate-x-1 transition-transform">←</span>
        Back to Pokédex
      </button>

      <div class="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div class="relative flex flex-col items-center">
          <div class="hero-artwork-shell relative w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96">
            <div
              ref="haloRef"
              class="hero-halo absolute inset-0 rounded-full opacity-20 blur-3xl"
              :style="{ backgroundColor: primaryTypeColor }"
            ></div>
            <img
              ref="artworkImageRef"
              :src="mainImage"
              :alt="pokemon.name"
              class="hero-artwork-image relative w-full h-full object-contain drop-shadow-xl"
            />
          </div>

          <button
            @click="$emit('update:showShiny', !showShiny)"
            class="hero-toggle mt-6 px-5 py-2 rounded-full border-2 border-gray-200 bg-white hover:bg-gray-100 transition-all font-bold text-sm flex items-center gap-2 shadow-sm"
            :class="{
              'border-yellow-400 text-yellow-600 bg-yellow-50': showShiny,
            }"
          >
            <span>✨</span>
            {{ showShiny ? 'Shiny' : 'Normal' }}
          </button>
        </div>

        <div class="space-y-6">
          <div>
            <p class="hero-id text-gray-600 font-bold text-sm mb-1">
              #{{ String(pokemon.id).padStart(4, '0') }}
            </p>
            <div class="hero-title-row flex items-center gap-3 flex-wrap">
              <h1
                class="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black capitalize tracking-tight text-gray-900"
                style="font-family: 'Fredoka', sans-serif"
              >
                {{ pokemon.name }}
              </h1>
              <button
                @click="favoritesStore.toggleFavorite(pokemon.id)"
                class="hero-favorite fav-hero-btn relative isolate overflow-visible flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 bg-white transition-all duration-300 shadow-sm hover:shadow-md mt-1"
                :class="
                  isFavorited
                    ? 'border-red-300 text-red-500 bg-red-50/80 hover:border-red-400'
                    : 'border-gray-200 text-gray-300 hover:border-red-300 hover:text-red-400'
                "
                :aria-label="
                  isFavorited ? 'Remove from favorites' : 'Add to favorites'
                "
              >
                <span ref="favoriteRippleRef" class="hero-favorite-ripple"></span>
                <svg
                  ref="favoriteIconRef"
                  class="w-5 h-5 fav-heart"
                  :class="{ 'fav-heart--active': isFavorited }"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  />
                </svg>
              </button>
            </div>
            <p v-if="genus" class="hero-genus text-gray-500 font-medium mt-2">
              {{ genus }}
            </p>
          </div>

          <div class="hero-types flex flex-wrap gap-2">
            <PokemonTypeBadge
              v-for="t in pokemon.types"
              :key="t.type.name"
              :pokemon-type="t.type.name"
            />
          </div>

          <p v-if="description" class="hero-description text-gray-600 leading-relaxed text-lg">
            {{ description }}
          </p>

          <div class="hero-meta flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="text-gray-600 font-bold">Height</span>
              <span class="font-black text-gray-900 font-mono"
                >{{ pokemon.height / 10
                }}<span class="text-gray-600 font-medium ml-0.5">m</span></span
              >
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-600 font-bold">Weight</span>
              <span class="font-black text-gray-900 font-mono"
                >{{ pokemon.weight / 10
                }}<span class="text-gray-600 font-medium ml-0.5">kg</span></span
              >
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-600 font-bold">Base XP</span>
              <span class="font-black text-gray-900 font-mono">{{
                pokemon.base_experience
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-artwork-image {
  will-change: transform, opacity;
}

.hero-favorite-ripple {
  position: absolute;
  inset: -0.35rem;
  border: 2px solid rgba(239, 68, 68, 0.38);
  border-radius: 9999px;
  opacity: 0;
  pointer-events: none;
}

.fav-heart {
  transition:
    fill 0.2s ease,
    stroke 0.2s ease;
}

.fav-heart--active {
  fill: #ef4444;
  stroke: #ef4444;
}
</style>
