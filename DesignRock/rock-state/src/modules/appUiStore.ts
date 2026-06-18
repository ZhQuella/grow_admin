import { defineStore } from 'pinia'
import type { AppUiState } from '@grow-admin-rock/types'

export type AppUiStore = ReturnType<typeof useAppStore>

export const useAppStore = defineStore({
  id: 'APP_UI',
  state: (): AppUiState => ({
    webFullScreen: false,
    settingActive: false,
    searchActive: false,
    isPutAway: true,
    pageLoading: false,
    pageLoadingTip: '',
  }),
  getters: {
    getWebFullScreen: (state) => state.webFullScreen,
    getSettingActive: (state) => state.settingActive,
    getSearchActive: (state) => state.searchActive,
    getIsPutAway: (state) => state.isPutAway,
    getPageLoading: (state) => state.pageLoading,
    getPageLoadingTip: (state) => state.pageLoadingTip,
  },
  actions: {
    setWebFullScreen(isFullScreen: boolean) {
      this.webFullScreen = isFullScreen
    },
    setSettingActive(isActive: boolean) {
      this.settingActive = isActive
    },
    setSearchActive(isActive: boolean) {
      this.searchActive = isActive
    },
    setIsPutAway(isPutAway: boolean) {
      this.isPutAway = isPutAway
    },
    setPageLoading(loading: boolean) {
      this.pageLoading = loading
    },
    setPageLoadingTip(tip: string) {
      this.pageLoadingTip = tip
    },
    async setPageLoadingAction(loading: boolean) {
      if (loading) {
        this.pageLoading = true
        return
      }
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 200)
      })
      this.pageLoading = false
    },
  },
  persist: {
    paths: ['isPutAway'],
  },
})
