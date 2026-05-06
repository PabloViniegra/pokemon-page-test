import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const instances: Array<{
  callback: IntersectionObserverCallback
  observe: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
}> = []

beforeEach(() => {
  instances.length = 0
  class MockIntersectionObserver {
    callback: IntersectionObserverCallback
    observe = vi.fn()
    disconnect = vi.fn()

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback
      instances.push(this)
    }
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

describe('useIntersectionObserver', async () => {
  const { useIntersectionObserver } = await import('../../../src/composables/useIntersectionObserver')

  it('sets up an observer, tracks intersection state, and cleans up', async () => {
    const callback = vi.fn()
    const target = ref<HTMLElement | null>(null)
    let state = ref(false)

    const wrapper = mount(
      defineComponent({
        setup() {
          const result = useIntersectionObserver(target, callback, {
            rootMargin: '10px',
          })
          state = result.isIntersecting
          return () => h('div')
        },
      }),
    )

    target.value = document.createElement('div')
    await nextTick()
    expect(instances[0]?.observe).toHaveBeenCalledWith(target.value)

    instances[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    expect(state.value).toBe(true)
    expect(callback).toHaveBeenCalledTimes(1)

    instances[0].callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver)
    expect(state.value).toBe(false)
    expect(callback).toHaveBeenCalledTimes(1)

    wrapper.unmount()
    expect(instances[0].disconnect).toHaveBeenCalled()
  })

  it('skips observer setup when the target is missing', async () => {
    const target = ref<HTMLElement | null>(null)
    mount(
      defineComponent({
        setup() {
          useIntersectionObserver(target, vi.fn())
          return () => h('div')
        },
      }),
    )

    target.value = document.createElement('div')
    await nextTick()
    target.value = null
    await nextTick()
    expect(instances).toHaveLength(1)
  })
})
