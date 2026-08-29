import { onMounted, onUnmounted } from 'vue'
import {
  screenMap,
  ScreenSizeEnum,
  SystemLayoutEnum,
} from '@grow-admin-rock/constants'
import { useLayout } from './useLayout'

const RESIZE_DEBOUNCE_MS = 200
const SIDE_LAYOUT_BREAKPOINT = screenMap.get(ScreenSizeEnum.LG) ?? 992

export function useLayoutResponsive() {
  const { layoutType, syncLayoutByViewport } = useLayout()
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
    if (
      layoutType.value !== SystemLayoutEnum.ROOF
      && window.innerWidth < SIDE_LAYOUT_BREAKPOINT
    ) {
      syncLayoutByViewport()
    }
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
  })
}
