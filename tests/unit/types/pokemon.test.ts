import { describe, expect, it } from 'vitest'
import * as barrel from '../../../src/types'
import {
  STAT_DESCRIPTIONS,
  STAT_NAMES,
  TYPE_COLORS,
} from '../../../src/types/pokemon'

describe('pokemon type exports', () => {
  it('exposes shared constants', () => {
    expect(TYPE_COLORS.electric.color).toBe('#F7D02C')
    expect(STAT_NAMES.hp).toBe('HP')
    expect(STAT_DESCRIPTIONS.speed).toContain('move order')
  })

  it('re-exports pokemon types through the barrel file', () => {
    expect(barrel.TYPE_COLORS).toBe(TYPE_COLORS)
    expect(barrel.STAT_NAMES).toBe(STAT_NAMES)
  })
})
