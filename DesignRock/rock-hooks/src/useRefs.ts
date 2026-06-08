import type { Ref } from 'vue'
import { ref, onBeforeUpdate } from 'vue'

export interface RefsContext {
  refs: Ref<HTMLElement[]>
  setRefs: (index: number) => (el: HTMLElement) => void
}

export const useRefs = (): RefsContext => {
  const refs = ref([]) as Ref<HTMLElement[]>

  onBeforeUpdate(() => {
    refs.value = []
  })

  const setRefs = (index: number) => (el: HTMLElement) => {
    refs.value[index] = el
  }

  return {refs, setRefs}
}
