import { ALL_TYPES, analyzeTeamWeaknesses } from './type-chart'
import type { PokemonTypeName } from './type-chart'

export interface TypeSuggestion {
  type: PokemonTypeName
  score: number
  improvedTypes: PokemonTypeName[]
}

export interface PokemonSuggestion {
  id: number
  name: string
  types: PokemonTypeName[]
  score: number
  explanation: string
}

function getTopWeaknesses(teamTypes: PokemonTypeName[][], count = 5) {
  const analysis = analyzeTeamWeaknesses(teamTypes)
  return [...analysis]
    .sort((a, b) => {
      if (b.averageEffectiveness !== a.averageEffectiveness) {
        return b.averageEffectiveness - a.averageEffectiveness
      }
      return b.weakCount - a.weakCount
    })
    .slice(0, count)
}

export function getHelpfulTypes(
  teamTypes: PokemonTypeName[][],
  limit = 5,
): TypeSuggestion[] {
  if (teamTypes.length === 0) return []

  const currentAnalysis = analyzeTeamWeaknesses(teamTypes)
  const topWeaknesses = getTopWeaknesses(teamTypes, 5)

  const suggestions = ALL_TYPES.map((type) => {
    const newAnalysis = analyzeTeamWeaknesses([...teamTypes, [type]])
    let score = 0
    const improvedTypes: PokemonTypeName[] = []

    for (const tw of topWeaknesses) {
      const oldAvg = currentAnalysis.find((a) => a.type === tw.type)!
        .averageEffectiveness
      const newAvg = newAnalysis.find((a) => a.type === tw.type)!
        .averageEffectiveness
      const diff = oldAvg - newAvg
      if (diff > 0) {
        score += diff
        if (improvedTypes.length < 2) improvedTypes.push(tw.type)
      }
    }

    return { type, score, improvedTypes }
  })

  return suggestions
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function getSuggestedPokemon(
  candidates: Array<{ id: number; name: string; types: PokemonTypeName[] }>,
  teamTypes: PokemonTypeName[][],
  limit = 5,
): PokemonSuggestion[] {
  if (teamTypes.length === 0 || candidates.length === 0) return []

  const currentAnalysis = analyzeTeamWeaknesses(teamTypes)
  const topWeaknesses = getTopWeaknesses(teamTypes, 5)
  const existingSignatures = new Set(
    teamTypes.map((t) => [...t].sort().join(',')),
  )

  const scored = candidates.map((candidate) => {
    const newAnalysis = analyzeTeamWeaknesses([...teamTypes, candidate.types])
    let score = 0
    const improvedTypes: PokemonTypeName[] = []

    for (const tw of topWeaknesses) {
      const oldAvg = currentAnalysis.find((a) => a.type === tw.type)!
        .averageEffectiveness
      const newAvg = newAnalysis.find((a) => a.type === tw.type)!
        .averageEffectiveness
      const diff = oldAvg - newAvg
      if (diff > 0) {
        score += diff
        if (improvedTypes.length < 2) improvedTypes.push(tw.type)
      }
    }

    const signature = [...candidate.types].sort().join(',')
    if (existingSignatures.has(signature)) {
      score -= 0.2
    }

    return {
      id: candidate.id,
      name: candidate.name,
      types: candidate.types,
      score,
      explanation: generateExplanation(improvedTypes),
    }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

function generateExplanation(improvedTypes: PokemonTypeName[]): string {
  if (improvedTypes.length === 0) return 'Adds useful defensive coverage'
  if (improvedTypes.length === 1) {
    return `Helps against ${improvedTypes[0]} pressure`
  }
  return `Helps against ${improvedTypes[0]} and ${improvedTypes[1]} pressure`
}
