import { onUnmounted } from 'vue'
import {
  Lib as routeLib,
  isNavigationFailure,
  NavigationFailureType,
} from '@grow-admin-rock/middleware-router'
import type { RouteLocationNormalized } from 'vue-router'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { useLoadingBar } from '@grow-admin-rock/components'

const HOME_ROUTE_NAME = 'Home'

function getRouter() {
  return resolveByKeyOrThrow(routeLib.types.RouteTable).router
}

function isHomeRoute(route: RouteLocationNormalized) {
  return route.matched.some((record) => record.name === HOME_ROUTE_NAME)
}

export function useLayoutLoadingBar() {
  const loadingBar = useLoadingBar()
  const router = getRouter()
  let started = false

  function startIfNeeded(to: RouteLocationNormalized, from: RouteLocationNormalized) {
    if (started) {
      return
    }
    if (!isHomeRoute(from) || !isHomeRoute(to) || from.fullPath === to.fullPath) {
      return
    }
    loadingBar.start()
    started = true
  }

  function finish(failure?: unknown) {
    if (!started) {
      return
    }
    if (isNavigationFailure(failure, NavigationFailureType.redirected)) {
      return
    }
    if (failure) {
      loadingBar.error()
    } else {
      loadingBar.finish()
    }
    started = false
  }

  const removeBeforeEach = router.beforeEach((to, from) => {
    startIfNeeded(to, from)
  })

  const removeAfterEach = router.afterEach((_to, _from, failure) => {
    finish(failure)
  })

  const removeOnError = router.onError(() => {
    if (!started) {
      return
    }
    loadingBar.error()
    started = false
  })

  onUnmounted(() => {
    removeBeforeEach()
    removeAfterEach()
    removeOnError()
    if (started) {
      loadingBar.finish()
      started = false
    }
  })
}
