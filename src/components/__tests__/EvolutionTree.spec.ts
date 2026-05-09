import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EvolutionTree from '../EvolutionTree.vue'
import type { EvolutionNode } from '../../types/pokemon'

const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

function createNode(
  speciesName: string,
  speciesId: number,
  details: EvolutionNode['details'] = [],
  evolvesTo: EvolutionNode[] = [],
): EvolutionNode {
  return {
    speciesName,
    speciesId,
    imageUrl: `https://example.com/${speciesId}.png`,
    details,
    isBaby: false,
    evolvesTo,
  }
}

describe('EvolutionTree', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a single pokemon with no evolutions', () => {
    const node = createNode('mew', 151)
    const wrapper = mount(EvolutionTree, {
      props: { node },
    })
    expect(wrapper.text()).toContain('mew')
    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/151.png')
    expect(wrapper.findAll('.evo-stage')).toHaveLength(1)
  })

  it('renders a linear evolution chain', () => {
    const node = createNode('bulbasaur', 1, [], [
      createNode('ivysaur', 2, [
        { trigger: { name: 'level-up' }, min_level: 16 } as any,
      ], [
        createNode('venusaur', 3, [
          { trigger: { name: 'level-up' }, min_level: 32 } as any,
        ]),
      ]),
    ])
    const wrapper = mount(EvolutionTree, {
      props: { node },
    })

    expect(wrapper.text()).toContain('bulbasaur')
    expect(wrapper.text()).toContain('ivysaur')
    expect(wrapper.text()).toContain('venusaur')
    expect(wrapper.text()).toContain('Level 16')
    expect(wrapper.text()).toContain('Level 32')
    expect(wrapper.findAll('.evo-stage')).toHaveLength(3)
  })

  it('renders a branching chain (eevee)', () => {
    const node = createNode('eevee', 133, [], [
      createNode('vaporeon', 134, [
        { trigger: { name: 'use-item' }, item: { name: 'water-stone' } } as any,
      ]),
      createNode('jolteon', 135, [
        { trigger: { name: 'use-item' }, item: { name: 'thunder-stone' } } as any,
      ]),
      createNode('flareon', 136, [
        { trigger: { name: 'use-item' }, item: { name: 'fire-stone' } } as any,
      ]),
    ])
    const wrapper = mount(EvolutionTree, {
      props: { node },
    })

    expect(wrapper.text()).toContain('eevee')
    expect(wrapper.text()).toContain('vaporeon')
    expect(wrapper.text()).toContain('jolteon')
    expect(wrapper.text()).toContain('flareon')
    expect(wrapper.text()).toContain('water-stone')
    expect(wrapper.text()).toContain('thunder-stone')
    expect(wrapper.text()).toContain('fire-stone')
    expect(wrapper.findAll('.evo-stage')).toHaveLength(2)
    expect(wrapper.findAll('.evo-entry')).toHaveLength(4)
  })

  it('renders wide branching chains without dropping children', () => {
    const children = [
      createNode('vaporeon', 134),
      createNode('jolteon', 135),
      createNode('flareon', 136),
      createNode('espeon', 196),
      createNode('umbreon', 197),
      createNode('leafeon', 470),
      createNode('glaceon', 471),
      createNode('sylveon', 700),
    ]
    const node = createNode('eevee', 133, [], children)
    const wrapper = mount(EvolutionTree, {
      props: { node },
    })

    const entries = wrapper.findAll('.evo-entry')
    expect(entries).toHaveLength(9)
    expect(wrapper.text()).toContain('sylveon')
    expect(wrapper.text()).toContain('vaporeon')
  })

  it('navigates to pokemon detail on click', async () => {
    const node = createNode('pikachu', 25)
    const wrapper = mount(EvolutionTree, {
      props: { node },
    })
    await wrapper.find('.evo-entry__card').trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/pokemon/25')
  })

  it('applies accent color to condition badges', () => {
    const node = createNode('bulbasaur', 1, [], [
      createNode('ivysaur', 2, [
        { trigger: { name: 'level-up' }, min_level: 16 } as any,
      ]),
    ])
    const wrapper = mount(EvolutionTree, {
      props: { node, accentColor: '#EE8130' },
    })
    const badge = wrapper.find('.evo-entry__condition')
    expect(badge.exists()).toBe(true)
    expect(badge.attributes('style')).toContain('238, 129, 48')
  })

  it('does not show condition badge for the root pokemon', () => {
    const node = createNode('mew', 151)
    const wrapper = mount(EvolutionTree, {
      props: { node },
    })
    expect(wrapper.find('.evo-entry__condition').exists()).toBe(false)
  })

  it('renders arrow connectors between stages', () => {
    const node = createNode('charmander', 4, [], [
      createNode('charmeleon', 5, [
        { trigger: { name: 'level-up' }, min_level: 16 } as any,
      ]),
    ])
    const wrapper = mount(EvolutionTree, {
      props: { node },
    })
    const arrows = wrapper.findAll('.evo-arrow')
    expect(arrows).toHaveLength(1)
  })

  it('renders no arrows for single-stage chain', () => {
    const node = createNode('mew', 151)
    const wrapper = mount(EvolutionTree, {
      props: { node },
    })
    expect(wrapper.findAll('.evo-arrow')).toHaveLength(0)
  })

  it('adds spacing between groups with different parents', () => {
    const node = createNode('poliwag', 60, [], [
      createNode('poliwhirl', 61, [
        { trigger: { name: 'level-up' }, min_level: 25 } as any,
      ], [
        createNode('poliwrath', 62, [
          { trigger: { name: 'use-item' }, item: { name: 'water-stone' } } as any,
        ]),
        createNode('politoed', 186, [
          { trigger: { name: 'trade' } } as any,
        ]),
      ]),
    ])
    const wrapper = mount(EvolutionTree, {
      props: { node },
    })

    expect(wrapper.text()).toContain('poliwrath')
    expect(wrapper.text()).toContain('politoed')
    expect(wrapper.findAll('.evo-stage')).toHaveLength(3)
  })

  it('has accessible labels on cards', () => {
    const node = createNode('mew', 151)
    const wrapper = mount(EvolutionTree, {
      props: { node },
    })
    expect(wrapper.find('.evo-entry__card').attributes('aria-label')).toBe('View mew details')
  })
})