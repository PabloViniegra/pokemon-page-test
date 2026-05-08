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

function randomItem<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

function cleanFlavorText(text: string): string {
  return text.replace(/[\f\n\r]/g, ' ').replace(/\s+/g, ' ').trim()
}

function generateHint(pokemon: PokemonDetail, species: PokemonSpeciesInfo): string {
  const generators: (() => string | undefined)[] = [
    () => `This Pokémon is ${formatTypes(pokemon.types)}.`,
    () => {
      const gen = species.generation?.name
      if (!gen) return undefined
      return `This Pokémon was introduced in ${gen}.`
    },
    () => {
      const move = randomItem(pokemon.moves)
      if (!move) return undefined
      return `This Pokémon can learn the move ${move.move.name}.`
    },
    () => {
      const ability = randomItem(pokemon.abilities)
      if (!ability) return undefined
      return `This Pokémon has the ability ${ability.ability.name}.`
    },
    () => {
      const entries = species.flavor_text_entries?.filter((e) => e.language.name === 'en')
      const entry = randomItem(entries)
      if (!entry) return undefined
      return cleanFlavorText(entry.flavor_text)
    },
    () => `This Pokémon's name starts with the letter "${pokemon.name[0].toUpperCase()}".`,
    () => {
      const color = species.color?.name
      if (!color) return undefined
      return `This Pokémon is ${color} in color.`
    },
  ]

  for (let i = 0; i < 10; i++) {
    const gen = randomItem(generators)
    if (!gen) continue
    const hint = gen()
    if (hint) return hint
  }

  return `This Pokémon's name starts with the letter "${pokemon.name[0].toUpperCase()}".`
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
