import { beforeEach, describe, expect, it, vi } from 'vitest'

function createMatchMediaResult(matches: boolean) {
  return {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }
}

async function loadThemeModule() {
  return import('../../../src/composables/useTheme')
}

describe('useTheme', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('style')
    Reflect.deleteProperty(document as object, 'startViewTransition')
  })

  it('initializes the dark theme from localStorage without rewriting it', async () => {
    localStorage.setItem('pokemon-theme-mode', 'dark')
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    const { initializeTheme, useTheme } = await loadThemeModule()

    initializeTheme()

    const { theme, isDark, toggleLabel } = useTheme()

    expect(theme.value).toBe('dark')
    expect(isDark.value).toBe(true)
    expect(toggleLabel.value).toBe('Switch to Solgaleo light mode')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(setItemSpy).not.toHaveBeenCalled()
  })

  it('falls back to the light theme when there is no stored preference', async () => {
    const { initializeTheme, useTheme } = await loadThemeModule()

    initializeTheme()

    const { theme, isDark, toggleLabel } = useTheme()

    expect(theme.value).toBe('light')
    expect(isDark.value).toBe(false)
    expect(toggleLabel.value).toBe('Switch to Lunala dark mode')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('toggles and persists the theme without view transitions', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    const { initializeTheme, toggleTheme, useTheme } = await loadThemeModule()

    initializeTheme()
    toggleTheme()

    const { theme, isDark, toggleLabel } = useTheme()

    expect(theme.value).toBe('dark')
    expect(isDark.value).toBe(true)
    expect(toggleLabel.value).toBe('Switch to Solgaleo light mode')
    expect(localStorage.getItem('pokemon-theme-mode')).toBe('dark')
    expect(setItemSpy).toHaveBeenCalledWith('pokemon-theme-mode', 'dark')
  })

  it('uses startViewTransition when motion is allowed', async () => {
    const startViewTransition = vi.fn((update: () => void) => {
      update()

      return {
        ready: Promise.resolve(),
        finished: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
      }
    })

    vi.stubGlobal('matchMedia', vi.fn(() => createMatchMediaResult(false)))
    Object.defineProperty(document, 'startViewTransition', {
      value: startViewTransition,
      configurable: true,
    })

    const { initializeTheme, toggleTheme, useTheme } = await loadThemeModule()

    initializeTheme()
    toggleTheme()

    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(useTheme().theme.value).toBe('dark')
  })

  it('skips startViewTransition when reduced motion is preferred', async () => {
    const startViewTransition = vi.fn()

    vi.stubGlobal('matchMedia', vi.fn(() => createMatchMediaResult(true)))
    Object.defineProperty(document, 'startViewTransition', {
      value: startViewTransition,
      configurable: true,
    })

    const { initializeTheme, toggleTheme, useTheme } = await loadThemeModule()

    initializeTheme()
    toggleTheme()

    expect(startViewTransition).not.toHaveBeenCalled()
    expect(useTheme().theme.value).toBe('dark')
    expect(localStorage.getItem('pokemon-theme-mode')).toBe('dark')
  })
})
