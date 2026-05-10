import { ref, computed } from 'vue'
import { usePokemonDetailQuery, usePokemonSpeciesQuery } from './usePokemonQueries'
import type { PokemonDetail, PokemonSpeciesInfo, PokemonType } from '../types/pokemon'

export type GameStatus = 'idle' | 'correct' | 'incorrect'

const TOTAL_POKEMON = 1025

function getRandomPokemonId(): number {
  return Math.floor(Math.random() * TOTAL_POKEMON) + 1
}

function formatTypes(types: PokemonType[]): string {
  const names = types.map((t) => t.type.name)
  if (names.length === 1) return `a ${names[0]} type`
  return `a ${names.join('/')} type`
}

function generateHint(pokemon: PokemonDetail, species: PokemonSpeciesInfo): string {
  const typeHint = formatTypes(pokemon.types)
  const gen = species.generation?.name
  const color = species.color?.name

  // Prefer the most informative hints first
  if (gen) {
    return `It is ${typeHint} and was introduced in ${gen.replace('generation-', 'Generation ').toUpperCase()}.`
  }
  if (color) {
    return `It is ${typeHint} and is ${color} in color.`
  }
  return `It is ${typeHint} and its name starts with "${pokemon.name[0].toUpperCase()}".`
}

export function useWhoIsThatPokemonGame() {
  const targetId = ref<number>(getRandomPokemonId())
  const status = ref<GameStatus>('idle')
  const attempts = ref(0)
  const currentHint = ref('')
  const hintUsed = ref(false)

  const { data: pokemon, isLoading, isError, refetch } = usePokemonDetailQuery(targetId)
  const { data: species, isLoading: isSpeciesLoading } = usePokemonSpeciesQuery(targetId)

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

  function useHint() {
    if (hintUsed.value || !currentPokemon.value || !species.value) return
    currentHint.value = generateHint(currentPokemon.value, species.value)
    hintUsed.value = true
  }

  function nextRound() {
    status.value = 'idle'
    attempts.value = 0
    currentHint.value = ''
    hintUsed.value = false
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
    currentHint,
    hintUsed,
    isSpeciesLoading,
    makeGuess,
    useHint,
    nextRound,
  }
}
