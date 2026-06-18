import { defineStore } from 'pinia'
import type { UserInfo } from '@grow-admin-rock/types'

export interface UserStoreState {
  userInfo: UserInfo | null
}

export type UserStore = ReturnType<typeof useUserStore>

export const useUserStore = defineStore({
  id: 'USER',
  state: (): UserStoreState => ({
    userInfo: null,
  }),
  getters: {
    getUserInfo: (state) => state.userInfo,
    getDisplayName: (state) =>
      state.userInfo?.realname || state.userInfo?.username || '',
    getDeptName: (state) => state.userInfo?.deptName || '',
    getAvatar: (state) => state.userInfo?.avatar || '',
    hasAvatar: (state) => !!state.userInfo?.avatar,
  },
  actions: {
    setUserInfo(info: UserInfo) {
      this.userInfo = info
    },
    resetState() {
      this.userInfo = null
    },
  },
})
