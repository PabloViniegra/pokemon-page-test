import { describe, expect, it } from 'vitest'
import {
  ALL_TYPES,
  analyzeTeamWeaknesses,
  getEffectiveness,
} from '../../../src/helpers/type-chart'

describe('type chart helpers', () => {
  it('exposes all 18 pokemon types', () => {
    expect(ALL_TYPES).toHaveLength(18)
    expect(ALL_TYPES).toContain('electric')
    expect(ALL_TYPES).toContain('fairy')
  })

  it('returns neutral effectiveness for empty defending types', () => {
    expect(getEffectiveness('fire', [])).toBe(1)
  })

  it('multiplies effectiveness across dual types', () => {
    expect(getEffectiveness('ground', ['electric'])).toBe(2)
    expect(getEffectiveness('ground', ['electric', 'flying'])).toBe(0)
    expect(getEffectiveness('ice', ['grass', 'flying'])).toBe(4)
  })

  it('analyzes team weaknesses including weak, resistant, immune, and neutral counts', () => {
    const analysis = analyzeTeamWeaknesses([
      ['electric'],
      ['flying'],
      ['ghost'],
    ])
    const groundAttack = analysis.find((item) => item.type === 'ground')
    const normalAttack = analysis.find((item) => item.type === 'normal')

    expect(groundAttack).toMatchObject({
      weakCount: 1,
      resistantCount: 0,
      immuneCount: 1,
      neutralCount: 1,
      totalWeaknessMultiplier: 3,
      averageEffectiveness: 1,
    })
    expect(normalAttack).toMatchObject({
      weakCount: 0,
      resistantCount: 0,
      immuneCount: 1,
      neutralCount: 2,
    })
  })

  it('uses a fallback divisor when the team is empty', () => {
    const analysis = analyzeTeamWeaknesses([])
    expect(analysis).toHaveLength(18)
    expect(analysis.every((item) => item.averageEffectiveness === 0)).toBe(true)
  })
})
