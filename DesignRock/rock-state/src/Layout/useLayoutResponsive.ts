import { onMounted, onUnmounted } from 'vue'
import { useLayout } from './useLayout'

const RESIZE_DEBOUNCE_MS = 200

export function useLayoutResponsive() {
  const { syncLayoutByViewport } = useLayout()
  let resizeTimer: ReturnType<typeof setTimeout> | undefined

  function handleResize() {
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
    resizeTimer = setTimeout(() => {
      syncLayoutByViewport()
    }, RESIZE_DEBOUNCE_MS)
  }

  onMounted(() => {
    syncLayoutByViewport()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
  })
}
