import { computed, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const dataRef = ref<any>(undefined)
const loadingRef = ref(false)
const useAllPokemonListQuery = vi.fn(() => ({ data: dataRef, isLoading: loadingRef }))

vi.mock('../../../src/composables/usePokemonQueries', () => ({
  useAllPokemonListQuery,
}))

describe('PokemonSelectorModal', async () => {
  const PokemonSelectorModal = (await import('../../../src/components/PokemonSelectorModal.vue')).default

  beforeEach(() => {
    dataRef.value = undefined
    loadingRef.value = false
    useAllPokemonListQuery.mockClear()
    vi.useFakeTimers()
  })

  it('renders loading and empty states', async () => {
    loadingRef.value = true
    const loadingWrapper = mount(PokemonSelectorModal, {
      props: { open: true, excludeIds: [] },
      global: { stubs: { Teleport: true, Transition: false } },
    })
    expect(loadingWrapper.text()).toContain('Loading Pokémon...')

    loadingRef.value = false
    dataRef.value = { results: [] }
    const emptyWrapper = mount(PokemonSelectorModal, {
      props: { open: true, excludeIds: [] },
      global: { stubs: { Teleport: true, Transition: false } },
    })
    expect(emptyWrapper.text()).toContain('No Pokémon found')
  })

  it('filters pokemon, focuses search on open, and emits select and close events', async () => {
    dataRef.value = {
      results: [
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' },
      ],
    }

    const wrapper = mount(PokemonSelectorModal, {
      props: { open: true, excludeIds: [26] },
      global: { stubs: { Teleport: true, Transition: false } },
    })

    expect(useAllPokemonListQuery.mock.calls[0][0].value).toBe(true)
    vi.runAllTimers()
    await wrapper.vm.$nextTick()

    expect(useAllPokemonListQuery).toHaveBeenCalledWith(expect.any(Object))
    expect(wrapper.text()).toContain('pikachu')
    expect(wrapper.text()).not.toContain('raichu')

    await wrapper.get('input').setValue('pika')
    expect(wrapper.text()).toContain('pikachu')

    await wrapper.findAll('button').find((button) => button.text().includes('pikachu'))!.trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([25, 'pikachu'])

    await wrapper.get('button[aria-label="Close"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('resets and focuses the search field when the modal opens later', async () => {
    dataRef.value = {
      results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }],
    }
    const focus = vi.spyOn(HTMLInputElement.prototype, 'focus').mockImplementation(() => {})

    const wrapper = mount(PokemonSelectorModal, {
      props: { open: false, excludeIds: [] },
      global: { stubs: { Teleport: true, Transition: false } },
    })

    await wrapper.setProps({ open: true })
    vi.runAllTimers()

    expect(focus).toHaveBeenCalled()
    expect(wrapper.get('input').element.value).toBe('')

    await wrapper.setProps({ open: false })
    expect(focus).toHaveBeenCalledTimes(1)
  })

  it('closes when the backdrop is clicked but not when inner content is clicked', async () => {
    dataRef.value = {
      results: [{ name: 'ditto', url: 'https://pokeapi.co/api/v2/pokemon/132/' }],
    }
    const wrapper = mount(PokemonSelectorModal, {
      props: { open: true, excludeIds: [] },
      attachTo: document.body,
      global: { stubs: { Teleport: true, Transition: false } },
    })

    await wrapper.get('.fixed').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)

    await wrapper.get('.bg-white').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)

    ;(wrapper.vm as any).handleBackdropClick({
      target: document.createElement('div'),
      currentTarget: document.createElement('section'),
    })
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('renders A-Z letter buttons and All button', async () => {
    dataRef.value = {
      results: [
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      ],
    }

    const wrapper = mount(PokemonSelectorModal, {
      props: { open: true, excludeIds: [] },
      global: { stubs: { Teleport: true, Transition: false } },
    })

    expect(wrapper.text()).toContain('All')
    expect(wrapper.text()).toContain('a')
    expect(wrapper.text()).toContain('z')
  })

  it('filters pokemon by letter when a letter button is clicked', async () => {
    dataRef.value = {
      results: [
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
      ],
    }

    const wrapper = mount(PokemonSelectorModal, {
      props: { open: true, excludeIds: [] },
      global: { stubs: { Teleport: true, Transition: false } },
    })

    const pButton = wrapper.findAll('button').find((b) => b.text().trim() === 'p')
    expect(pButton).toBeDefined()
    await pButton!.trigger('click')

    expect(wrapper.text()).toContain('pikachu')
    expect(wrapper.text()).not.toContain('bulbasaur')
    expect(wrapper.text()).not.toContain('charmander')
  })

  it('shows no results message when letter filter has no matches', async () => {
    dataRef.value = {
      results: [
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
      ],
    }

    const wrapper = mount(PokemonSelectorModal, {
      props: { open: true, excludeIds: [] },
      global: { stubs: { Teleport: true, Transition: false } },
    })

    const zButton = wrapper.findAll('button').find((b) => b.text().trim() === 'z')
    await zButton!.trigger('click')

    expect(wrapper.text()).toContain('No Pokémon found starting with "Z"')
  })

  it('toggles letter selection off when the same letter is clicked again', async () => {
    dataRef.value = {
      results: [
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      ],
    }

    const wrapper = mount(PokemonSelectorModal, {
      props: { open: true, excludeIds: [] },
      global: { stubs: { Teleport: true, Transition: false } },
    })

    const pButton = wrapper.findAll('button').find((b) => b.text().trim() === 'p')
    await pButton!.trigger('click')
    expect(wrapper.text()).toContain('pikachu')
    expect(wrapper.text()).not.toContain('bulbasaur')

    await pButton!.trigger('click')
    expect(wrapper.text()).toContain('pikachu')
    expect(wrapper.text()).toContain('bulbasaur')
  })

  it('clears letter filter when typing in search box', async () => {
    dataRef.value = {
      results: [
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      ],
    }

    const wrapper = mount(PokemonSelectorModal, {
      props: { open: true, excludeIds: [] },
      global: { stubs: { Teleport: true, Transition: false } },
    })

    const pButton = wrapper.findAll('button').find((b) => b.text().trim() === 'p')
    await pButton!.trigger('click')
    expect(wrapper.text()).not.toContain('bulbasaur')

    await wrapper.get('input').setValue('bulb')
    expect(wrapper.text()).toContain('bulbasaur')
    expect(wrapper.text()).not.toContain('pikachu')
  })

  it('clears letter filter when All button is clicked', async () => {
    dataRef.value = {
      results: [
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
      ],
    }

    const wrapper = mount(PokemonSelectorModal, {
      props: { open: true, excludeIds: [] },
      global: { stubs: { Teleport: true, Transition: false } },
    })

    const pButton = wrapper.findAll('button').find((b) => b.text().trim() === 'p')
    await pButton!.trigger('click')
    expect(wrapper.text()).toContain('pikachu')
    expect(wrapper.text()).not.toContain('bulbasaur')
    expect(wrapper.text()).not.toContain('charmander')

    const allButton = wrapper.findAll('button').find((b) => b.text().trim() === 'All')
    await allButton!.trigger('click')
    expect(wrapper.text()).toContain('pikachu')
    expect(wrapper.text()).toContain('bulbasaur')
    expect(wrapper.text()).toContain('charmander')
  })
})
