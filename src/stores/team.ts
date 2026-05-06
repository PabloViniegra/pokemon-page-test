import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'pokemon-team-builder'

export interface TeamMember {
  id: number
  name: string
}

function loadFromStorage(): TeamMember[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as TeamMember[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore parse errors
  }
  return []
}

export const useTeamStore = defineStore('team', () => {
  const team = ref<TeamMember[]>(loadFromStorage())

  const teamSize = computed(() => team.value.length)
  const isFull = computed(() => team.value.length >= 6)
  const hasMembers = computed(() => team.value.length > 0)

  function addMember(member: TeamMember) {
    if (team.value.length >= 6) return
    if (team.value.some((m) => m.id === member.id)) return
    team.value.push(member)
    save()
  }

  function removeMember(id: number) {
    team.value = team.value.filter((m) => m.id !== id)
    save()
  }

  function clearTeam() {
    team.value = []
    save()
  }

  function moveMember(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= team.value.length) return
    if (toIndex < 0 || toIndex >= team.value.length) return
    const item = team.value.splice(fromIndex, 1)[0]
    team.value.splice(toIndex, 0, item)
    save()
  }

  function save() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(team.value))
  }

  return {
    team,
    teamSize,
    isFull,
    hasMembers,
    addMember,
    removeMember,
    clearTeam,
    moveMember,
  }
})
