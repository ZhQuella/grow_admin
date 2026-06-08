import {
  PageEnum,
  BASIC_LOCK_PATH,
  BASIC_LOGIN_PATH,
  AuthorizationModeEnum,
  PermissionModeEnum,
} from '@grow-admin-rock/constants'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import { Lib as layoutLib, LayoutRoutes } from '@grow-admin-rock/layouts-component'
import { Lib as stateLib } from '@grow-admin-rock/state'
import { useOAuth2Config, useAuthMode } from '../usage'
import { diKT } from '@grow-admin-rock/ioc'

const LOCK_PATH = BASIC_LOCK_PATH
const LOGIN_PATH = BASIC_LOGIN_PATH
const ROOT_PATH = LayoutRoutes.ROOT_ROUTE.path

const routeTable = () => diKT(routeLib.types.RouteTable)
const menuState = () => diKT(routeLib.types.MenuState)
const useUserStore = () => diKT(layoutLib.types.UserStore)
const useLockStore = () => diKT(layoutLib.types.LockStore)
const useAuthStore = () => diKT(stateLib.types.AuthStore)

/**
 * 身份路由守卫-自定义首页
 * @param to
 * @param from
 * @param next
 * @returns
 */
const authGuardCustomHomepageHandler = async (to, from, next) => {
  if (
    // '/' => '/dashboard'
    (from.path === ROOT_PATH || from.path === '/') &&
    useUserStore().getToken && 
    useUserStore().getTenantId &&
    useUserStore().homePage &&
    to.path !== useUserStore().homePage &&
    !useUserStore().hasRouter(to.path)
  ) {
    next(useUserStore().homePage)
    return false
  } else {
    return true
  }
}

/**
 * 身份路由守卫-白名单
 * @param to
 * @param from
 * @param next
 * @returns
 */
const authGuardWhiteRoutesHandler = async (to, from, next) => {
  if (routeTable().whiteRouteTable.paths.includes(to.path as PageEnum)) {
    const token = useUserStore().getAccessToken
    const tenatId = useUserStore().getTenantId
    if (to.path === LOGIN_PATH && token && tenatId) {
      // 登录页携带了redirect参数，直接跳转到redirect参数指定的页面
      const isSessionTimeout = useUserStore().getSessionTimeout
      try {
        await useUserStore().afterLoginAction()
        if (!isSessionTimeout) {
          next((to.query?.redirect as string) || '/')
          return false
        }
      } catch (e) {
        console.debug('跳转Redirect失败', e)
      }
    }
    // 如果是锁屏页，且没有锁屏，则跳转到上一个页面
    if (to.path === LOCK_PATH && !useLockStore().getLockInfo?.isLock) {
      next({ path: from.path })
      return false
    }
    // 白名单直接进入对应页面
    next()
    return false
  }
  return true
}
/**
 * 身份路由守卫-无token
 * @param to
 * @param from
 * @param next
 * @returns
 */
const authGuardWithoutTokenHandler = async (to, _, next) => {
  const token = useUserStore().getAccessToken
  const tenatId = useUserStore().getTenantId
  if (!token || !tenatId) {
    // You can access without permission. You need to set the routing meta.ignoreAuth to true
    if (to.meta.ignoreAuth) {
      next()
      return false
    }
    // 如果是授权码的无Token模式回登录页面
    if (useAuthMode() === AuthorizationModeEnum.OAUTH2_CODE) {
      const oauth2Confg = useOAuth2Config()?.value
      if (oauth2Confg) {
        const isCodeHandlePath = to.path === oauth2Confg.codeHandlerRoute
        const authCode = to.query?.code
        const authState = to.query?.state
        // 如果是授权码回调地址，且携带了code和state参数，则进行登录
        if (authCode && authState && isCodeHandlePath) {
          const user = await useUserStore().login({
            clientId: 'wmqe-pc',
            code: authCode,
            state: authState,
            gohome: true,
          } as any)
          // loggin 会进行重定向，所以这里不需要next
          next(false)
          return false
        }
      }
    }
    // redirect login page
    const redirectData: {
      path: string
      replace: boolean
      query?: Recordable<string>
    } = {
      path: LOGIN_PATH,
      replace: true,
    }
    if (to.path) {
      redirectData.query = {
        ...redirectData.query,
        redirect: to.path,
      }
    }
    next(redirectData)
    return false
  }
  return true
}
/**
 * 创建登录身份验证守卫
 */
export function createAuthGuard() {
  routeTable().router.beforeEach(async (to, from, next) => {
    const ret =
      (await authGuardCustomHomepageHandler(to, from, next)) &&
      (await authGuardWhiteRoutesHandler(to, from, next)) &&
      (await authGuardWithoutTokenHandler(to, from, next))
    if (!ret) {
      return
    }
    // TODO 继续抽取其他方法
    if (useLockStore().getLockInfo?.isLock) {
      // redirect lock page
      const redirectData: {
        path: string
        replace: boolean
        query?: Recordable<string>
      } = {
        path: LOCK_PATH,
        replace: true,
      }
      if (to.path) {
        redirectData.query = {
          ...redirectData.query,
          redirect: to.path,
        }
      }
      next(redirectData)
      return
    }
    // Jump to the 404 page after processing the login
    if (
      from.path === LOGIN_PATH &&
      to.name === LayoutRoutes.PAGE_NOT_FOUND_ROUTE.name &&
      to.fullPath !== useUserStore().homePage
    ) {
      next(useUserStore().homePage)
      return
    }
    const permissionMode = menuState().getPermissionMode()
    // TODO get userinfo while last fetch time is empty
    if (
      useUserStore().getLastUpdateTime === 0 &&
      permissionMode == PermissionModeEnum.BACK
    ) {
      try {
        await useUserStore().getUserInfoAction()
      } catch (err) {
        next()
        return
      }
    }
    if (useAuthStore().getIsDynamicAddedRoute) {
      next()
      return
    }
    const routes = await useAuthStore().buildRoutesAction()
    routes.forEach((route) => {
      routeTable().router.addRoute(route)
    })
    routeTable().router.addRoute(LayoutRoutes.PAGE_NOT_FOUND_ROUTE)

    useAuthStore().setDynamicAddedRoute(true)
    if (to.name === LayoutRoutes.PAGE_NOT_FOUND_ROUTE.name) {
      // 动态添加路由后，此处应当重定向到fullPath，否则会加载404页面内容
      next({ path: to.fullPath, replace: true, query: to.query })
    } else {
      const redirectPath = (from.query.redirect || to.path) as string
      const redirect = decodeURIComponent(redirectPath)
      const nextData =
        to.path === redirect ? { ...to, replace: true } : { path: redirect }
      next(nextData)
    }
  })
}
