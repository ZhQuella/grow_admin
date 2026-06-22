import { defineStore } from 'pinia'
import type { Menu } from '@grow-admin-rock/types'
import type { Auth } from '../Authorization'

export const useAuthStore = defineStore({
  id: 'AUTH',
  state: (): Auth.AuthState => ({
    permCodeList: [],
    isDynamicAddedRoute: false,
    lastBuildMenuTime: 0,
    backMenuList: [] as Menu[],
    frontMenuList: [] as Menu[],
  }),
  getters: {
    getPermCodeList: (state) => state.permCodeList,
    getBackMenuList: (state) => state.backMenuList,
    getFrontMenuList: (state) => state.frontMenuList,
    getLastBuildMenuTime: (state) => state.lastBuildMenuTime,
    getIsDynamicAddedRoute: (state) => state.isDynamicAddedRoute,
  },
  actions: {
    setPermCodeList(codeList: string[]) {
      this.permCodeList = codeList
    },
    setBackMenuList(list: Menu[]) {
      this.backMenuList = list
    },
    setFrontMenuList(list: Menu[]) {
      this.frontMenuList = list
    },
    setLastBuildMenuTime() {
      this.lastBuildMenuTime = new Date().getTime()
    },
    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added
    },
    resetState() {
      this.permCodeList = []
      this.isDynamicAddedRoute = false
      this.lastBuildMenuTime = 0
      this.backMenuList = []
      this.frontMenuList = []
    },
    async changePermissionCode() {},
    async buildRoutesAction() {
      return []
    },
  },
})

export type AuthStore = ReturnType<typeof useAuthStore>
