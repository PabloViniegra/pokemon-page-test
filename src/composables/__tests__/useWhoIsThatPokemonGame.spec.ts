import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useWhoIsThatPokemonGame } from '../useWhoIsThatPokemonGame'
import type { PokemonDetail, PokemonSpeciesInfo } from '../../types/pokemon'

const mockPokemon: PokemonDetail = {
  id: 25,
  name: 'pikachu',
  sprites: {},
  types: [{ slot: 1, type: { name: 'electric', url: '' } }],
  stats: [],
  abilities: [{ ability: { name: 'static', url: '' }, is_hidden: false, slot: 1 }],
  moves: [{ move: { name: 'thunderbolt', url: '' }, version_group_details: [] }],
  height: 4,
  weight: 60,
  base_experience: 112,
  species: { name: 'pikachu', url: '' },
  order: 25,
  forms: [],
  game_indices: [],
  held_items: [],
  is_default: true,
  location_area_encounters: '',
  past_types: [],
} as unknown as PokemonDetail

const mockSpecies: PokemonSpeciesInfo = {
  id: 25,
  name: 'pikachu',
  generation: { name: 'generation-i', url: '' },
  color: { name: 'yellow', url: '' },
  flavor_text_entries: [
    {
      flavor_text: 'It keeps its tail\nraised to monitor\nits surroundings.',
      language: { name: 'en', url: '' },
      version: { name: 'red', url: '' },
    },
  ],
} as unknown as PokemonSpeciesInfo

vi.mock('../usePokemonQueries', () => ({
  usePokemonDetailQuery: vi.fn(() => ({
    data: ref(mockPokemon),
    isLoading: ref(false),
    isError: ref(false),
    refetch: vi.fn(),
  })),
  usePokemonSpeciesQuery: vi.fn(() => ({
    data: ref(mockSpecies),
    isLoading: ref(false),
  })),
}))

describe('useWhoIsThatPokemonGame', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts in idle status with zero attempts', () => {
    const game = useWhoIsThatPokemonGame()
    expect(game.status.value).toBe('idle')
    expect(game.attempts.value).toBe(0)
    expect(game.isRevealed.value).toBe(false)
    expect(game.hintUsed.value).toBe(false)
    expect(game.currentHint.value).toBe('')
  })

  it('transitions to correct on exact name match', () => {
    const game = useWhoIsThatPokemonGame()
    game.makeGuess('pikachu')
    expect(game.status.value).toBe('correct')
    expect(game.attempts.value).toBe(1)
    expect(game.isRevealed.value).toBe(true)
  })

  it('transitions to incorrect on wrong guess', () => {
    const game = useWhoIsThatPokemonGame()
    game.makeGuess('charmander')
    expect(game.status.value).toBe('incorrect')
    expect(game.attempts.value).toBe(1)
    expect(game.isRevealed.value).toBe(false)
  })

  it('allows multiple attempts until correct', () => {
    const game = useWhoIsThatPokemonGame()
    game.makeGuess('bulbasaur')
    game.makeGuess('squirtle')
    game.makeGuess('pikachu')
    expect(game.status.value).toBe('correct')
    expect(game.attempts.value).toBe(3)
  })

  it('ignores case and whitespace in guesses', () => {
    const game = useWhoIsThatPokemonGame()
    game.makeGuess('  Pikachu  ')
    expect(game.status.value).toBe('correct')
  })

  it('does not accept guesses after correct answer', () => {
    const game = useWhoIsThatPokemonGame()
    game.makeGuess('pikachu')
    game.makeGuess('charmander')
    expect(game.attempts.value).toBe(1)
  })

  it('resets state on nextRound', () => {
    const game = useWhoIsThatPokemonGame()
    game.makeGuess('pikachu')
    game.nextRound()
    expect(game.status.value).toBe('idle')
    expect(game.attempts.value).toBe(0)
    expect(game.isRevealed.value).toBe(false)
    expect(game.hintUsed.value).toBe(false)
    expect(game.currentHint.value).toBe('')
  })

  it('generates a hint when useHint is called', () => {
    const game = useWhoIsThatPokemonGame()
    expect(game.hintUsed.value).toBe(false)
    game.useHint()
    expect(game.hintUsed.value).toBe(true)
    expect(game.currentHint.value.length).toBeGreaterThan(0)
  })

  it('does not generate a hint twice', () => {
    const game = useWhoIsThatPokemonGame()
    game.useHint()
    const firstHint = game.currentHint.value
    game.useHint()
    expect(game.currentHint.value).toBe(firstHint)
  })
})
