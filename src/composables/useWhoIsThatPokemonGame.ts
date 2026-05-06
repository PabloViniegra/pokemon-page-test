import { ref, computed } from 'vue'
import { usePokemonDetailQuery } from './usePokemonQueries'
import type { PokemonDetail } from '../types/pokemon'

export type GameStatus = 'idle' | 'correct' | 'incorrect'

const TOTAL_POKEMON = 1025

function getRandomPokemonId(): number {
  return Math.floor(Math.random() * TOTAL_POKEMON) + 1
}

export function useWhoIsThatPokemonGame() {
  const targetId = ref<number>(getRandomPokemonId())
  const status = ref<GameStatus>('idle')
  const attempts = ref(0)

  const { data: pokemon, isLoading, isError, refetch } = usePokemonDetailQuery(targetId)

  const currentPokemon = computed<PokemonDetail | undefined>(() => pokemon.value)
  const isRevealed = computed(() => status.value === 'correct')

  function makeGuess(guessedName: string) {
    if (!currentPokemon.value || status.value === 'correct') return

    const normalizedGuess = guessedName.trim().toLowerCase()
    const normalizedAnswer = currentPokemon.value.name.trim().toLowerCase()

    attempts.value += 1

    if (normalizedGuess === normalizedAnswer) {
      status.value = 'correct'
    } else {
      status.value = 'incorrect'
    }
  }

  function nextRound() {
    status.value = 'idle'
    attempts.value = 0
    targetId.value = getRandomPokemonId()
    refetch()
  }

  return {
    targetId,
    status,
    attempts,
    currentPokemon,
    isLoading,
    isError,
    isRevealed,
    makeGuess,
    nextRound,
  }
}
