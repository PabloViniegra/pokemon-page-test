import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { useDebounce } from '../../../src/composables/useDebounce'

describe('useDebounce', () => {
  it('debounces updates and clears pending timeouts on unmount', async () => {
    vi.useFakeTimers()
    const source = ref('pikachu')
    let debounced = source

    const wrapper = mount(
      defineComponent({
        setup() {
          debounced = useDebounce(source, 100)
          return () => h('div', debounced.value)
        },
      }),
    )

    expect(debounced.value).toBe('pikachu')

    source.value = 'raichu'
    await wrapper.vm.$nextTick()
    expect(debounced.value).toBe('pikachu')

    vi.advanceTimersByTime(100)
    await wrapper.vm.$nextTick()
    expect(debounced.value).toBe('raichu')

    source.value = 'pichu'
    wrapper.unmount()
    vi.runAllTimers()
    expect(debounced.value).toBe('raichu')
  })
})
