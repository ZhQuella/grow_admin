import { computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { PermissionModeEnum } from '@grow-admin-rock/constants'
import type { Menu } from '@grow-admin-rock/types'
import type { Auth } from '../Authorization'
import { useAppConfig } from './appConfig'
import { mergeTreesByName, sortTreesBySort } from './mergeTreesByName'

export { mergeTreesByName, sortTreesBySort } from './mergeTreesByName'

function resolveActiveMenuList(
  permissionMode: PermissionModeEnum,
  backMenuList: Menu[],
  frontMenuList: Menu[],
): Menu[] {
  if (permissionMode === PermissionModeEnum.BACK) {
    return sortTreesBySort(backMenuList)
  }
  if (permissionMode === PermissionModeEnum.MIXTURE) {
    return mergeTreesByName(frontMenuList, backMenuList)
  }
  return sortTreesBySort(frontMenuList)
}

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
    /** 按 permissionMode：BACK / FRONT / MIXTURE(合集，同名后端优先) */
    getMenuList(state): Menu[] {
      const { permissionMode } = useAppConfig()
      return resolveActiveMenuList(permissionMode, state.backMenuList, state.frontMenuList)
    },
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

/** 响应式取当前 permissionMode 下生效的菜单列表 */
export function useAuthMenuList() {
  const authStore = useAuthStore()
  const appConfig = useAppConfig()
  const { backMenuList, frontMenuList } = storeToRefs(authStore)
  const { permissionMode } = storeToRefs(appConfig)

  return computed(() =>
    resolveActiveMenuList(permissionMode.value, backMenuList.value, frontMenuList.value),
  )
}
