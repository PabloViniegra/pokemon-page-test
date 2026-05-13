import { describe, expect, it } from 'vitest'
import {
  getHelpfulTypes,
  getSuggestedPokemon,
} from '../../../src/helpers/team-suggestions'
import type { PokemonTypeName } from '../../../src/helpers/type-chart'

describe('team suggestions helpers', () => {
  it('returns no helpful types for an empty team', () => {
    expect(getHelpfulTypes([])).toEqual([])
  })

  it('returns no pokemon suggestions for an empty team', () => {
    expect(getSuggestedPokemon([], [])).toEqual([])
  })

  it('suggests types that reduce the worst weaknesses', () => {
    const teamTypes: PokemonTypeName[][] = [['fire']]
    const suggestions = getHelpfulTypes(teamTypes, 5)

    expect(suggestions.length).toBeGreaterThan(0)
    const types = suggestions.map((s) => s.type)
    expect(types).toContain('water')
  })

  it('ranks pokemon candidates by defensive improvement', () => {
    const teamTypes: PokemonTypeName[][] = [['fire'], ['ground'], ['rock']]
    const candidates = [
      { id: 1, name: 'bulbasaur', types: ['grass', 'poison'] as PokemonTypeName[] },
      { id: 2, name: 'squirtle', types: ['water'] as PokemonTypeName[] },
      { id: 3, name: 'charmander', types: ['fire'] as PokemonTypeName[] },
    ]

    const suggestions = getSuggestedPokemon(candidates, teamTypes, 3)
    expect(suggestions.length).toBeGreaterThan(0)

    const squirtle = suggestions.find((s) => s.name === 'squirtle')
    const charmander = suggestions.find((s) => s.name === 'charmander')
    expect(squirtle).toBeDefined()
    expect(charmander).toBeDefined()
    expect(squirtle!.score).toBeGreaterThan(charmander!.score)
  })

  it('excludes exact typing duplicates from suggestions', () => {
    const teamTypes: PokemonTypeName[][] = [['fire']]
    const candidates = [
      { id: 1, name: 'charmander', types: ['fire'] as PokemonTypeName[] },
      { id: 2, name: 'squirtle', types: ['water'] as PokemonTypeName[] },
    ]

    const suggestions = getSuggestedPokemon(candidates, teamTypes, 2)
    const names = suggestions.map((s) => s.name)
    expect(names).toContain('squirtle')
    expect(names).not.toContain('charmander')
  })

  it('generates explanations for improved weaknesses', () => {
    const teamTypes: PokemonTypeName[][] = [['fire']]
    const candidates = [
      { id: 1, name: 'squirtle', types: ['water'] as PokemonTypeName[] },
    ]

    const suggestions = getSuggestedPokemon(candidates, teamTypes, 1)
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0].explanation).toMatch(/Helps against/)
  })
})
