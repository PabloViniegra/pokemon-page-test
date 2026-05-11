import { onMounted, onUnmounted, type Ref } from 'vue'
import { gsap } from 'gsap'

type GsapRootElement = HTMLElement | SVGElement

interface GsapScopeContext {
  root: GsapRootElement
  q: gsap.utils.SelectorFunc
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function useGsapContext(
  root: Readonly<Ref<GsapRootElement | null>>,
  setup: (context: GsapScopeContext) => void,
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    const element = root.value
    if (!element) return

    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return

    ctx = gsap.context(() => {
      setup({
        root: element,
        q: gsap.utils.selector(element),
      })
    }, element)
  })

  onUnmounted(() => {
    ctx?.revert()
    ctx = null
  })
}
