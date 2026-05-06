import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import GameView from '../../views/GameView.vue'

const mockConfetti = vi.fn()
vi.mock('canvas-confetti', () => ({
  default: (...args: any[]) => mockConfetti(...args),
}))

const mockMakeGuess = vi.fn()
const mockNextRound = vi.fn()
const mockRecordRound = vi.fn()

const mockStatus = ref<'idle' | 'correct' | 'incorrect'>('idle')
const mockAttempts = ref(0)
const mockIsRevealed = ref(false)
const mockIsLoading = ref(false)
const mockIsError = ref(false)
const mockCurrentPokemon = ref({ id: 25, name: 'pikachu' })

vi.mock('../../composables/useWhoIsThatPokemonGame', () => ({
  useWhoIsThatPokemonGame: vi.fn(() => ({
    targetId: ref(25),
    status: mockStatus,
    attempts: mockAttempts,
    currentPokemon: mockCurrentPokemon,
    isLoading: mockIsLoading,
    isError: mockIsError,
    isRevealed: mockIsRevealed,
    makeGuess: mockMakeGuess,
    nextRound: mockNextRound,
  })),
}))

vi.mock('../../stores/gameStats', () => ({
  useGameStatsStore: vi.fn(() => ({
    totalRoundsPlayed: 0,
    totalCorrectGuesses: 0,
    totalAttempts: 0,
    recordRound: mockRecordRound,
  })),
}))

function mountGameView() {
  return mount(GameView, {
    global: {
      stubs: {
        PokemonSelectorModal: {
          name: 'PokemonSelectorModal',
          props: ['open'],
          template: '<div class="modal-stub" v-if="open"><slot /></div>',
        },
      },
    },
  })
}

describe('GameView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStatus.value = 'idle'
    mockAttempts.value = 0
    mockIsRevealed.value = false
    mockIsLoading.value = false
    mockIsError.value = false
    mockCurrentPokemon.value = { id: 25, name: 'pikachu' }
  })

  it('renders the game title and silhouette', async () => {
    const wrapper = mountGameView()
    await flushPromises()
    expect(wrapper.text()).toContain("Who's that Pokémon?")
    expect(wrapper.find('img').exists()).toBe(true)
  })

  it('shows the Guess button when idle', async () => {
    const wrapper = mountGameView()
    await flushPromises()
    const buttons = wrapper.findAll('button')
    const btn = buttons.find((b) => b.text().includes('Guess'))
    expect(btn).toBeDefined()
  })

  it('opens the selector modal on Guess click', async () => {
    const wrapper = mountGameView()
    await flushPromises()
    const buttons = wrapper.findAll('button')
    const btn = buttons.find((b) => b.text().includes('Guess'))
    await btn!.trigger('click')
    await nextTick()
    expect(wrapper.find('.modal-stub').exists()).toBe(true)
  })

  it('calls makeGuess and records stats on correct answer', async () => {
    const wrapper = mountGameView()
    await flushPromises()
    const modal = wrapper.findComponent({ name: 'PokemonSelectorModal' })
    await modal.vm.$emit('select', 25, 'pikachu')
    expect(mockMakeGuess).toHaveBeenCalledWith('pikachu')

    mockStatus.value = 'correct'
    mockAttempts.value = 2
    await nextTick()
    await flushPromises()

    expect(mockRecordRound).toHaveBeenCalledWith(true, 2)
    expect(mockConfetti).toHaveBeenCalled()
  })

  it('shows try again message after incorrect guess', async () => {
    mockStatus.value = 'incorrect'
    mockAttempts.value = 1
    const wrapper = mountGameView()
    await flushPromises()
    expect(wrapper.text()).toContain('Try again!')
  })

  it('shows Next Pokémon button after correct guess', async () => {
    mockStatus.value = 'correct'
    mockAttempts.value = 1
    const wrapper = mountGameView()
    await flushPromises()
    const buttons = wrapper.findAll('button')
    const btn = buttons.find((b) => b.text().includes('Next Pokémon'))
    expect(btn).toBeDefined()
  })

  it('calls nextRound when Next Pokémon is clicked', async () => {
    mockStatus.value = 'correct'
    mockAttempts.value = 1
    const wrapper = mountGameView()
    await flushPromises()
    const buttons = wrapper.findAll('button')
    const btn = buttons.find((b) => b.text().includes('Next Pokémon'))
    await btn!.trigger('click')
    expect(mockNextRound).toHaveBeenCalled()
  })
})
