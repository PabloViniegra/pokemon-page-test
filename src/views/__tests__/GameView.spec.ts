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
const mockUseHint = vi.fn()
const mockRecordRound = vi.fn()

const mockStatus = ref<'idle' | 'correct' | 'incorrect'>('idle')
const mockAttempts = ref(0)
const mockIsRevealed = ref(false)
const mockIsLoading = ref(false)
const mockIsError = ref(false)
const mockCurrentPokemon = ref({
  id: 25,
  name: 'pikachu',
  types: [{ slot: 1, type: { name: 'electric', url: 'https://pokeapi.co/type/13' } }],
})
const mockHintUsed = ref(false)
const mockCurrentHint = ref('')
const mockIsSpeciesLoading = ref(false)

vi.mock('../../composables/useWhoIsThatPokemonGame', () => ({
  useWhoIsThatPokemonGame: vi.fn(() => ({
    targetId: ref(25),
    status: mockStatus,
    attempts: mockAttempts,
    currentPokemon: mockCurrentPokemon,
    isLoading: mockIsLoading,
    isError: mockIsError,
    isRevealed: mockIsRevealed,
    hintUsed: mockHintUsed,
    currentHint: mockCurrentHint,
    isSpeciesLoading: mockIsSpeciesLoading,
    makeGuess: mockMakeGuess,
    useHint: mockUseHint,
    nextRound: mockNextRound,
  })),
}))

vi.mock('../../composables/usePokemonQueries', () => ({
  useAllPokemonListQuery: vi.fn(() => ({
    data: ref({
      results: [
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
        { name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7/' },
        { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon/133/' },
      ],
    }),
  })),
}))

vi.mock('../../stores/gameStats', () => ({
  useGameStatsStore: vi.fn(() => ({
    totalRoundsPlayed: 0,
    totalCorrectGuesses: 0,
    totalAttempts: 0,
    currentStreak: 0,
    bestStreak: 0,
    recordRound: mockRecordRound,
  })),
}))

function createMatchMediaResult(matches: boolean): MediaQueryList {
  return {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }
}

function mountGameView() {
  return mount(GameView)
}

describe('GameView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('matchMedia', vi.fn(() => createMatchMediaResult(false)))

    mockStatus.value = 'idle'
    mockAttempts.value = 0
    mockIsRevealed.value = false
    mockIsLoading.value = false
    mockIsError.value = false
    mockCurrentPokemon.value = {
      id: 25,
      name: 'pikachu',
      types: [{ slot: 1, type: { name: 'electric', url: 'https://pokeapi.co/type/13' } }],
    }
    mockHintUsed.value = false
    mockCurrentHint.value = ''
    mockIsSpeciesLoading.value = false
  })

  it('renders title and silhouette', async () => {
    const wrapper = mountGameView()
    await flushPromises()

    expect(wrapper.text()).toContain("Who's that Pokémon?")
    expect(wrapper.find('img').exists()).toBe(true)
  })

  it('renders four answer choices when idle', async () => {
    const wrapper = mountGameView()
    await flushPromises()

    const answerButtons = wrapper.findAll('[role="group"] button')
    expect(answerButtons).toHaveLength(4)
  })

  it('calls makeGuess when an answer choice is clicked', async () => {
    const wrapper = mountGameView()
    await flushPromises()

    const pikachuButton = wrapper
      .findAll('[role="group"] button')
      .find((button) => button.text().includes('pikachu'))
    await pikachuButton!.trigger('click')

    expect(mockMakeGuess).toHaveBeenCalledWith('pikachu')
  })

  it('records successful round and triggers confetti on status change to correct', async () => {
    mountGameView()
    await flushPromises()

    mockAttempts.value = 2
    mockStatus.value = 'correct'
    await nextTick()
    await flushPromises()

    expect(mockRecordRound).toHaveBeenCalledWith(true, 2)
    expect(mockConfetti).toHaveBeenCalled()
  })

  it('shows incorrect feedback when status is incorrect', async () => {
    mockStatus.value = 'incorrect'
    mockAttempts.value = 1

    const wrapper = mountGameView()
    await flushPromises()

    expect(wrapper.text()).toContain('Not quite!')
    expect(wrapper.text()).toContain('Attempt 1')
  })

  it('shows Next Pokémon button when status is correct', async () => {
    mockStatus.value = 'correct'
    mockAttempts.value = 1

    const wrapper = mountGameView()
    await flushPromises()

    const nextButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Next Pokémon'))
    expect(nextButton).toBeDefined()
  })

  it('calls nextRound when Next Pokémon is clicked', async () => {
    mockStatus.value = 'correct'
    mockAttempts.value = 1

    const wrapper = mountGameView()
    await flushPromises()

    const nextButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Next Pokémon'))
    await nextButton!.trigger('click')

    expect(mockNextRound).toHaveBeenCalled()
  })

  it('shows Give a hint button when idle', async () => {
    const wrapper = mountGameView()
    await flushPromises()

    expect(wrapper.text()).toContain('Give a hint')
  })

  it('calls useHint when Give a hint is clicked', async () => {
    const wrapper = mountGameView()
    await flushPromises()

    const hintButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Give a hint'))
    await hintButton!.trigger('click')

    expect(mockUseHint).toHaveBeenCalled()
  })

  it('shows hint text and hides hint button when hint is used', async () => {
    mockHintUsed.value = true
    mockCurrentHint.value = 'It is an electric type and was introduced in GENERATION-I.'

    const wrapper = mountGameView()
    await flushPromises()

    expect(wrapper.text()).toContain(
      'It is an electric type and was introduced in GENERATION-I.',
    )
    expect(wrapper.text()).not.toContain('Give a hint')
  })

  it('hides the hint button when status is correct', async () => {
    mockStatus.value = 'correct'
    const wrapper = mountGameView()
    await flushPromises()

    expect(wrapper.text()).not.toContain('Give a hint')
  })
})
