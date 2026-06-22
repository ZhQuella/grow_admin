import { defineStore } from 'pinia'

interface LoginRememberState {
  account: string
  isRemember: boolean
}

export type LoginRememberStore = ReturnType<typeof useLoginRememberStore>

export const useLoginRememberStore = defineStore({
  id: 'LOGIN_REMEMBER',
  state: (): LoginRememberState => ({
    account: '',
    isRemember: false,
  }),
  actions: {
    saveAccount(account: string, isRemember: boolean) {
      if (!isRemember) {
        this.account = ''
        this.isRemember = false
        return
      }
      this.account = account
      this.isRemember = true
    },
  },
  persist: {
    paths: ['account', 'isRemember'],
  },
})
