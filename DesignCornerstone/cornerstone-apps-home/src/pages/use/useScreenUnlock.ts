import { useLockStore } from '@grow-admin-rock/state'

export function useScreenUnlock() {
  const lockStore = useLockStore()

  async function verifyPassword(password: string) {
    return lockStore.verifyUnlockSecret(password)
  }

  return {
    verifyPassword,
  }
}
