import { AuthorizationModeEnum } from '@grow-admin-rock/constants';
import type { GlobEnvConfig, GlobConfig } from '@grow-admin-rock/types'
import { toBool } from './toDataType'
import { version } from '../package.json'

/** 获取全局配置在 window 上的变量名 */
export function getAppConfigFileName(env: Record<string, any>) {
  return `__PRODUCTION__${env.VITE_GLOB_APP_SHORT_NAME || '__APP'}__CONF__`
    .toUpperCase()
    .replace(/\s/g, '')
}


/** 从环境变量中读取并组装全局应用配置 */
export function getGlobalConfig(
  env: Record<string, any>,
): Readonly<GlobConfig> {
  const {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_API_URL,
    VITE_GLOB_APP_SHORT_NAME,
    VITE_GLOB_APP_AUTH_MODE,
    VITE_GLOB_APP_IS_AUTO_OAUTH,
    VITE_GLOB_APP_OAUTH_CODE_SERVER,
    VITE_GLOB_APP_OAUTH_CODE_ROUTE,
  } = getAppConfig(env);
  const authModeKey = VITE_GLOB_APP_AUTH_MODE || AuthorizationModeEnum.SELF_LOGIN;
  const oauthCodeServer = VITE_GLOB_APP_OAUTH_CODE_SERVER || VITE_GLOB_API_URL;
  const oauthCodeRoute = VITE_GLOB_APP_OAUTH_CODE_ROUTE;
  const oauthAutoLogin = toBool(VITE_GLOB_APP_IS_AUTO_OAUTH);
  if (oauthAutoLogin && !oauthCodeRoute) {
    throw new Error('Route address must be configured when oauthAutoLogin is true')
  }
  return {
    title: VITE_GLOB_APP_TITLE,
    apiUrl: VITE_GLOB_API_URL,
    shortName: VITE_GLOB_APP_SHORT_NAME,
    authMode: AuthorizationModeEnum[authModeKey as keyof typeof AuthorizationModeEnum],
    oauthAutoLogin,
    oauthCodeRoute,
    oauthCodeServer,
  } as Readonly<GlobConfig>
}

/** 生成 localStorage 缓存 key 的前缀（应用名 + 环境） */
function createStorageKeyPrefix(env: Record<string, any>) {
  const { VITE_GLOB_APP_SHORT_NAME } = getAppConfig(env)
  return `${VITE_GLOB_APP_SHORT_NAME}_${env.MODE}`.toUpperCase()
}

/** 根据应用名、环境和版本号生成完整的缓存 key */
export function createStorageName(env: Record<string, any>) {
  return `${createStorageKeyPrefix(env)}${`_${version}`}_`.toUpperCase()
}

/** 获取应用环境配置（开发环境读 env，生产环境读 window 全局变量） */
export function getAppConfig(env: Record<string, any>) {
  const ENV_NAME = getAppConfigFileName(env)
  const ENV = (env.DEV
    ? // Get the global configuration (the configuration will be extracted independently when packaging)
    env
    : window[ENV_NAME]
  ) as GlobEnvConfig
  const { VITE_GLOB_APP_SHORT_NAME } = ENV
  if (!/^[a-zA-Z\_]*$/.test(VITE_GLOB_APP_SHORT_NAME)) {
    console.warn(
      `VITE_GLOB_APP_SHORT_NAME Variables can only be characters/underscores, please modify in the environment variables and re-running.`,
    )
  }
  return ENV
}
