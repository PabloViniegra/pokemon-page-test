import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  document.body.innerHTML = ''
  document.documentElement.classList.remove('dark')
  document.documentElement.style.colorScheme = 'light'
  vi.restoreAllMocks()
  vi.useRealTimers()
  vi.stubGlobal('fetch', vi.fn())

  Object.defineProperty(window, 'scrollY', {
    value: 0,
    configurable: true,
    writable: true,
  })

  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = '0px'
    readonly thresholds = [0]

    disconnect = vi.fn()
    observe = vi.fn()
    takeRecords = vi.fn(() => [])
    unobserve = vi.fn()
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.clearAllTimers()
  vi.unstubAllGlobals()
})
