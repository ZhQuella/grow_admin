import { defineStore } from 'pinia'
import type { AppUiState } from '@grow-admin-rock/types'

export type AppUiStore = ReturnType<typeof useAppStore>

export const useAppStore = defineStore({
  id: 'APP_UI',
  state: (): AppUiState => ({
    webFullScreen: false,
    settingActive: false,
    searchActive: false,
    isPutAway: false,
  }),
  getters: {
    getWebFullScreen: (state) => state.webFullScreen,
    getSettingActive: (state) => state.settingActive,
    getSearchActive: (state) => state.searchActive,
    getIsPutAway: (state) => state.isPutAway,
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
  },
})
