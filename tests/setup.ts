import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.useRealTimers()
  vi.stubGlobal('fetch', vi.fn())

  Object.defineProperty(window, 'scrollY', {
    value: 0,
    configurable: true,
    writable: true,
  })

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
