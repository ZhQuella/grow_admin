import { onMounted, onUnmounted } from 'vue'
import { getUserInfo } from '#/api/user'
import { useAppStore, useAuthStore, useUserStore } from '@grow-admin-rock/state'
import { registerDynamicRoutes } from '#/routes/registerDynamicRoutes'

export const PAGE_LOADING_TIP_KEY = 'layout.common.pageLoading'

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function fetchUserInfo() {
  const userStore = useUserStore()
  const userInfo = await getUserInfo()
  userStore.setUserInfo(userInfo)
}

async function fetchMenus() {
  const authStore = useAuthStore()
  if (authStore.getIsDynamicAddedRoute) {
    return
  }
  await registerDynamicRoutes()
  authStore.setDynamicAddedRoute(true)
}

async function initRoutes() {
  await delay(600)
  const authStore = useAuthStore()
  await authStore.buildRoutesAction()
  authStore.setDynamicAddedRoute(true)
}

export async function bootstrapAppResources() {
  await fetchUserInfo()
  await fetchMenus()
  await initRoutes()
}

export function useAppBootstrap() {
  const appStore = useAppStore()
  let cancelled = false

  appStore.setPageLoading(true)
  appStore.setPageLoadingTip(PAGE_LOADING_TIP_KEY)

  onMounted(async () => {
    try {
      await bootstrapAppResources()
    } finally {
      if (!cancelled) {
        await appStore.setPageLoadingAction(false)
      }
    }
  })

  onUnmounted(() => {
    cancelled = true
    appStore.setPageLoading(false)
    appStore.setPageLoadingTip('')
  })
}
