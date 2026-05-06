import { VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { mount, type MountingOptions, type VueWrapper } from '@vue/test-utils'
import type { Component } from 'vue'
import { createTestQueryClient } from './query'

export function mountWithPlugins<T extends Component>(
  component: T,
  options: MountingOptions<any> = {},
): VueWrapper<any> {
  const queryClient = createTestQueryClient()

  return mount(component, {
    ...options,
    global: {
      ...options.global,
      plugins: [
        createPinia(),
        [VueQueryPlugin, { queryClient } satisfies VueQueryPluginOptions],
        ...(options.global?.plugins ?? []),
      ],
    },
  })
}
