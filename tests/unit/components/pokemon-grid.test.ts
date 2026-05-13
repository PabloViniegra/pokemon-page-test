import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('PokemonGrid', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('re-emits hover events and routes summary state through the shared tooltip controller', async () => {
    const showSummary = vi.fn()
    const hideSummary = vi.fn()

    vi.doMock('../../../src/composables/usePokemonHoverSummary', () => ({
      usePokemonHoverSummary: () => ({
        summaryPokemon: { value: null },
        summaryAccentColor: { value: null },
        summaryPosition: { value: null },
        isSummaryVisible: { value: false },
        showSummary,
        hideSummary,
      }),
    }))

    const { mountWithPlugins } = await import('../../helpers/mount')
    const PokemonGrid = (await import('../../../src/components/PokemonGrid.vue'))
      .default

    const wrapper = mountWithPlugins(PokemonGrid, {
      props: {
        animate: true,
        pokemons: [
          {
            name: 'pikachu',
            url: '25',
            imageUrl: 'pikachu.png',
            paddedId: '0025',
            isFavorited: false,
            accentColor: '#F7D02C',
          },
          {
            name: 'raichu',
            url: '26',
            imageUrl: 'raichu.png',
            paddedId: '0026',
            isFavorited: false,
            accentColor: '#F7D02C',
          },
        ],
      },
      global: {
        stubs: {
          RouterLink: {
            template: '<a class="router-link-stub"><slot /></a>',
            props: ['to'],
          },
          PokemonHoverTooltip: true,
        },
      },
    })

    const cards = wrapper.findAll('.router-link-stub')

    expect(cards).toHaveLength(2)
    expect(wrapper.text()).toContain('pikachu')

    await cards[0].trigger('click')
    await cards[1].trigger('mouseenter')
    await cards[1].trigger('mouseleave')

    expect(wrapper.emitted('select')?.[0]).toEqual(['pikachu'])
    expect(wrapper.emitted('hover')?.[0]).toEqual(['raichu'])
    expect(showSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'raichu',
        id: 26,
        accentColor: '#F7D02C',
      }),
    )
    expect(hideSummary).toHaveBeenCalled()
  })
})
