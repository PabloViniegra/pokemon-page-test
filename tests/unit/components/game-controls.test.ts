import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import GameControls from '../../../src/components/game/GameControls.vue'

function mountGameControls(props: {
  status: 'idle' | 'correct' | 'incorrect'
  attempts: number
  hintUsed?: boolean
  currentHint?: string
  isSpeciesLoading?: boolean
}) {
  return mount(GameControls, {
    props: {
      hintUsed: false,
      currentHint: '',
      isSpeciesLoading: false,
      ...props,
    },
  })
}

describe('GameControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Guess button when idle', () => {
    const wrapper = mountGameControls({ status: 'idle', attempts: 0 })
    expect(wrapper.text()).toContain('Guess')
    expect(wrapper.text()).toContain('Can you guess who this Pokémon is?')
  })

  it('renders Guess Again button when incorrect', () => {
    const wrapper = mountGameControls({ status: 'incorrect', attempts: 1 })
    expect(wrapper.text()).toContain('Guess Again')
    expect(wrapper.text()).toContain('Try again!')
    expect(wrapper.text()).toContain('Attempts: 1')
  })

  it('renders Next Pokémon button when correct', () => {
    const wrapper = mountGameControls({ status: 'correct', attempts: 1 })
    expect(wrapper.text()).toContain('Next Pokémon')
    expect(wrapper.text()).toContain('Correct!')
    expect(wrapper.text()).toContain('You got it in 1 attempt.')
  })

  it('emits guess event when Guess button is clicked', async () => {
    const wrapper = mountGameControls({ status: 'idle', attempts: 0 })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('Guess'))
    await btn!.trigger('click')
    expect(wrapper.emitted('guess')).toHaveLength(1)
  })

  it('emits guess event when Guess Again button is clicked', async () => {
    const wrapper = mountGameControls({ status: 'incorrect', attempts: 1 })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('Guess Again'))
    await btn!.trigger('click')
    expect(wrapper.emitted('guess')).toHaveLength(1)
  })

  it('emits next event when Next Pokémon button is clicked', async () => {
    const wrapper = mountGameControls({ status: 'correct', attempts: 1 })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('Next Pokémon'))
    await btn!.trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  it('shows Give a hint button when idle and hint not used', () => {
    const wrapper = mountGameControls({ status: 'idle', attempts: 0, hintUsed: false })
    expect(wrapper.text()).toContain('Give a hint')
  })

  it('shows Give a hint button when incorrect and hint not used', () => {
    const wrapper = mountGameControls({ status: 'incorrect', attempts: 1, hintUsed: false })
    expect(wrapper.text()).toContain('Give a hint')
  })

  it('hides Give a hint button when correct', () => {
    const wrapper = mountGameControls({ status: 'correct', attempts: 1, hintUsed: false })
    expect(wrapper.text()).not.toContain('Give a hint')
  })

  it('emits hint event when Give a hint button is clicked', async () => {
    const wrapper = mountGameControls({ status: 'idle', attempts: 0, hintUsed: false })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('Give a hint'))
    await btn!.trigger('click')
    expect(wrapper.emitted('hint')).toHaveLength(1)
  })

  it('disables hint button when species is loading', () => {
    const wrapper = mountGameControls({ status: 'idle', attempts: 0, hintUsed: false, isSpeciesLoading: true })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('Give a hint'))
    expect(btn!.attributes('disabled')).toBeDefined()
  })

  it('shows hint text when hint is used', () => {
    const wrapper = mountGameControls({
      status: 'idle',
      attempts: 0,
      hintUsed: true,
      currentHint: 'This Pokémon is an electric type.',
    })
    expect(wrapper.text()).toContain('This Pokémon is an electric type.')
    expect(wrapper.text()).not.toContain('Give a hint')
  })

  it('shows hint text when incorrect and hint is used', () => {
    const wrapper = mountGameControls({
      status: 'incorrect',
      attempts: 2,
      hintUsed: true,
      currentHint: 'This Pokémon is yellow in color.',
    })
    expect(wrapper.text()).toContain('This Pokémon is yellow in color.')
    expect(wrapper.text()).toContain('Guess Again')
    expect(wrapper.text()).not.toContain('Give a hint')
  })

  it('uses plural "attempts" when more than one', () => {
    const wrapper = mountGameControls({ status: 'correct', attempts: 2 })
    expect(wrapper.text()).toContain('You got it in 2 attempts.')
  })

  it('uses singular "attempt" when exactly one', () => {
    const wrapper = mountGameControls({ status: 'correct', attempts: 1 })
    expect(wrapper.text()).toContain('You got it in 1 attempt.')
  })
})
