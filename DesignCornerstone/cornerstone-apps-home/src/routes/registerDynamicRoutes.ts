import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import { getMenuList } from '#/api/routers'
import { getUserInfo } from '#/api/user'
import { extendComponent } from '#/utils/extendComponent'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import { resolveExternalRoute } from '@grow-admin-cornerstone/apps-external'
import type { ExternalRouteConfig } from '@grow-admin-cornerstone/apps-external'
import {
  FEAT_HIDDEN_ROUTES,
  canAccessRouteByRoles,
  filterConfigsByRoles,
  isFeatRouteConfig,
  resolveFeatPageComponentName,
  resolveFeatRoute,
  toFeatRouteConfigs,
  type FeatRouteConfig,
} from '@grow-admin-cornerstone/apps-feat'
import {
  flattenWorkspaceRouteConfigs,
  resolveWorkspaceRoute,
  resolveWorkspaceRouteFullPath,
  type WorkspaceRouteConfig,
} from '@grow-admin-cornerstone/apps-workspace'
import { resolveByKeyOrThrow } from '@grow-admin-rock/ioc'
import {
  resolveTabCacheName,
  resolveDefaultMenuRedirect,
  mergeTreesByName,
  sortTreesBySort,
  clearPermissionRelatedCaches,
  isPermissionModeCacheStale,
  setCachedPermissionMode,
  useAuthStore,
  useUserStore,
} from '@grow-admin-rock/state'
import type { AuthStore } from '@grow-admin-rock/state'
import type { Menu } from '@grow-admin-rock/types'

const HOME_ROUTE_NAME = 'Home'
const HOME_PATH = '/home'
const HOME_INDEX_REDIRECT_NAME = 'HomeIndexRedirect'

type DynamicRouteConfig = WorkspaceRouteConfig | FeatRouteConfig

function routeTable() {
  return resolveByKeyOrThrow(routeLib.types.RouteTable)
}

function menuState() {
  return resolveByKeyOrThrow(routeLib.types.MenuState)
}

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
    sort: config.sort,
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
  return sortTreesBySort(configs.map((config) => toMenuItem(config)))
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
    return resolveExternalRoute(config as ExternalRouteConfig, fullPath)
  }
  if (isFeatRouteConfig(config)) {
    return resolveFeatRoute(config, fullPath)
  }
  return resolveWorkspaceRoute(config as WorkspaceRouteConfig, fullPath)
}

function registerHomeIndexRedirect(menus: Menu[]) {
  const router = routeTable().router
  const redirect = resolveDefaultMenuRedirect(menus)
  if (!redirect) {
    return
  }

  if (router.hasRoute(HOME_INDEX_REDIRECT_NAME)) {
    router.removeRoute(HOME_INDEX_REDIRECT_NAME)
  }

  router.addRoute(HOME_ROUTE_NAME, {
    name: HOME_INDEX_REDIRECT_NAME,
    path: '',
    redirect,
  })
}

function registerHiddenRoutes(roleValues?: string[]) {
  const router = routeTable().router

  FEAT_HIDDEN_ROUTES.forEach((route) => {
    if (roleValues && !canAccessRouteByRoles(String(route.name), roleValues)) {
      return
    }
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

async function resolveCurrentRoleValues(): Promise<string[]> {
  const userStore = useUserStore()
  if (!userStore.userInfo?.roles?.length) {
    const userInfo = await getUserInfo()
    userStore.setUserInfo(userInfo)
  }
  return (userStore.userInfo?.roles ?? []).map((role) => role.value)
}

function registerRoutesFromConfigs(configs: DynamicRouteConfig[]) {
  const router = routeTable().router

  flattenWorkspaceRouteConfigs(configs as WorkspaceRouteConfig[]).forEach(({ fullPath, ...config }) => {
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
}

async function fetchBackConfigs(): Promise<DynamicRouteConfig[]> {
  const { menuList } = await getMenuList() as { menuList: DynamicRouteConfig[] }
  return menuList
}

function buildFrontConfigs(roleValues: string[]): DynamicRouteConfig[] {
  return filterConfigsByRoles(toFeatRouteConfigs(), roleValues)
}

async function registerBackMenuRoutes(authStore: AuthStore) {
  const menuList = await fetchBackConfigs()
  registerRoutesFromConfigs(menuList)
  const menus = toMenuList(menuList)
  authStore.setBackMenuList(menus)
  authStore.setLastBuildMenuTime()
  registerHomeIndexRedirect(menus)
}

function registerFrontMenuRoutes(authStore: AuthStore, roleValues: string[]) {
  const menuList = buildFrontConfigs(roleValues)
  registerRoutesFromConfigs(menuList)
  const menus = toMenuList(menuList)
  authStore.setFrontMenuList(menus)
  authStore.setLastBuildMenuTime()
  registerHomeIndexRedirect(menus)
}

async function registerMixtureMenuRoutes(authStore: AuthStore, roleValues: string[]) {
  const frontConfigs = buildFrontConfigs(roleValues)
  const backConfigs = await fetchBackConfigs()
  const mergedConfigs = mergeTreesByName(frontConfigs, backConfigs)

  registerRoutesFromConfigs(mergedConfigs)
  authStore.setFrontMenuList(toMenuList(frontConfigs))
  authStore.setBackMenuList(toMenuList(backConfigs))
  authStore.setLastBuildMenuTime()
  registerHomeIndexRedirect(toMenuList(mergedConfigs))
}

/**
 * 按 permissionMode 注册动态路由并写入对应菜单：
 * - BACK：接口菜单 → backMenuList
 * - FRONT：toFeatRouteConfigs 按角色过滤 → frontMenuList
 * - MIXTURE：前端（先按角色过滤）与后端合集，同名整条用后端
 * @returns 是否因权限模式变更清理过缓存
 */
export async function registerDynamicRoutes(): Promise<boolean> {
  const authStore = useAuthStore()
  const state = menuState()
  const configuredMode = state.getPermissionMode()
  const modeChanged = isPermissionModeCacheStale(configuredMode)

  // 注册前比对配置文件与本地缓存：不一致则清空菜单/标签/动态路由
  if (modeChanged) {
    clearPermissionRelatedCaches()
    routeTable().resetRouter()
  }

  if (state.isBackMode()) {
    registerHiddenRoutes()
    await registerBackMenuRoutes(authStore)
    setCachedPermissionMode(configuredMode)
    return modeChanged
  }

  const roleValues = await resolveCurrentRoleValues()
  registerHiddenRoutes(roleValues)

  if (state.isMixtureMode()) {
    await registerMixtureMenuRoutes(authStore, roleValues)
    setCachedPermissionMode(configuredMode)
    return modeChanged
  }

  registerFrontMenuRoutes(authStore, roleValues)
  setCachedPermissionMode(configuredMode)
  return modeChanged
}
