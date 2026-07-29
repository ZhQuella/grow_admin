/**
 * 设计器数据请求 → @grow-admin-rock/infrastructure Axios
 * 用法对齐 cornerstone-apps-home/src/api/routers.ts：
 *   diKT(infrastructureLib.types.InfrastructureAxios).get({ url })
 */

import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type { ReportHttpClient, ReportHttpRequestConfig } from './runApiOutlined'

type InfraMethod = 'get' | 'post' | 'put' | 'delete'

const toInfraMethod = (method?: string): InfraMethod => {
  const m = String(method || 'GET').toUpperCase()
  if (m === 'POST') return 'post'
  if (m === 'PUT') return 'put'
  if (m === 'DELETE') return 'delete'
  return 'get'
}

const resolveInfrastructureAxios = () => {
  try {
    return diKT(infrastructureLib.types.InfrastructureAxios)
  } catch {
    return null
  }
}

/**
 * 将设计器请求配置转发到 InfrastructureAxios。
 * @param fallback 当 IOC 未注册 Axios 时的回退客户端
 */
export const createInfrastructureHttpClient = (
  fallback?: ReportHttpClient,
): ReportHttpClient => {
  return async (config: ReportHttpRequestConfig) => {
    const axios = resolveInfrastructureAxios()
    if (!axios) {
      if (fallback) {
        console.warn(
          '[GrowApiOutlined] InfrastructureAxios 不可用，回退备用 HTTP 客户端',
        )
        return fallback(config)
      }
      throw new Error(
        '[GrowApiOutlined] InfrastructureAxios 未注册，请确认已安装并初始化 @grow-admin-rock/infrastructure',
      )
    }

    const method = toInfraMethod(config.method)
    const requestConfig: Record<string, unknown> = {
      url: config.url,
      headers: config.headers,
    }

    if (method === 'get' || method === 'delete') {
      requestConfig.params = config.params
    } else {
      requestConfig.data = config.data ?? config.params
    }

    return axios[method](requestConfig)
  }
}
