import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTeamStore } from '../../../src/stores/team'

describe('team store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  it('hydrates valid saved team data and ignores malformed storage', () => {
    sessionStorage.setItem('pokemon-team-builder', JSON.stringify([{ id: 25, name: 'pikachu' }]))
    expect(useTeamStore().team).toEqual([{ id: 25, name: 'pikachu' }])

    setActivePinia(createPinia())
    sessionStorage.setItem('pokemon-team-builder', '{bad json')
    expect(useTeamStore().team).toEqual([])

    setActivePinia(createPinia())
    sessionStorage.setItem('pokemon-team-builder', JSON.stringify({ nope: true }))
    expect(useTeamStore().team).toEqual([])
  })

  it('manages members and persistence', () => {
    const store = useTeamStore()

    store.addMember({ id: 25, name: 'pikachu' })
    store.addMember({ id: 25, name: 'pikachu' })
    expect(store.team).toEqual([{ id: 25, name: 'pikachu' }])

    store.addMember({ id: 1, name: 'bulbasaur' })
    expect(store.teamSize).toBe(2)
    expect(store.hasMembers).toBe(true)
    expect(store.isFull).toBe(false)

    store.moveMember(-1, 0)
    store.moveMember(0, 99)
    expect(store.team.map((member) => member.id)).toEqual([25, 1])

    store.moveMember(0, 1)
    expect(store.team.map((member) => member.id)).toEqual([1, 25])

    store.removeMember(1)
    expect(store.team).toEqual([{ id: 25, name: 'pikachu' }])

    store.clearTeam()
    expect(store.team).toEqual([])
    expect(store.teamSize).toBe(0)
    expect(store.hasMembers).toBe(false)
  })

  it('stops adding once the team is full', () => {
    const store = useTeamStore()

    for (let id = 1; id <= 6; id++) {
      store.addMember({ id, name: `pokemon-${id}` })
    }

    expect(store.isFull).toBe(true)
    store.addMember({ id: 99, name: 'mew' })
    expect(store.team).toHaveLength(6)
  })
})
