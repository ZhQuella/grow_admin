import { getMenuList } from '#/api/routers'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import {
  flattenWorkspaceRouteConfigs,
  resolveWorkspaceRoute,
  type WorkspaceRouteConfig,
} from '@grow-admin-cornerstone/apps-workspace'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { useAuthStore } from '@grow-admin-rock/state'
import type { Menu } from '@grow-admin-rock/types'

const HOME_ROUTE_NAME = 'Home'
const HOME_PATH = '/home'

function toMenuItem(config: WorkspaceRouteConfig): Menu {
  const menu: Menu = {
    name: String(config.name),
    title: String(config.meta?.title ?? config.name),
    path: config.children?.length
      ? String(config.name)
      : `${HOME_PATH}/${config.path}`,
    icon: config.icon,
    meta: config.meta,
  }

  if (config.children?.length) {
    menu.children = config.children.map(toMenuItem)
  }

  return menu
}

function toMenuList(configs: WorkspaceRouteConfig[]): Menu[] {
  return configs.map(toMenuItem)
}

export async function registerDynamicRoutes() {
  const { menuList } = await getMenuList() as { menuList: WorkspaceRouteConfig[] }
  const router = resolveByKeyOrThrow(routeLib.types.RouteTable).router
  const authStore = useAuthStore()

  flattenWorkspaceRouteConfigs(menuList).forEach((config) => {
    const route = resolveWorkspaceRoute(config)
    if (!router.hasRoute(route.name)) {
      router.addRoute(HOME_ROUTE_NAME, route)
    }
  })

  authStore.setBackMenuList(toMenuList(menuList))
  authStore.setLastBuildMenuTime()
}
