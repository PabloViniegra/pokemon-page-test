import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'pokemon-game-stats'

interface GameStats {
  totalRoundsPlayed: number
  totalCorrectGuesses: number
  totalAttempts: number
}

function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        totalRoundsPlayed: Number(parsed.totalRoundsPlayed) || 0,
        totalCorrectGuesses: Number(parsed.totalCorrectGuesses) || 0,
        totalAttempts: Number(parsed.totalAttempts) || 0,
      }
    }
  } catch {
    // ignore
  }
  return {
    totalRoundsPlayed: 0,
    totalCorrectGuesses: 0,
    totalAttempts: 0,
  }
}

export const useGameStatsStore = defineStore('gameStats', () => {
  const totalRoundsPlayed = ref(0)
  const totalCorrectGuesses = ref(0)
  const totalAttempts = ref(0)

  function hydrate() {
    const stats = loadStats()
    totalRoundsPlayed.value = stats.totalRoundsPlayed
    totalCorrectGuesses.value = stats.totalCorrectGuesses
    totalAttempts.value = stats.totalAttempts
  }

  function recordRound(correct: boolean, attempts: number) {
    totalRoundsPlayed.value += 1
    totalAttempts.value += attempts
    if (correct) {
      totalCorrectGuesses.value += 1
    }
  }

  function resetStats() {
    totalRoundsPlayed.value = 0
    totalCorrectGuesses.value = 0
    totalAttempts.value = 0
  }

  hydrate()

  watch(
    [totalRoundsPlayed, totalCorrectGuesses, totalAttempts],
    () => {
      const payload: GameStats = {
        totalRoundsPlayed: totalRoundsPlayed.value,
        totalCorrectGuesses: totalCorrectGuesses.value,
        totalAttempts: totalAttempts.value,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    },
    { deep: true },
  )

  return {
    totalRoundsPlayed,
    totalCorrectGuesses,
    totalAttempts,
    recordRound,
    resetStats,
  }
})
