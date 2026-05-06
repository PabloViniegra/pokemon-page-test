import { shallowRef, watch, type Ref } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay = 400): Ref<T> {
  const debouncedValue = shallowRef(value.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout>

  watch(value, (val) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = val
    }, delay)
  })

  return debouncedValue
}
