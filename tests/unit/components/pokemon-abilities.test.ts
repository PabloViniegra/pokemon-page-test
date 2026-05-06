import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PokemonAbilities from '../../../src/components/PokemonAbilities.vue'
import { createPokemonAbility } from '../../fixtures/pokemon'

const mocks = vi.hoisted(() => ({
  queriesResult: { value: [] as any[] },
  useQueries: vi.fn(),
  getAbilityDetail: vi.fn(),
}))

mocks.useQueries.mockImplementation(() => mocks.queriesResult)

vi.mock('@tanstack/vue-query', () => ({
  useQueries: mocks.useQueries,
}))

vi.mock('../../../src/helpers/pokemon-api', () => ({
  getAbilityDetail: mocks.getAbilityDetail,
}))

describe('PokemonAbilities', () => {
  beforeEach(() => {
    mocks.queriesResult.value = []
    mocks.useQueries.mockClear()
    mocks.getAbilityDetail.mockReset()
  })

  it('renders hidden abilities and english short effects', () => {
    mocks.queriesResult.value = [
      {
        data: {
          effect_entries: [
            { short_effect: 'Paralyzes on contact.', language: { name: 'en' } },
          ],
        },
      },
      {
        data: {
          effect_entries: [
            { short_effect: 'Nope.', language: { name: 'jp' } },
          ],
        },
      },
    ]

    const wrapper = mount(PokemonAbilities, {
      props: {
        abilities: [
          createPokemonAbility({ ability: { name: 'static', url: '' } }),
          createPokemonAbility({
            ability: { name: 'lightning-rod', url: '' },
            is_hidden: true,
          }),
        ],
      },
    })

    expect(wrapper.text()).toContain('static')
    expect(wrapper.text()).toContain('Paralyzes on contact.')
    expect(wrapper.text()).toContain('Hidden')
    expect(wrapper.text()).not.toContain('Nope.')

    const options = mocks.useQueries.mock.calls[0][0]
    expect(options.queries.value[0].queryKey).toEqual(['ability', 'static'])
  })

  it('builds ability queries that fetch detail by ability name', async () => {
    const wrapper = mount(PokemonAbilities, {
      props: {
        abilities: [createPokemonAbility({ ability: { name: 'static', url: '' } })],
      },
    })

    mocks.getAbilityDetail.mockResolvedValueOnce(undefined)

    expect(wrapper.exists()).toBe(true)

    const options = mocks.useQueries.mock.calls[0][0]
    await options.queries.value[0].queryFn()
    expect(mocks.getAbilityDetail).toHaveBeenCalledWith('static')
  })
})
