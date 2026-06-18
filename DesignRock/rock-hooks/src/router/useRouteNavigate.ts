import { type ServiceIdentifier, diKT } from '@grow-admin-rock/ioc'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import type { RouteOperator } from '@grow-admin-rock/middleware-router'
import type { RouteLocationRaw } from 'vue-router'

export const useRouteNavigate = () => {
  const routeOperator = diKT(
    routeLib.types.RouteOperator as ServiceIdentifier<RouteOperator>,
  )

  const go = (to: RouteLocationRaw, replace = false) => {
    routeOperator.go(to, replace)
  }

  return {
    go,
    replace: (to: RouteLocationRaw) => go(to, true),
    redo: routeOperator.redo,
  }
}
