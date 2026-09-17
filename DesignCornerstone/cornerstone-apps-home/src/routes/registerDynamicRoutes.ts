import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import { getMenuList } from '#/api/routers'
import { getUserInfo } from '#/api/user'
import { extendComponent } from '#/utils/extendComponent'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import {
  resolveDisparkComponent,
  type DisparkPageType,
} from '@grow-admin-cornerstone/apps-dispark'
import {
  FEAT_HIDDEN_ROUTES,
  FEAT_CLIENT_ROUTE_STRUCTURES,
  FEAT_FRONT_ONLY_CLIENT_STRUCTURES,
  canAccessRouteByRoles,
  filterConfigsByRoles,
  toFeatRouteConfigs,
  type FeatRouteConfig,
} from '@grow-admin-cornerstone/apps-feat'
import {
  WORKSPACE_CLIENT_ROUTE_STRUCTURES,
  flattenWorkspaceRouteConfigs,
  resolveWorkspaceRouteFullPath,
  type WorkspaceRouteConfig,
} from '@grow-admin-cornerstone/apps-workspace'
import {
  SANDBOX_CLIENT_ROUTE_STRUCTURES,
  toSandboxRouteConfigsFromMenu,
  type SandboxRouteConfig,
} from '@grow-admin-cornerstone/apps-sandbox'
import {
  DESIGNER_CLIENT_ROUTE_STRUCTURES,
  toDesignerRouteConfigsFromMenu,
  type DesignerRouteConfig,
} from '@grow-admin-cornerstone/apps-designer'
import {
  SYSTEM_CLIENT_ROUTE_STRUCTURES,
  SYSTEM_ROUTE_AUTHORITY,
  toSystemRouteConfigsFromMenu,
  type SystemRouteConfig,
} from '@grow-admin-cornerstone/apps-system'
import {
  TENANT_CLIENT_ROUTE_STRUCTURES,
  TENANT_ROUTE_AUTHORITY,
  toTenantRouteConfigsFromMenu,
  type TenantRouteConfig,
} from '@grow-admin-cornerstone/apps-tenant'
import { EXTERNAL_ROUTE_STRUCTURES } from '@grow-admin-cornerstone/apps-external'
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

type DynamicRouteConfig = (
  WorkspaceRouteConfig
  | FeatRouteConfig
  | SandboxRouteConfig
  | DesignerRouteConfig
  | SystemRouteConfig
  | TenantRouteConfig
) & {
  pageDataId?: string
  pageType?: DisparkPageType
  dynamicTab?: boolean
  breadcrumbParentName?: string
}

type LocalRouteStructure = {
  name: string
  component?: GrowRouteComponent
  dynamicTab?: boolean
  breadcrumbParentName?: string
  children?: LocalRouteStructure[]
}

const LOCAL_ROUTE_STRUCTURES: LocalRouteStructure[] = [
  ...WORKSPACE_CLIENT_ROUTE_STRUCTURES,
  ...FEAT_CLIENT_ROUTE_STRUCTURES,
  ...FEAT_FRONT_ONLY_CLIENT_STRUCTURES,
  ...SANDBOX_CLIENT_ROUTE_STRUCTURES,
  ...DESIGNER_CLIENT_ROUTE_STRUCTURES,
  ...SYSTEM_CLIENT_ROUTE_STRUCTURES,
  ...TENANT_CLIENT_ROUTE_STRUCTURES,
  ...EXTERNAL_ROUTE_STRUCTURES,
]

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
  const fullPath = resolveWorkspaceRouteFullPath(config, parentPath)
  const routePath = `${HOME_PATH}/${fullPath}`
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
  return config.menuType === MenuTypeEnum.MENU
}

function findLocalRouteStructure(
  name: string,
  structures: LocalRouteStructure[] = LOCAL_ROUTE_STRUCTURES,
): LocalRouteStructure | undefined {
  for (const structure of structures) {
    if (structure.name === name) {
      return structure
    }
    const child = structure.children?.length
      ? findLocalRouteStructure(name, structure.children)
      : undefined
    if (child) {
      return child
    }
  }
  return undefined
}

function hydrateLocalRouteStructures(configs: DynamicRouteConfig[]): DynamicRouteConfig[] {
  return configs.map((config) => {
    const structure = findLocalRouteStructure(String(config.name))
    return {
      ...config,
      component: config.component ?? structure?.component,
      dynamicTab: config.dynamicTab ?? structure?.dynamicTab,
      breadcrumbParentName: config.breadcrumbParentName ?? structure?.breadcrumbParentName,
      children: config.children?.length
        ? hydrateLocalRouteStructures(config.children as DynamicRouteConfig[])
        : config.children,
    }
  })
}

function resolveDynamicCacheName(fullPath: string, routeName: string): string {
  return resolveTabCacheName(`${HOME_PATH}/${fullPath}`, routeName)
}

function resolveDynamicRoute(config: DynamicRouteConfig, fullPath: string) {
  const component = resolveDisparkComponent({
    pageType: config.pageType,
    openMode: config.openMode,
  }) ?? config.component
  if (!component) {
    throw new Error(`Route "${String(config.name)}" is missing its local component`)
  }
  return {
    path: fullPath,
    name: config.name,
    component,
    meta: {
      title: config.title,
      isKeepAlive: config.isKeepAlive !== false,
      dynamicTab: config.dynamicTab,
      breadcrumbParentName: config.breadcrumbParentName,
    },
    icon: config.icon,
  }
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

function addHiddenRoute(route: RouteRecordItem) {
  const router = routeTable().router
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
}

function registerHiddenRoutes(roleValues?: string[]) {
  FEAT_HIDDEN_ROUTES.forEach((route) => {
    if (roleValues && !canAccessRouteByRoles(String(route.name), roleValues)) {
      return
    }
    addHiddenRoute(route)
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
    const routeName = String(route.name)
    const keepAlive = config.isKeepAlive ?? true

    if (router.hasRoute(route.name)) {
      const existing = router.getRoutes().find((item) => item.name === route.name)
      if (existing?.meta) {
        existing.meta.isKeepAlive = keepAlive
      }
      return
    }

    const cacheName = resolveDynamicCacheName(fullPath, routeName)
    const hasParamSegment = fullPath.includes(':')
    router.addRoute(HOME_ROUTE_NAME, {
      ...route,
      component: hasParamSegment
        ? route.component!
        : extendComponent(route.component!, { name: cacheName }),
      meta: {
        ...route.meta,
        isKeepAlive: keepAlive,
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
  return hydrateLocalRouteStructures(menuList)
}

function buildFrontConfigs(roleValues: string[]): DynamicRouteConfig[] {
  return hydrateLocalRouteStructures([
    ...filterConfigsByRoles(toFeatRouteConfigs(), roleValues),
    ...toSandboxRouteConfigsFromMenu(),
    ...toDesignerRouteConfigsFromMenu(),
    ...filterConfigsByRoles(toSystemRouteConfigsFromMenu(), roleValues, SYSTEM_ROUTE_AUTHORITY),
    ...filterConfigsByRoles(toTenantRouteConfigsFromMenu(), roleValues, TENANT_ROUTE_AUTHORITY),
  ])
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
