import { diKT } from '@grow-admin-rock/ioc';
import { Beans } from '@grow-admin-rock/settings';
import { Beans as stateBeans } from '@grow-admin-rock/state';
import { Beans as routeBeans } from '@grow-admin-rock/middleware-router';
import { useDefininationConfig } from '#/config';
import isNil from 'lodash-es/isNil';
import get from 'lodash-es/get';
import { isRef, unref } from 'vue-demi';

export type DesignInfo = ReturnType<typeof useDesign>

export function useDesign(scope: string) {
  const appstatus = useAppStatus()
  // const $style = cssModule ? useCssModule() : {};

  // const style: Record<string, string> = {};
  // if (cssModule) {
  //   Object.keys($style).forEach((key) => {
  //     // const moduleCls = $style[key];
  //     const k = key.replace(new RegExp(`^${values.prefixCls}-?`, 'ig'), '');
  //     style[lowerFirst(k)] = $style[key];
  //   });
  // }
  return {
    // prefixCls: computed(() => `${values.prefixCls}-${scope}`),
    prefixCls: `${appstatus.getPrefixCls()}-${scope}`,
    prefixVar: appstatus.getPrefixCls(),
    // style,
  }
}

/**
 * @description alias for @grow-admin-rock/settings/AppStatus
 * @returns 
 */
export const useAppStatus = () => {
  return diKT(Beans.AppStatus);
}

/**
 * 获取应用状态存储
 * 
 * @returns 
 */
export const useAppStateStore = () => {
  return diKT(stateBeans.AppStore);
}

/**
 * 获取路由
 * 
 * @returns 
 */
export const useRoutesTable = () => {
  return diKT(routeBeans.RouteTable);
}

/**
 * 获取API配置
 * 
 * @param api 
 * @returns 
 */
export const useInfrasturtureApi = (api: string, server?: string) => {
  if (isNil(server)) {
    return { url: api };
  } else {
    const { env } = useDefininationConfig()
    const serverName = get(isRef(env) ? unref(env) : env, `VITE_GLOB_SERVER_${server.toUpperCase()}`, undefined);
    const baseURL = serverName ? `/${serverName}` : env.VITE_GLOB_API_URL;
    return { baseURL, url: api };
  }
}