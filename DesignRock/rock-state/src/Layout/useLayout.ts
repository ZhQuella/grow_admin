import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  screenMap,
  ScreenSizeEnum,
  SystemLayoutEnum,
  type SystemLayoutType,
} from '@grow-admin-rock/constants'
import { useAppConfig } from '../modules/appConfig'
import { useMenuStore } from '../modules/menuStore'
import { useAppStore } from '../modules/appUiStore'

const SIDE_LAYOUT_BREAKPOINT = screenMap.get(ScreenSizeEnum.LG) ?? 992

export function useLayout() {
  const appConfig = useAppConfig()
  const menuStore = useMenuStore()
  const appStore = useAppStore()

  const { layoutType } = storeToRefs(appConfig)

  const isFullScreen = computed(() => appStore.getWebFullScreen)
  const isPutAway = computed(() => appStore.getIsPutAway)
  const collapsed = computed(() => menuStore.getCollapsed)

  function syncLayoutByViewport(width = document.documentElement.clientWidth) {
    if (layoutType.value === SystemLayoutEnum.ROOF) {
      menuStore.setCollapsed(false)
      return
    }

    if (width < SIDE_LAYOUT_BREAKPOINT) {
      menuStore.setCollapsed(true)
      appStore.setIsPutAway(false)
      return
    }

    menuStore.setCollapsed(false)
    appStore.setIsPutAway(true)
  }

  function selectLayoutType(type: SystemLayoutType) {
    appConfig.setLayoutType(type)
    menuStore.setCollapsed(false)
    appStore.setIsPutAway(true)
    syncLayoutByViewport()
  }

  function resetLayoutType() {
    appConfig.setLayoutType(SystemLayoutEnum.SIDE)
    syncLayoutByViewport()
  }

  const onChangeSide = () => {
    appStore.setIsPutAway(!isPutAway.value)
    menuStore.setCollapsed(!isPutAway.value)
  }

  return {
    layoutType,
    isFullScreen,
    isPutAway,
    collapsed,
    onChangeSide,
    selectLayoutType,
    resetLayoutType,
    syncLayoutByViewport,
    isSideLayout: computed(() => layoutType.value === SystemLayoutEnum.SIDE),
    isRoofLayout: computed(() => layoutType.value === SystemLayoutEnum.ROOF),
    isMixedLayout: computed(() => layoutType.value === SystemLayoutEnum.MIXED),
  }
}
