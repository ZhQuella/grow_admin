import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { SystemLayoutEnum } from '@grow-admin-rock/constants'
import { useAppConfig } from '../modules/appConfig'
import { useMenuStore } from '../modules/menuStore'
import { useAppStore } from '../modules/appUiStore'

export function useLayout() {
  const appConfig = useAppConfig()
  const menuStore = useMenuStore()
  const appStore = useAppStore()

  const { layoutType } = storeToRefs(appConfig)

  const isFullScreen = computed(() => appStore.getWebFullScreen)
  const isPutAway = computed(() => appStore.getIsPutAway)
  const collapsed = computed(() => menuStore.getCollapsed)

  const onChangeSide = () => {
    console.log('onChangeSide', !isPutAway.value)
    appStore.setIsPutAway(!isPutAway.value)
    menuStore.setCollapsed(!isPutAway.value)
  }

  return {
    layoutType,
    isFullScreen,
    isPutAway,
    collapsed,
    onChangeSide,
    isSideLayout: computed(() => layoutType.value === SystemLayoutEnum.SIDE),
    isRoofLayout: computed(() => layoutType.value === SystemLayoutEnum.ROOF),
  }
}
