import { defineStore } from 'pinia'
import { hashUnlockSecret } from '../unlockSecret'

export interface LockStoreState {
  isLock: boolean
  /** 登录成功后写入，用于锁屏本地校验，避免再次请求 /login */
  unlockSecretHash: string | null
}

export type LockStore = ReturnType<typeof useLockStore>

export const useLockStore = defineStore({
  id: 'LOCK',
  state: (): LockStoreState => ({
    isLock: false,
    unlockSecretHash: null,
  }),
  getters: {
    getIsLock: (state) => state.isLock,
  },
  actions: {
    lock() {
      this.isLock = true
    },
    unlock() {
      this.isLock = false
    },
    async setUnlockSecret(password: string) {
      this.unlockSecretHash = await hashUnlockSecret(password)
    },
    async verifyUnlockSecret(password: string) {
      if (!this.unlockSecretHash) {
        return false
      }
      const hash = await hashUnlockSecret(password)
      return hash === this.unlockSecretHash
    },
    resetState() {
      this.isLock = false
      this.unlockSecretHash = null
    },
  },
  persist: {
    storage: sessionStorage,
    paths: ['isLock', 'unlockSecretHash'],
  },
})
