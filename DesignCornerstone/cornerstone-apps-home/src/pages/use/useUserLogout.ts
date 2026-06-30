import { nextTick } from 'vue'
import { AUTHORITY_TOKEN } from '@grow-admin-rock/constants'
import { useRouter } from 'vue-router'
import { useAuthStore, useLockStore, useTabStore, useUserStore } from '@grow-admin-rock/state'
import { logout as logoutApi } from '#/api/user'

export function useUserLogout() {
  const router = useRouter()
  const userStore = useUserStore()
  const authStore = useAuthStore()
  const tabStore = useTabStore()
  const lockStore = useLockStore()

  async function handleLogout() {
    await logoutApi()
    sessionStorage.removeItem(AUTHORITY_TOKEN)
    userStore.resetState()
    authStore.resetState()
    tabStore.resetState()
    lockStore.resetState()
    await nextTick()
    await router.push({ name: 'Login' })
  }

  return {
    handleLogout,
  }
}
