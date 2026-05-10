import { describe, it, expect } from 'vitest'
import {
  parseEvolutionChain,
  formatEvolutionDetails,
  getPokemonId,
  computeEvolutionStages,
} from '../pokemon-api'
import type { EvolutionChainLink } from '../../types/pokemon'

function makeLink(
  name: string,
  url: string,
  details: EvolutionChainLink['evolution_details'] = [],
  evolvesTo: EvolutionChainLink['evolves_to'] = [],
  isBaby = false,
): EvolutionChainLink {
  return {
    species: { name, url },
    evolution_details: details,
    evolves_to: evolvesTo,
    is_baby: isBaby,
  }
}

describe('parseEvolutionChain', () => {
  it('parses a simple linear chain', () => {
    const chain = makeLink('bulbasaur', 'https://pokeapi.co/api/v2/pokemon-species/1/', [], [
      makeLink('ivysaur', 'https://pokeapi.co/api/v2/pokemon-species/2/', [
        { trigger: { name: 'level-up', url: '' }, min_level: 16 } as any,
      ], [
        makeLink('venusaur', 'https://pokeapi.co/api/v2/pokemon-species/3/', [
          { trigger: { name: 'level-up', url: '' }, min_level: 32 } as any,
        ]),
      ]),
    ])

    const result = parseEvolutionChain(chain)

    expect(result.speciesName).toBe('bulbasaur')
    expect(result.speciesId).toBe(1)
    expect(result.evolvesTo).toHaveLength(1)
    expect(result.evolvesTo[0].speciesName).toBe('ivysaur')
    expect(result.evolvesTo[0].speciesId).toBe(2)
    expect(result.evolvesTo[0].evolvesTo[0].speciesName).toBe('venusaur')
  })

  it('parses a branching chain (eevee)', () => {
    const chain = makeLink('eevee', 'https://pokeapi.co/api/v2/pokemon-species/133/', [], [
      makeLink('vaporeon', 'https://pokeapi.co/api/v2/pokemon-species/134/', [
        { trigger: { name: 'use-item', url: '' }, item: { name: 'water-stone', url: '' } } as any,
      ]),
      makeLink('jolteon', 'https://pokeapi.co/api/v2/pokemon-species/135/', [
        { trigger: { name: 'use-item', url: '' }, item: { name: 'thunder-stone', url: '' } } as any,
      ]),
    ])

    const result = parseEvolutionChain(chain)

    expect(result.speciesName).toBe('eevee')
    expect(result.evolvesTo).toHaveLength(2)
    expect(result.evolvesTo.map((e) => e.speciesName)).toEqual(['vaporeon', 'jolteon'])
  })

  it('generates correct image URLs', () => {
    const chain = makeLink('mew', 'https://pokeapi.co/api/v2/pokemon-species/151/')
    const result = parseEvolutionChain(chain)
    expect(result.imageUrl).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png')
  })
})

describe('formatEvolutionDetails', () => {
  it('formats level-up with min_level', () => {
    expect(formatEvolutionDetails([{ trigger: { name: 'level-up' }, min_level: 16 } as any])).toBe('Level 16')
  })

  it('formats use-item', () => {
    expect(formatEvolutionDetails([{ trigger: { name: 'use-item' }, item: { name: 'fire-stone' } } as any])).toBe('Use Fire Stone')
  })

  it('formats trade', () => {
    expect(formatEvolutionDetails([{ trigger: { name: 'trade' } } as any])).toBe('Trade')
  })

  it('returns empty string for empty details', () => {
    expect(formatEvolutionDetails([])).toBe('')
  })
})

describe('computeEvolutionStages', () => {
  it('returns a single stage for a pokemon with no evolutions', () => {
    const node = {
      speciesName: 'mew',
      speciesId: 151,
      imageUrl: '',
      details: [],
      isBaby: false,
      evolvesTo: [],
    }

    const stages = computeEvolutionStages(node)

    expect(stages).toHaveLength(1)
    expect(stages[0].depth).toBe(0)
    expect(stages[0].entries).toHaveLength(1)
    expect(stages[0].entries[0].node.speciesName).toBe('mew')
    expect(stages[0].entries[0].parentId).toBeNull()
    expect(stages[0].entries[0].condition).toBe('')
  })

  it('returns two stages for a simple evolution', () => {
    const node = {
      speciesName: 'bulbasaur',
      speciesId: 1,
      imageUrl: '',
      details: [],
      isBaby: false,
      evolvesTo: [
        {
          speciesName: 'ivysaur',
          speciesId: 2,
          imageUrl: '',
          details: [{ trigger: { name: 'level-up' }, min_level: 16 } as any],
          isBaby: false,
          evolvesTo: [],
        },
      ],
    }

    const stages = computeEvolutionStages(node)

    expect(stages).toHaveLength(2)
    expect(stages[0].entries).toHaveLength(1)
    expect(stages[0].entries[0].node.speciesName).toBe('bulbasaur')

    expect(stages[1].entries).toHaveLength(1)
    expect(stages[1].entries[0].node.speciesName).toBe('ivysaur')
    expect(stages[1].entries[0].condition).toBe('Level 16')
    expect(stages[1].entries[0].parentId).toBe(1)
  })

  it('returns three stages for a three-stage chain', () => {
    const node = {
      speciesName: 'bulbasaur',
      speciesId: 1,
      imageUrl: '',
      details: [],
      isBaby: false,
      evolvesTo: [
        {
          speciesName: 'ivysaur',
          speciesId: 2,
          imageUrl: '',
          details: [{ trigger: { name: 'level-up' }, min_level: 16 } as any],
          isBaby: false,
          evolvesTo: [
            {
              speciesName: 'venusaur',
              speciesId: 3,
              imageUrl: '',
              details: [{ trigger: { name: 'level-up' }, min_level: 32 } as any],
              isBaby: false,
              evolvesTo: [],
            },
          ],
        },
      ],
    }

    const stages = computeEvolutionStages(node)

    expect(stages).toHaveLength(3)
    expect(stages[2].entries[0].node.speciesName).toBe('venusaur')
    expect(stages[2].entries[0].condition).toBe('Level 32')
    expect(stages[2].entries[0].parentId).toBe(2)
  })

  it('handles branching evolution (eevee)', () => {
    const node = {
      speciesName: 'eevee',
      speciesId: 133,
      imageUrl: '',
      details: [],
      isBaby: false,
      evolvesTo: [
        { speciesName: 'vaporeon', speciesId: 134, imageUrl: '', details: [{ trigger: { name: 'use-item' }, item: { name: 'water-stone' } } as any], isBaby: false, evolvesTo: [] },
        { speciesName: 'jolteon', speciesId: 135, imageUrl: '', details: [{ trigger: { name: 'use-item' }, item: { name: 'thunder-stone' } } as any], isBaby: false, evolvesTo: [] },
        { speciesName: 'flareon', speciesId: 136, imageUrl: '', details: [{ trigger: { name: 'use-item' }, item: { name: 'fire-stone' } } as any], isBaby: false, evolvesTo: [] },
      ],
    }

    const stages = computeEvolutionStages(node)

    expect(stages).toHaveLength(2)
    expect(stages[0].entries).toHaveLength(1)
    expect(stages[0].entries[0].node.speciesName).toBe('eevee')

    expect(stages[1].entries).toHaveLength(3)
    expect(stages[1].entries[0].node.speciesName).toBe('vaporeon')
    expect(stages[1].entries[1].node.speciesName).toBe('jolteon')
    expect(stages[1].entries[2].node.speciesName).toBe('flareon')

    expect(stages[1].entries[0].parentId).toBe(133)
    expect(stages[1].entries[1].parentId).toBe(133)
    expect(stages[1].entries[2].parentId).toBe(133)
  })

  it('handles fork-after-linear chains (poliwhirl)', () => {
    const node = {
      speciesName: 'poliwag',
      speciesId: 60,
      imageUrl: '',
      details: [],
      isBaby: false,
      evolvesTo: [
        {
          speciesName: 'poliwhirl',
          speciesId: 61,
          imageUrl: '',
          details: [{ trigger: { name: 'level-up' }, min_level: 25 } as any],
          isBaby: false,
          evolvesTo: [
            { speciesName: 'poliwrath', speciesId: 62, imageUrl: '', details: [{ trigger: { name: 'use-item' }, item: { name: 'water-stone' } } as any], isBaby: false, evolvesTo: [] },
            { speciesName: 'politoed', speciesId: 186, imageUrl: '', details: [{ trigger: { name: 'trade' }, held_item: { name: 'kings-rock', url: '' } } as any], isBaby: false, evolvesTo: [] },
          ],
        },
      ],
    }

    const stages = computeEvolutionStages(node)

    expect(stages).toHaveLength(3)
    expect(stages[0].entries).toHaveLength(1)
    expect(stages[1].entries).toHaveLength(1)
    expect(stages[2].entries).toHaveLength(2)
    expect(stages[2].entries[0].node.speciesName).toBe('poliwrath')
    expect(stages[2].entries[1].node.speciesName).toBe('politoed')
    expect(stages[2].entries[0].parentId).toBe(61)
    expect(stages[2].entries[1].parentId).toBe(61)
  })
})

describe('getPokemonId', () => {
  it('extracts id from species url', () => {
    expect(getPokemonId('https://pokeapi.co/api/v2/pokemon-species/1/')).toBe(1)
    expect(getPokemonId('https://pokeapi.co/api/v2/pokemon-species/150')).toBe(150)
  })
})