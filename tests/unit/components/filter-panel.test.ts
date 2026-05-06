import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const selectedTypes = ref<string[]>([])
const showFavoritesOnly = ref(false)
const toggleType = vi.fn((type: string) => {
  selectedTypes.value = selectedTypes.value.includes(type)
    ? selectedTypes.value.filter((value) => value !== type)
    : [...selectedTypes.value, type]
})
const toggleFavoritesOnly = vi.fn(() => {
  showFavoritesOnly.value = !showFavoritesOnly.value
})

vi.mock('../../../src/stores/filters', () => ({
  useFiltersStore: () => ({ selectedTypes, showFavoritesOnly, toggleType, toggleFavoritesOnly }),
}))

describe('FilterPanel', async () => {
  const FilterPanel = (await import('../../../src/components/FilterPanel.vue')).default

  beforeEach(() => {
    selectedTypes.value = ['fire']
    showFavoritesOnly.value = false
    toggleType.mockClear()
    toggleFavoritesOnly.mockClear()
  })

  it('renders filter controls and toggles favorites and types', async () => {
    const wrapper = mount(FilterPanel)

    expect(wrapper.text()).toContain('Show favorites')
    expect(wrapper.text()).toContain('fire')

    await wrapper.find('button').trigger('click')
    expect(toggleFavoritesOnly).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Favorites only')

    const electricButton = wrapper.findAll('button').find((button) => button.text() === 'electric')
    expect(electricButton).toBeDefined()
    await electricButton!.trigger('click')

    expect(toggleType).toHaveBeenCalledWith('electric')
  })
})
