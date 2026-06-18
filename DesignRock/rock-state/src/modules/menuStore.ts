import { defineStore } from 'pinia'
import type { MenuStoreState } from '@grow-admin-rock/types'

export type MenuStore = ReturnType<typeof useMenuStore>

export const useMenuStore = defineStore({
  id: 'MENU',
  state: (): MenuStoreState => ({
    collapsed: false,
    showMenu: true,
  }),
  getters: {
    getCollapsed: (state) => state.collapsed ?? false,
  },
  actions: {
    setCollapsed(collapsed: boolean) {
      this.collapsed = collapsed
    },
    setShowMenu(show: boolean) {
      this.showMenu = show
    },
  },
  persist: {
    paths: ['collapsed'],
  },
})
