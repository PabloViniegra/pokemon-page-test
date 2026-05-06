import { shallowRef, onUnmounted, type Ref, watch } from 'vue'

export function useIntersectionObserver(
    target: Ref<HTMLElement | null>,
    callback: () => void,
    options: IntersectionObserverInit = { rootMargin: '200px' }
) {
    const isIntersecting = shallowRef(false)
    let observer: IntersectionObserver | null = null

    function setupObserver() {
        const el = target.value
        if (!el) return

        observer?.disconnect()
        observer = new IntersectionObserver((entries) => {
            isIntersecting.value = entries[0].isIntersecting
            if (entries[0].isIntersecting) {
                callback()
            }
        }, options)

        observer.observe(el)
    }

    watch(target, setupObserver)

    onUnmounted(() => {
        observer?.disconnect()
    })

    return { isIntersecting }
}
