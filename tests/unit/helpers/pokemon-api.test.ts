import { describe, expect, it, vi } from 'vitest'
import {
  getAbilityDetail,
  getPokemonDetail,
  getPokemonId,
  getPokemonImageUrl,
  getPokemonsByType,
  getPokemonsList,
  getPokemonSpecies,
  getPokemonSpriteUrl,
} from '../../../src/helpers/pokemon-api'

describe('pokemon-api helpers', () => {
  it('fetches the pokemon list', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ count: 1, next: null, previous: null, results: [] }),
    } as Response)

    await expect(getPokemonsList(10, 20)).resolves.toEqual({
      count: 1,
      next: null,
      previous: null,
      results: [],
    })
    expect(fetch).toHaveBeenCalledWith(
      'https://pokeapi.co/api/v2/pokemon?limit=10&offset=20',
    )
  })

  it('throws when list fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    } as Response)

    await expect(getPokemonsList()).rejects.toThrow(
      'Failed to fetch pokemons: 500 Server Error',
    )
  })

  it('fetches pokemon detail and species', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 25, name: 'pikachu' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 25, name: 'pikachu-species' }),
      } as Response)

    await expect(getPokemonDetail('pikachu')).resolves.toMatchObject({
      id: 25,
      name: 'pikachu',
    })
    await expect(getPokemonSpecies('https://pokeapi.co/api/v2/species/25')).resolves.toMatchObject({
      id: 25,
      name: 'pikachu-species',
    })
  })

  it('throws for detail, species, type, and ability failures', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response)

    await expect(getPokemonDetail(1)).rejects.toThrow(
      'Failed to fetch pokemon detail: 404 Not Found',
    )
    await expect(getPokemonSpecies('species-url')).rejects.toThrow(
      'Failed to fetch pokemon species: 403 Forbidden',
    )
    await expect(getPokemonsByType('fire')).rejects.toThrow(
      'Failed to fetch pokemons by type: 400 Bad Request',
    )
    await expect(getAbilityDetail('static')).rejects.toThrow(
      'Failed to fetch ability: 401 Unauthorized',
    )
  })

  it('maps type results to pokemon list shape', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        pokemon: [
          {
            pokemon: {
              name: 'pikachu',
              url: 'https://pokeapi.co/api/v2/pokemon/25/',
            },
          },
        ],
      }),
    } as Response)

    await expect(getPokemonsByType('electric')).resolves.toEqual({
      count: 1,
      next: null,
      previous: null,
      results: [
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
      ],
    })
  })

  it('fetches ability detail', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'static', effect_entries: [] }),
    } as Response)

    await expect(getAbilityDetail('static')).resolves.toMatchObject({
      name: 'static',
    })
  })

  it('derives pokemon ids and image urls', () => {
    expect(getPokemonId('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25)
    expect(getPokemonImageUrl(25)).toContain('/official-artwork/25.png')
    expect(getPokemonImageUrl(25, true)).toContain('/official-artwork/shiny/25.png')
    expect(getPokemonSpriteUrl(25)).toContain('/sprites/pokemon/25.png')
  })
})
