<script setup lang="ts">
import { gsap } from 'gsap'
import { computed } from 'vue'
import { useTemplateRef } from 'vue'
import { useGsapContext } from '../composables/useGsapContext'
import type { EvolutionNode, EvolutionStage } from '../types/pokemon'
import { computeEvolutionStages } from '../helpers/pokemon-api'

interface Props {
  node: EvolutionNode
  accentColor?: string
  currentPokemonId?: number
}

const props = withDefaults(defineProps<Props>(), {
  accentColor: '#A8A77A',
  currentPokemonId: 0,
})
const treeRef = useTemplateRef<HTMLElement>('treeRef')

const stages = computed(() => computeEvolutionStages(props.node))

interface BranchGroup {
  parentId: number | null
  entries: EvolutionStage['entries']
}

interface GroupedStage {
  depth: number
  groups: BranchGroup[]
}

const groupedStages = computed<GroupedStage[]>(() => {
  return stages.value.map((stage) => {
    const groups: BranchGroup[] = []
    for (const entry of stage.entries) {
      const lastGroup = groups[groups.length - 1]
      if (lastGroup && lastGroup.parentId === entry.parentId) {
        lastGroup.entries.push(entry)
      } else {
        groups.push({ parentId: entry.parentId, entries: [entry] })
      }
    }
    return { depth: stage.depth, groups }
  })
})

useGsapContext(treeRef, ({ root, q }) => {
  gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: {
      trigger: root,
      start: 'top 80%',
      once: true,
    },
  })
    .from(q('.evo-connector-rail'), {
      scaleY: 0,
      transformOrigin: 'top center',
      stagger: 0.1,
      duration: 0.44,
    })
    .from(
      q('.evo-branch'),
      {
        x: -16,
        autoAlpha: 0,
        stagger: 0.05,
        duration: 0.24,
      },
      '-=0.16',
    )
    .from(
      q('.evo-entry__card'),
      {
        y: 26,
        autoAlpha: 0,
        scale: 0.9,
        stagger: 0.1,
        duration: 0.36,
      },
      '-=0.02',
    )
})
</script>

<template>
  <div
    ref="treeRef"
    class="evo-tree"
    :style="{ '--evo-accent': accentColor }"
  >
    <template v-for="(stage, si) in groupedStages" :key="stage.depth">
      <!-- Connector between stages -->
      <div
        v-if="si > 0"
        class="evo-connector"
        aria-hidden="true"
      >
        <div class="evo-connector-rail">
          <template
            v-for="(group, gi) in stage.groups"
            :key="group.parentId"
          >
            <div
              v-for="entry in group.entries"
              :key="entry.node.speciesId"
              class="evo-branch"
            >
              <span
                v-if="entry.condition"
                class="evo-condition"
              >
                {{ entry.condition }}
              </span>
            </div>
            <div
              v-if="gi < stage.groups.length - 1"
              class="evo-group-gap"
            ></div>
          </template>
        </div>
      </div>

      <!-- Stage column -->
      <div class="evo-stage">
        <template
          v-for="(group, gi) in stage.groups"
          :key="group.parentId"
        >
          <div v-for="entry in group.entries" :key="entry.node.speciesId" class="evo-entry">
            <router-link
              class="evo-entry__card"
              :to="{ name: 'pokemon-detail', params: { id: entry.node.speciesId } }"
              :class="{
                'evo-entry__card--current':
                  entry.node.speciesId === currentPokemonId,
              }"
              :aria-label="`View ${entry.node.speciesName} details`"
            >
              <div class="evo-entry__avatar">
                <img
                  :src="entry.node.imageUrl"
                  :alt="entry.node.speciesName"
                  width="56"
                  height="56"
                  class="evo-entry__img"
                  loading="lazy"
                />
              </div>
              <span class="evo-entry__name">
                {{ entry.node.speciesName }}
              </span>
              <span
                v-if="entry.node.speciesId === currentPokemonId"
                class="evo-entry__badge"
              >
                Current
              </span>
            </router-link>
          </div>
          <div
            v-if="gi < stage.groups.length - 1"
            class="evo-group-gap"
          ></div>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.evo-tree {
  --evo-accent: #a8a77a;
  position: relative;
  display: flex;
  padding-bottom: 1rem;
  padding-top: 0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.evo-connector {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-self: stretch;
  min-width: 2.5rem;
  padding: 0 0.25rem;
  flex-shrink: 0;
}

.evo-connector-rail {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  border-left: 2px solid var(--app-border-strong);
  position: relative;
  padding-left: 0.75rem;
}

.evo-branch {
  display: flex;
  align-items: center;
  position: relative;
  padding: 0.5rem 0;
  min-height: 5.5rem;
}

.evo-branch::before {
  content: '';
  position: absolute;
  left: -0.75rem;
  top: 50%;
  width: 0.75rem;
  height: 2px;
  background: var(--app-border-strong);
  transform: translateY(-50%);
}

.evo-condition {
  font-size: 0.625rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--app-text-soft);
  text-align: left;
  max-width: 6rem;
  word-break: break-word;
}

.evo-stage {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 7rem;
  min-width: 7rem;
  flex-shrink: 0;
}

.evo-entry {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  min-height: 5.5rem;
}

.evo-group-gap {
  height: 1.5rem;
  flex-shrink: 0;
}

.evo-entry__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 0.375rem;
  padding: 0.5rem;
  border-radius: 0.75rem;
  border: 2px solid transparent;
  background: none;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.evo-entry__card:hover {
  transform: scale(1.05);
}

.evo-entry__card:focus-visible {
  outline: none;
  border-color: var(--evo-accent);
}

.evo-entry__card--current {
  border-color: var(--evo-accent);
  background: var(--app-surface-muted);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.evo-entry__avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  background: var(--app-surface-soft);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: box-shadow 0.15s ease;
}

.evo-entry__card:hover .evo-entry__avatar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

.evo-entry__card--current .evo-entry__avatar {
  box-shadow:
    0 0 0 2px var(--evo-accent),
    0 4px 12px rgba(0, 0, 0, 0.18);
}

.evo-entry__img {
  width: 3rem;
  height: 3rem;
  object-fit: contain;
}

.evo-entry__name {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
  color: var(--app-text);
  transition: color 0.15s ease;
}

.evo-entry__badge {
  font-size: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  background: var(--evo-accent);
  color: white;
}

@media (min-width: 640px) {
  .evo-connector {
    min-width: 4rem;
    padding: 0 0.5rem;
  }

  .evo-connector-rail {
    padding-left: 1rem;
  }

  .evo-branch {
    min-height: 7rem;
  }

  .evo-branch::before {
    left: -1rem;
    width: 1rem;
  }

  .evo-condition {
    font-size: 0.6875rem;
    max-width: 8rem;
  }

  .evo-stage {
    width: 8.5rem;
    min-width: 8.5rem;
  }

  .evo-entry {
    min-height: 7rem;
  }

  .evo-entry__avatar {
    width: 4.5rem;
    height: 4.5rem;
  }

  .evo-entry__img {
    width: 3.5rem;
    height: 3.5rem;
  }

  .evo-entry__name {
    font-size: 0.875rem;
  }
}
</style>
