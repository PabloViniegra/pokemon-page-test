import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GameControls from '../../../src/components/game/GameControls.vue'

function mountGameControls(
  props: Partial<{
    status: 'idle' | 'correct' | 'incorrect'
    attempts: number
    hintUsed: boolean
    currentHint: string
    isSpeciesLoading: boolean
    choices: string[]
    correctName: string
  }> = {},
) {
  return mount(GameControls, {
    props: {
      status: 'idle',
      attempts: 0,
      hintUsed: false,
      currentHint: '',
      isSpeciesLoading: false,
      choices: ['pikachu', 'bulbasaur', 'charmander', 'squirtle'],
      correctName: 'pikachu',
      ...props,
    },
  })
}

describe('GameControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders four answer choices when idle', () => {
    const wrapper = mountGameControls()
    const answerButtons = wrapper.findAll('[role="group"] button')
    expect(answerButtons).toHaveLength(4)
    expect(wrapper.text()).toContain('pikachu')
    expect(wrapper.text()).toContain('bulbasaur')
  })

  it('emits select event with selected answer', async () => {
    const wrapper = mountGameControls()
    const pikachuButton = wrapper
      .findAll('[role="group"] button')
      .find((button) => button.text().includes('pikachu'))
    await pikachuButton!.trigger('click')
    expect(wrapper.emitted('select')).toEqual([['pikachu']])
  })

  it('marks wrong selected choice as disabled on incorrect state', async () => {
    const wrapper = mountGameControls({ status: 'incorrect', attempts: 1 })
    const wrongButton = wrapper
      .findAll('[role="group"] button')
      .find((button) => button.text().includes('bulbasaur'))
    await wrongButton!.trigger('click')
    expect(wrapper.emitted('select')).toEqual([['bulbasaur']])
    expect(wrongButton!.attributes('disabled')).toBeDefined()
  })

  it('renders incorrect feedback with attempt count', () => {
    const wrapper = mountGameControls({ status: 'incorrect', attempts: 2 })
    expect(wrapper.text()).toContain('Not quite!')
    expect(wrapper.text()).toContain('Attempt 2')
  })

  it('renders success feedback and next button when correct', () => {
    const wrapper = mountGameControls({ status: 'correct', attempts: 1 })
    expect(wrapper.text()).toContain('Correct!')
    expect(wrapper.text()).toContain('You got it in 1 attempt.')
    expect(wrapper.text()).toContain('Next Pokémon')
  })

  it('uses plural attempts label for more than one attempt', () => {
    const wrapper = mountGameControls({ status: 'correct', attempts: 3 })
    expect(wrapper.text()).toContain('You got it in 3 attempts.')
  })

  it('emits next event when Next Pokémon is clicked', async () => {
    const wrapper = mountGameControls({ status: 'correct', attempts: 1 })
    const nextButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Next Pokémon'))
    await nextButton!.trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  it('shows Give a hint button when hint is unused and not correct', () => {
    const wrapper = mountGameControls({ status: 'idle', hintUsed: false })
    expect(wrapper.text()).toContain('Give a hint')
  })

  it('emits hint event when Give a hint is clicked', async () => {
    const wrapper = mountGameControls({ status: 'idle', hintUsed: false })
    const hintButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Give a hint'))
    await hintButton!.trigger('click')
    expect(wrapper.emitted('hint')).toHaveLength(1)
  })

  it('disables hint button when species is loading', () => {
    const wrapper = mountGameControls({
      status: 'idle',
      isSpeciesLoading: true,
    })
    const hintButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Give a hint'))
    expect(hintButton!.attributes('disabled')).toBeDefined()
  })

  it('shows hint text and hides hint button when hint is used', () => {
    const wrapper = mountGameControls({
      status: 'incorrect',
      attempts: 1,
      hintUsed: true,
      currentHint: 'It is an electric type and was introduced in GENERATION-I.',
    })
    expect(wrapper.text()).toContain(
      'It is an electric type and was introduced in GENERATION-I.',
    )
    expect(wrapper.text()).not.toContain('Give a hint')
  })
})
