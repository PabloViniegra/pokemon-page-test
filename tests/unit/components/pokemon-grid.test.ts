import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PokemonGrid from '../../../src/components/PokemonGrid.vue'

describe('PokemonGrid', () => {
  it('passes pokemon props to cards and re-emits select and hover events', async () => {
    const wrapper = mount(PokemonGrid, {
      props: {
        animate: true,
        pokemons: [
          { name: 'pikachu', url: '25' },
          { name: 'raichu', url: '26' },
        ],
      },
      global: {
        stubs: {
          PokemonCard: {
            props: ['name', 'url'],
            template:
              '<button class="card" @click="$emit(\'select\', name)" @mouseenter="$emit(\'hover\', name)">{{ name }}|{{ url }}</button>',
          },
        },
      },
    })

    expect(wrapper.findAll('.card')).toHaveLength(2)
    expect(wrapper.text()).toContain('pikachu|25')

    await wrapper.findAll('.card')[0].trigger('click')
    await wrapper.findAll('.card')[1].trigger('mouseenter')

    expect(wrapper.emitted('select')?.[0]).toEqual(['pikachu'])
    expect(wrapper.emitted('hover')?.[0]).toEqual(['raichu'])
  })
})
