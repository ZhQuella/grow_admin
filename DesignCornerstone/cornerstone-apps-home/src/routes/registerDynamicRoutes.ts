import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import { getMenuList } from '#/api/routers'
import { extendComponent } from '#/utils/extendComponent'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import { resolveExternalRoute } from '@grow-admin-cornerstone/apps-external'
import {
  FEAT_HIDDEN_ROUTES,
  isFeatRouteConfig,
  resolveFeatPageComponentName,
  resolveFeatRoute,
} from '@grow-admin-cornerstone/apps-feat'
import {
  flattenWorkspaceRouteConfigs,
  resolveWorkspaceRoute,
  resolveWorkspaceRouteFullPath,
  type WorkspaceRouteConfig,
} from '@grow-admin-cornerstone/apps-workspace'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import { resolveTabCacheName, resolveDefaultMenuRedirect } from '@grow-admin-rock/state'
import { useAuthStore } from '@grow-admin-rock/state'
import type { Menu } from '@grow-admin-rock/types'

const HOME_ROUTE_NAME = 'Home'
const HOME_PATH = '/home'
const HOME_INDEX_REDIRECT_NAME = 'HomeIndexRedirect'

type DynamicRouteConfig = WorkspaceRouteConfig

function toMenuItem(
  config: DynamicRouteConfig,
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

function toMenuList(configs: DynamicRouteConfig[]): Menu[] {
  return configs.map(toMenuItem)
}

function shouldRegisterRoute(config: DynamicRouteConfig): boolean {
  if (config.openMode === PageOpenModeEnum.BROWSER) {
    return false
  }
  if (config.children?.length) {
    return Boolean(config.componentKey)
  }
  return config.menuType === MenuTypeEnum.MENU
}

function resolveMetaComponentName(config: DynamicRouteConfig, routeName: string): string {
  if (config.componentKey && config.componentKey !== routeName) {
    if (isFeatRouteConfig(config)) {
      return resolveFeatPageComponentName(config.componentKey)
    }
  }
  return routeName
}

function resolveDynamicCacheName(fullPath: string, routeName: string): string {
  return resolveTabCacheName(`${HOME_PATH}/${fullPath}`, routeName)
}

function resolveDynamicRoute(config: DynamicRouteConfig, fullPath: string) {
  if (config.componentKey === 'EmbedPage' || config.openMode === PageOpenModeEnum.IFRAME) {
    return resolveExternalRoute(config, fullPath)
  }
  if (isFeatRouteConfig(config)) {
    return resolveFeatRoute(config, fullPath)
  }
  return resolveWorkspaceRoute(config, fullPath)
}

function registerHomeIndexRedirect(menus: Menu[]) {
  const router = resolveByKeyOrThrow(routeLib.types.RouteTable).router
  const redirect = resolveDefaultMenuRedirect(menus)
  if (!redirect || router.hasRoute(HOME_INDEX_REDIRECT_NAME)) {
    return
  }

  router.addRoute(HOME_ROUTE_NAME, {
    name: HOME_INDEX_REDIRECT_NAME,
    path: '',
    redirect,
  })
}

function registerHiddenRoutes() {
  const router = resolveByKeyOrThrow(routeLib.types.RouteTable).router

  FEAT_HIDDEN_ROUTES.forEach((route) => {
    if (router.hasRoute(route.name)) {
      return
    }

    const componentName = String(route.meta?.componentName ?? route.name)
    router.addRoute(HOME_ROUTE_NAME, {
      ...route,
      // 隐藏路由由 ContentView.wrapKeepAliveComponent 按路径动态命名，避免静态 name 与 cacheIncludeList 不一致
      component: route.component!,
      meta: {
        ...route.meta,
        componentName,
        isKeepAlive: route.meta?.isKeepAlive ?? true,
      },
    })
  })
}

export async function registerDynamicRoutes() {
  const { menuList } = await getMenuList() as { menuList: DynamicRouteConfig[] }
  const router = resolveByKeyOrThrow(routeLib.types.RouteTable).router
  const authStore = useAuthStore()

  registerHiddenRoutes()

  flattenWorkspaceRouteConfigs(menuList).forEach(({ fullPath, ...config }) => {
    if (!shouldRegisterRoute(config)) {
      return
    }

    const route = resolveDynamicRoute(config, fullPath)
    if (router.hasRoute(route.name)) {
      return
    }

    const routeName = String(route.name)
    const metaComponentName = resolveMetaComponentName(config, routeName)
    const cacheName = resolveDynamicCacheName(fullPath, routeName)
    router.addRoute(HOME_ROUTE_NAME, {
      ...route,
      component: extendComponent(route.component!, { name: cacheName }),
      meta: {
        ...route.meta,
        componentName: metaComponentName,
        isKeepAlive: config.isKeepAlive ?? true,
        affix: config.affix ?? false,
        defaultShow: config.defaultShow ?? false,
        isExternalPage: config.isExternalPage,
        openMode: config.openMode ?? PageOpenModeEnum.ROUTE,
        link: config.link,
      },
    })
  })

  const menus = toMenuList(menuList)
  authStore.setBackMenuList(menus)
  authStore.setLastBuildMenuTime()
  registerHomeIndexRedirect(menus)
}
