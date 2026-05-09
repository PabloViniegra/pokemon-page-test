import { defineComponent, markRaw, reactive, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

function findButtonByText(wrapper: ReturnType<typeof mount>, label: string) {
  return wrapper
    .findAll('button')
    .find((button) => button.text().replace(/\s+/g, ' ').includes(label))
}

describe('bootstrap and app shell', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('exports a usable pinia instance', async () => {
    const { pinia } = await import('../../../src/stores/pinia')

    expect(pinia).toBeDefined()
    expect(typeof pinia.install).toBe('function')
  })

  it('boots the app with pinia, router, and Vue Query', async () => {
    const use = vi.fn().mockReturnThis()
    const mountApp = vi.fn()
    const createApp = vi.fn(() => ({ use, mount: mountApp }))

    vi.doMock('vue', async (importOriginal) => {
      const actual = await importOriginal<typeof import('vue')>()

      return {
        ...actual,
        createApp,
      }
    })
    vi.doMock('../../../src/App.vue', () => ({ default: { name: 'AppStub' } }))
    vi.doMock('../../../src/router', () => ({ default: { name: 'router-stub' } }))
    vi.doMock('../../../src/stores/pinia', () => ({ pinia: { name: 'pinia-stub' } }))
    vi.doMock('@tanstack/vue-query', () => ({ VueQueryPlugin: { name: 'query-plugin' } }))

    await import('../../../src/main')

    expect(createApp).toHaveBeenCalled()
    expect(use).toHaveBeenNthCalledWith(1, { name: 'pinia-stub' })
    expect(use).toHaveBeenNthCalledWith(2, { name: 'router-stub' })
    expect(use).toHaveBeenNthCalledWith(3, { name: 'query-plugin' })
    expect(mountApp).toHaveBeenCalledWith('#app')
  })

  it('configures the router and scroll behavior branches', async () => {
    vi.doUnmock('vue')
    vi.doUnmock('../../../src/router')
    vi.doMock('../../../src/views/HomeView.vue', () => ({ default: { name: 'HomeView' } }))
    vi.doMock('../../../src/views/DetailView.vue', () => ({ default: { name: 'DetailView' } }))
    vi.doMock('../../../src/views/TeamBuilderView.vue', () => ({ default: { name: 'TeamBuilderView' } }))
    vi.doMock('../../../src/views/GameView.vue', () => ({ default: { name: 'GameView' } }))
    vi.doMock('vue-router', () => ({
      createWebHistory: () => 'history',
      createRouter: (options: any) => ({ options }),
    }))

    const router = (await import('../../../src/router')).default as any
    const scrollBehavior = router.options.scrollBehavior

    sessionStorage.setItem('pokedex-scroll-y', '420')
    expect(router.options.routes).toHaveLength(4)
    expect(scrollBehavior({ name: 'home' }, { name: 'home' }, null)).toBe(false)
    expect(
      scrollBehavior({ name: 'home' }, { name: 'pokemon-detail' }, null),
    ).toEqual({ top: 420, behavior: 'instant' })

    sessionStorage.removeItem('pokedex-scroll-y')
    expect(
      scrollBehavior({ name: 'home' }, { name: 'pokemon-detail' }, null),
    ).toEqual({ top: 0 })
    expect(
      scrollBehavior({ name: 'team-builder' }, { name: 'home' }, { left: 0, top: 30 }),
    ).toEqual({ left: 0, top: 30, behavior: 'instant' })
    expect(scrollBehavior({ name: 'team-builder' }, { name: 'home' }, null)).toEqual({ top: 0 })
  })

  it('renders navigation state and keeps the routed component alive', async () => {
    vi.doUnmock('vue')
    vi.doUnmock('../../../src/App.vue')
    vi.doUnmock('../../../src/router')
    const route = reactive({ name: 'home' as string, fullPath: '/' })
    const push = vi.fn()

    vi.doMock('vue-router', () => ({
      useRoute: () => route,
      useRouter: () => ({ push }),
    }))
    vi.doMock('@tanstack/vue-query-devtools', () => ({
      VueQueryDevtools: { template: '<div class="devtools" />' },
    }))

    const HomePage = markRaw(defineComponent({
      name: 'HomeView',
      setup() {
        const inputValue = ref('')
        return {
          inputValue,
        }
      },
      template: '<div class="page"><input class="search" v-model="inputValue" /></div>',
    }))

    const App = (await import('../../../src/App.vue')).default
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: {
            template:
              '<div class="router-view"><slot :Component="component" :route="currentRoute" /></div>',
            setup() {
              return {
                currentRoute: route,
                component: HomePage,
              }
            },
          },
          KeepAlive: {
            template: '<div class="keepalive"><slot /></div>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Pokédex')
    expect(wrapper.find('.page').exists()).toBe(true)
    expect(wrapper.find('.devtools').exists()).toBe(true)
    expect(wrapper.html()).toContain('bg-red-50 text-red-700')

    route.fullPath = '/?q=p'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('input.search').exists()).toBe(true)

    const brandHomeButton = findButtonByText(wrapper, 'Pokédex')
    const navHomeButton = findButtonByText(wrapper, 'Dex')

    expect(brandHomeButton).toBeDefined()
    expect(navHomeButton).toBeDefined()

    await brandHomeButton!.trigger('click')
    await navHomeButton!.trigger('click')
    expect(push).toHaveBeenCalledWith({ name: 'home' })

    route.name = 'team-builder'
    route.fullPath = '/team-builder'
    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toContain('bg-blue-50 text-blue-700')
    const teamBuilderButton = findButtonByText(wrapper, 'Team Builder')
    await teamBuilderButton!.trigger('click')
    expect(push).toHaveBeenCalledWith({ name: 'team-builder' })
  })
})
