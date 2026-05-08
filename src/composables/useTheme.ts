import { computed, ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

type ViewTransition = {
  ready: Promise<void>
  finished: Promise<void>
  updateCallbackDone: Promise<void>
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    update: () => void | Promise<void>,
  ) => ViewTransition
}

const THEME_STORAGE_KEY = 'pokemon-theme-mode'
const DEFAULT_THEME: ThemeMode = 'light'

const theme = ref<ThemeMode>(DEFAULT_THEME)

const isDark = computed(() => theme.value === 'dark')
const toggleLabel = computed(() =>
  isDark.value
    ? 'Switch to Solgaleo light mode'
    : 'Switch to Lunala dark mode',
)

function applyTheme(nextTheme: ThemeMode, persist = true) {
  theme.value = nextTheme

  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    document.documentElement.style.colorScheme = nextTheme
  }

  if (persist && typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }
}

export function initializeTheme() {
  if (typeof window === 'undefined') return

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  const nextTheme = storedTheme === 'dark' ? 'dark' : DEFAULT_THEME

  applyTheme(nextTheme, false)
}

export function toggleTheme() {
  const nextTheme: ThemeMode = isDark.value ? 'light' : 'dark'

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    applyTheme(nextTheme)
    return
  }

  const prefersReducedMotion =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  const viewTransitionDocument = document as DocumentWithViewTransition

  if (
    prefersReducedMotion ||
    typeof viewTransitionDocument.startViewTransition !== 'function'
  ) {
    applyTheme(nextTheme)
    return
  }

  viewTransitionDocument.startViewTransition(() => {
    applyTheme(nextTheme)
  })
}

export function useTheme() {
  return {
    theme,
    isDark,
    toggleLabel,
    toggleTheme,
  }
}
