<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { EvolutionNode } from '../types/pokemon'
import { computeEvolutionStages } from '../helpers/pokemon-api'

interface Props {
  node: EvolutionNode
  accentColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  accentColor: '#A8A77A',
})

const router = useRouter()

const stages = computed(() => computeEvolutionStages(props.node))

function navigateToPokemon(id: number) {
  router.push(`/pokemon/${id}`)
}
</script>

<template>
  <div
    class="evo-stages flex items-start overflow-x-auto pb-4 pt-2"
    :style="{ '--evo-accent': accentColor }"
  >
    <template v-for="(stage, si) in stages" :key="stage.depth">
      <!-- Arrow connector between stages -->
      <div
        v-if="si > 0"
        class="evo-arrow flex flex-col items-center justify-center self-stretch px-1 sm:px-2"
      >
        <svg
          class="w-5 h-5 shrink-0"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 4l6 6-6 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- Stage column -->
      <div class="evo-stage flex flex-col gap-3">
        <template
          v-for="(entry, ei) in stage.entries"
          :key="entry.node.speciesId"
        >
          <!-- Extra spacing between groups with different parents -->
          <div
            v-if="ei > 0 && entry.parentId !== stage.entries[ei - 1].parentId"
            class="h-3"
          ></div>

          <div class="evo-entry flex flex-col items-center gap-1">
            <div
              v-if="entry.condition"
              class="evo-entry__condition"
              :style="{ backgroundColor: accentColor }"
            >
              {{ entry.condition }}
            </div>

            <button
              class="evo-entry__card group"
              :aria-label="`View ${entry.node.speciesName} details`"
              @click="navigateToPokemon(entry.node.speciesId)"
            >
              <div class="evo-entry__avatar">
                <img
                  :src="entry.node.imageUrl"
                  :alt="entry.node.speciesName"
                  class="evo-entry__img"
                  loading="lazy"
                />
              </div>
              <span class="evo-entry__name">{{ entry.node.speciesName }}</span>
            </button>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.evo-stages {
  --evo-accent: #a8a77a;
}

.evo-arrow {
  color: #9ca3af;
  min-width: 1.25rem;
}

@media (min-width: 640px) {
  .evo-arrow {
    min-width: 2rem;
  }
}

.evo-stage {
  min-width: 8.5rem;
}

@media (min-width: 640px) {
  .evo-stage {
    min-width: 10rem;
  }
}

.evo-entry__condition {
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.3;
  color: white;
  text-align: center;
  max-width: 9rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@media (min-width: 640px) {
  .evo-entry__condition {
    font-size: 11px;
    max-width: 10rem;
  }
}

.evo-entry__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 0.75rem;
  border: none;
  background: none;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.evo-entry__card:hover {
  transform: scale(1.05);
}

.evo-entry__card:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px white, 0 0 0 4px var(--evo-accent);
  border-radius: 0.75rem;
}

.evo-entry__avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: box-shadow 0.15s ease;
}

.evo-entry__card:hover .evo-entry__avatar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

@media (min-width: 640px) {
  .evo-entry__avatar {
    width: 5rem;
    height: 5rem;
  }
}

.evo-entry__img {
  width: 3.5rem;
  height: 3.5rem;
  object-fit: contain;
}

@media (min-width: 640px) {
  .evo-entry__img {
    width: 4rem;
    height: 4rem;
  }
}

.evo-entry__name {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
  color: #374151;
  transition: color 0.15s ease;
}

.evo-entry__card:hover .evo-entry__name {
  color: #111827;
}

@media (min-width: 640px) {
  .evo-entry__name {
    font-size: 0.875rem;
  }
}
</style>