import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import { getMenuList } from '#/api/routers'
import { extendComponent } from '#/utils/extendComponent'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import { resolveExternalRoute } from '@grow-admin-cornerstone/apps-external'
import {
  flattenWorkspaceRouteConfigs,
  resolveWorkspaceRoute,
  resolveWorkspaceRouteFullPath,
  type WorkspaceRouteConfig,
} from '@grow-admin-cornerstone/apps-workspace'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { useAuthStore } from '@grow-admin-rock/state'
import type { Menu } from '@grow-admin-rock/types'

const HOME_ROUTE_NAME = 'Home'
const HOME_PATH = '/home'

function toMenuItem(
  config: WorkspaceRouteConfig,
  parentPath = '',
  isRootLevel = true,
): Menu {
  const routePath = `${HOME_PATH}/${resolveWorkspaceRouteFullPath(config, parentPath)}`
  const menu: Menu = {
    name: String(config.name),
    title: config.title,
    path: config.menuType === MenuTypeEnum.DIRECTORY ? String(config.name) : routePath,
    icon: config.icon,
    menuType: config.menuType,
    isVisible: config.isVisible,
    isKeepAlive: config.isKeepAlive,
    affix: config.affix,
    defaultShow: config.defaultShow,
    isExternalPage: config.isExternalPage,
    openMode: config.openMode,
    link: config.link,
  }

  if (config.children?.length) {
    const nextParentPath = isRootLevel
      ? ''
      : resolveWorkspaceRouteFullPath(config, parentPath)
    menu.children = config.children.map((child) => toMenuItem(child, nextParentPath, false))
    if (config.menuType === MenuTypeEnum.MENU) {
      menu.path = routePath
    }
  }

  if (config.openMode === PageOpenModeEnum.BROWSER) {
    menu.path = config.name
  }

  return menu
}

function toMenuList(configs: WorkspaceRouteConfig[]): Menu[] {
  return configs.map(toMenuItem)
}

function shouldRegisterRoute(config: WorkspaceRouteConfig): boolean {
  if (config.openMode === PageOpenModeEnum.BROWSER) {
    return false
  }
  if (config.children?.length) {
    return Boolean(config.componentKey)
  }
  return config.menuType === MenuTypeEnum.MENU
}

function resolveDynamicRoute(config: WorkspaceRouteConfig, fullPath: string) {
  if (config.componentKey === 'EmbedPage' || config.openMode === PageOpenModeEnum.IFRAME) {
    return resolveExternalRoute(config, fullPath)
  }
  return resolveWorkspaceRoute(config, fullPath)
}

export async function registerDynamicRoutes() {
  const { menuList } = await getMenuList() as { menuList: WorkspaceRouteConfig[] }
  const router = resolveByKeyOrThrow(routeLib.types.RouteTable).router
  const authStore = useAuthStore()

  flattenWorkspaceRouteConfigs(menuList).forEach(({ fullPath, ...config }) => {
    if (!shouldRegisterRoute(config)) {
      return
    }

    const route = resolveDynamicRoute(config, fullPath)
    if (router.hasRoute(route.name)) {
      return
    }

    const componentName = String(route.name)
    router.addRoute(HOME_ROUTE_NAME, {
      ...route,
      component: extendComponent(route.component!, { name: componentName }),
      meta: {
        ...route.meta,
        componentName,
        isKeepAlive: config.isKeepAlive ?? true,
        affix: config.affix ?? false,
        defaultShow: config.defaultShow ?? false,
        isExternalPage: config.isExternalPage,
        openMode: config.openMode ?? PageOpenModeEnum.ROUTE,
        link: config.link,
      },
    })
  })

  authStore.setBackMenuList(toMenuList(menuList))
  authStore.setLastBuildMenuTime()
}
