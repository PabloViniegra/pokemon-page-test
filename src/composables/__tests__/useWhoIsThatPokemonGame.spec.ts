import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useWhoIsThatPokemonGame } from '../useWhoIsThatPokemonGame'
import type { PokemonDetail } from '../../types/pokemon'

const mockPokemon: PokemonDetail = {
  id: 25,
  name: 'pikachu',
  sprites: {},
  types: [],
  stats: [],
  abilities: [],
  moves: [],
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

vi.mock('../usePokemonQueries', () => ({
  usePokemonDetailQuery: vi.fn(() => ({
    data: ref(mockPokemon),
    isLoading: ref(false),
    isError: ref(false),
    refetch: vi.fn(),
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
  })
})
