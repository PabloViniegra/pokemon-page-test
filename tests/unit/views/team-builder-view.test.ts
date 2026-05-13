import { computed, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const team = ref([{ id: 25, name: 'pikachu' }])
const clearTeam = vi.fn(() => {
  team.value = []
})
const removeMember = vi.fn((id: number) => {
  team.value = team.value.filter((member) => member.id !== id)
})
const addMember = vi.fn((member: { id: number; name: string }) => {
  team.value = [...team.value, member]
})
const prefetchQuery = vi.fn()
const back = vi.fn()
const getPokemonDetail = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ back }),
}))

vi.mock('@tanstack/vue-query', () => ({
  useQueryClient: () => ({ prefetchQuery }),
  useQuery: () => ({
    data: ref([]),
    isLoading: ref(false),
    isError: ref(false),
  }),
}))

vi.mock('../../../src/helpers/pokemon-api', () => ({
  getPokemonDetail,
}))

vi.mock('../../../src/stores/team', () => ({
  useTeamStore: () => ({
    get team() {
      return team.value
    },
    get teamSize() {
      return team.value.length
    },
    get hasMembers() {
      return team.value.length > 0
    },
    clearTeam,
    removeMember,
    addMember,
  }),
}))

vi.mock('../../../src/composables/useTeamDetailQueries', () => ({
  useTeamDetailQueries: () => ({
    teamTypes: computed(() => [['electric']]),
    memberTypesMap: computed(() => new Map([[25, ['electric']]])),
  }),
}))

describe('TeamBuilderView', async () => {
  const TeamBuilderView = (await import('../../../src/views/TeamBuilderView.vue')).default

  beforeEach(() => {
    team.value = [{ id: 25, name: 'pikachu' }]
    clearTeam.mockClear()
    removeMember.mockClear()
    addMember.mockClear()
    prefetchQuery.mockClear()
    back.mockClear()
    getPokemonDetail.mockReset()
  })

  it('renders team info and handles team management actions', async () => {
    const wrapper = mount(TeamBuilderView, {
      global: {
        stubs: {
          TeamSlot: {
            props: ['id', 'name', 'types', 'index'],
            template:
              '<div><button class="slot-add" @click="$emit(\'add\', index)"></button><button v-if="id !== null" class="slot-remove" @click="$emit(\'remove\', id)"></button>{{ name }} {{ types.join(\',\') }}</div>',
          },
          PokemonSelectorModal: {
            props: ['open', 'excludeIds'],
            template:
              '<div class="modal">{{ open }}<button class="select" @click="$emit(\'select\', 6, \'charizard\')"></button><button class="close" @click="$emit(\'close\')"></button></div>',
          },
          TeamWeaknessChart: { template: '<div class="chart" />' },
          TeamSuggestionsPanel: {
            props: ['helpfulTypes', 'suggestedPokemon', 'isLoading', 'isError', 'teamSize', 'isFull'],
            template: '<div class="suggestions"><button class="suggestion-add" @click="$emit(\'selectPokemon\', 7, \'squirtle\')"></button></div>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Your Team')
    expect(wrapper.text()).toContain('(1/6)')
    expect(wrapper.text()).toContain('pikachu electric')

    await wrapper.find('button').trigger('click')
    expect(back).toHaveBeenCalled()

    await wrapper.find('.slot-add').trigger('click')
    expect(wrapper.find('.modal').text()).toContain('true')

    await wrapper.find('.select').trigger('click')
    expect(addMember).toHaveBeenCalledWith({ id: 6, name: 'charizard' })
    expect(prefetchQuery).toHaveBeenCalled()
    getPokemonDetail.mockResolvedValueOnce(undefined)
    await prefetchQuery.mock.calls[0][0].queryFn()
    expect(getPokemonDetail).toHaveBeenCalledWith(6)
    expect(removeMember).toHaveBeenCalledWith(25)

    await wrapper.find('.slot-remove').trigger('click')
    expect(removeMember).toHaveBeenCalledWith(6)
  })

  it('closes the selector modal without changing the team', async () => {
    const wrapper = mount(TeamBuilderView, {
      global: {
        stubs: {
          TeamSlot: {
            props: ['index'],
            template: '<button class="slot-add" @click="$emit(\'add\', 5)"></button>',
          },
          PokemonSelectorModal: {
            props: ['open'],
            template: '<div class="modal">{{ open }}<button class="close" @click="$emit(\'close\')"></button><button class="select" @click="$emit(\'select\', 150, \'mewtwo\')"></button></div>',
          },
          TeamWeaknessChart: true,
          TeamSuggestionsPanel: true,
        },
      },
    })

    await wrapper.findAll('button').find((button) => button.text().includes('Clear all'))!.trigger('click')
    expect(clearTeam).toHaveBeenCalled()

    await wrapper.find('.select').trigger('click')
    expect(addMember).not.toHaveBeenCalledWith({ id: 150, name: 'mewtwo' })

    await wrapper.find('.slot-add').trigger('click')
    expect(wrapper.find('.modal').text()).toContain('true')

    await wrapper.find('.select').trigger('click')
    expect(addMember).toHaveBeenCalledWith({ id: 150, name: 'mewtwo' })

    await wrapper.find('.close').trigger('click')
    expect(wrapper.find('.modal').text()).toContain('false')
  })

  it('switches between Analysis and Suggestions tabs', async () => {
    const wrapper = mount(TeamBuilderView, {
      global: {
        stubs: {
          TeamSlot: {
            props: ['id', 'name', 'types', 'index'],
            template: '<div>{{ name }}</div>',
          },
          PokemonSelectorModal: true,
          TeamWeaknessChart: { template: '<div class="chart" />' },
          TeamSuggestionsPanel: { template: '<div class="suggestions" />' },
        },
      },
    })

    expect(wrapper.text()).toContain('Weakness Analysis')
    expect(wrapper.text()).toContain('Suggestions')
    expect(wrapper.find('.chart').exists()).toBe(true)
    expect(wrapper.find('.suggestions').exists()).toBe(false)

    const suggestionsTab = wrapper.findAll('button').find((b) => b.text().includes('Suggestions'))
    await suggestionsTab!.trigger('click')

    expect(wrapper.find('.chart').exists()).toBe(false)
    expect(wrapper.find('.suggestions').exists()).toBe(true)
  })

  it('adds a Pokémon from the suggestions panel when there is room', async () => {
    const wrapper = mount(TeamBuilderView, {
      global: {
        stubs: {
          TeamSlot: {
            props: ['id', 'name', 'types', 'index'],
            template: '<div>{{ name }}</div>',
          },
          PokemonSelectorModal: true,
          TeamWeaknessChart: true,
          TeamSuggestionsPanel: {
            props: ['isFull'],
            template: '<div><button class="suggestion-add" @click="$emit(\'selectPokemon\', 7, \'squirtle\')"></button></div>',
          },
        },
      },
    })

    const suggestionsTab = wrapper.findAll('button').find((b) => b.text().includes('Suggestions'))
    await suggestionsTab!.trigger('click')

    await wrapper.find('.suggestion-add').trigger('click')
    expect(addMember).toHaveBeenCalledWith({ id: 7, name: 'squirtle' })
    expect(prefetchQuery).toHaveBeenCalled()
  })
})
