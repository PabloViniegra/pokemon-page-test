import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import TeamWeaknessChart from '../../../src/components/TeamWeaknessChart.vue'

describe('TeamWeaknessChart', () => {
  it('shows the empty state when there are no team members', () => {
    const wrapper = mount(TeamWeaknessChart, { props: { teamTypes: [] } })

    expect(wrapper.text()).toContain('Add Pokémon to your team to see weakness analysis')
  })

  it('renders critical and resistant summaries for a uniform team', () => {
    const wrapper = mount(TeamWeaknessChart, {
      props: {
        teamTypes: [['grass'], ['grass'], ['grass']],
      },
    })

    expect(wrapper.text()).toContain('Critical vulnerability detected!')
    expect(wrapper.text()).toContain('Your whole team is weak to fire!')
    expect(wrapper.text()).toContain('Team strength')
    expect(wrapper.text()).toContain('Your whole team resists water!')
    expect(wrapper.html()).toContain('bg-red-500')
    expect(wrapper.html()).toContain('bg-green-500')
    expect(wrapper.html()).toContain('bg-yellow-500')
  })

  it('renders major warnings and immunity bars for mixed teams', () => {
    const wrapper = mount(TeamWeaknessChart, {
      props: {
        teamTypes: [['grass'], ['grass'], ['grass'], ['fire']],
      },
    })

    expect(wrapper.text()).toContain('Major vulnerability')
    expect(wrapper.text()).toContain('3 of your Pokémon are weak to fire')
    expect(wrapper.html()).toContain('bg-orange-500')
  })

  it('renders gray bars for fully immune matchups', () => {
    const wrapper = mount(TeamWeaknessChart, {
      props: {
        teamTypes: [['ghost'], ['ghost']],
      },
    })

    expect(wrapper.html()).toContain('bg-gray-500')
  })

  it('shows no warning text when there is no major weakness', () => {
    const wrapper = mount(TeamWeaknessChart, {
      props: {
        teamTypes: [['fire'], ['water']],
      },
    })

    expect(wrapper.text()).not.toContain('Critical vulnerability detected!')
    expect(wrapper.text()).not.toContain('Major vulnerability')
    expect((wrapper.vm as any).getWarningText({ weakCount: 1, type: 'fire' })).toBeNull()
  })

  it('falls back to a neutral badge color when a type color is missing', async () => {
    vi.resetModules()
    vi.doMock('../../../src/types/pokemon', () => ({ TYPE_COLORS: {} }))
    const DynamicChart = (await import('../../../src/components/TeamWeaknessChart.vue')).default
    const wrapper = mount(DynamicChart, {
      props: {
        teamTypes: [['ghost'], ['ghost']],
      },
    })

    expect(wrapper.html()).toContain('background-color: rgb(153, 153, 153)')
  })
})
