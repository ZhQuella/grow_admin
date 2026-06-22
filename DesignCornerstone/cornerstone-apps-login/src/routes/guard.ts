import {
  PageEnum,
  BASIC_LOCK_PATH,
  BASIC_LOGIN_PATH,
  AuthorizationModeEnum,
  PermissionModeEnum,
} from '@grow-admin-rock/constants'
import { Lib as routeLib } from '@grow-admin-rock/middleware-router'
import { Lib as stateLib } from '@grow-admin-rock/state'
import { useOAuth2Config, useAuthMode } from '../usage'
import { diKT } from '@grow-admin-rock/ioc';

// const LOCK_PATH = BASIC_LOCK_PATH
// const LOGIN_PATH = BASIC_LOGIN_PATH
// const ROOT_PATH = LayoutRoutes.ROOT_ROUTE.path

// const routeTable = () => diKT(routeLib.types.RouteTable)
// const menuState = () => diKT(routeLib.types.MenuState)
// const useUserStore = () => diKT(layoutLib.types.UserStore)
// const useLockStore = () => diKT(layoutLib.types.LockStore)
// const useAuthStore = () => diKT(stateLib.types.AuthStore)

/**
 * 身份路由守卫-自定义首页
 * @param to
 * @param from
 * @param next
 * @returns
 */
const authGuardCustomHomepageHandler = async (to, from, next) => {

  return true
}

/**
 * 身份路由守卫-白名单
 * @param to
 * @param from
 * @param next
 * @returns
 */
const authGuardWhiteRoutesHandler = async (to, from, next) => {
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

  return true
}
/**
 * 创建登录身份验证守卫
 */
export function createAuthGuard() {
  routeTable().router.beforeEach(async (to, from, next) => {
    next()
  })
}
