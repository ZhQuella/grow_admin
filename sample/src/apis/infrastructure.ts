import type { RequestOptions } from '@grow-admin-rock/types'
import { AUTHORITY_TOKEN } from '@grow-admin-rock/constants'
import { useMsg } from '@grow-admin-rock/components'
import { Autowired, Bean, diKT } from '@grow-admin-rock/ioc'
import { isString } from '@grow-admin-rock/utils'
import {
  AxiosTransform,
  GrowRequestConfig,
  GrowResponse,
  InfrastructureOptions,
  InfrastructureAxios,
  Lib as infrastructureLib,
} from '@grow-admin-rock/infrastructure'

@Bean()
export class GrowAxiosTransform extends AxiosTransform {
  constructor(
    @Autowired(infrastructureLib.types.InfrastructureOptions)
    _options: InfrastructureOptions,
  ) {
    super()

    this.beforeRequestHook = (config: GrowRequestConfig, options: RequestOptions) => {
      const { apiUrl } = options
      if (!config.baseURL && apiUrl) {
        config.baseURL = isString(apiUrl) ? apiUrl : ''
      }
      return config
    }

    this.requestInterceptors = (config: GrowRequestConfig) => {
      const requestOptions = config.requestOptions
      if (requestOptions?.withToken === false) {
        return config
      }

      const token = sessionStorage.getItem(AUTHORITY_TOKEN)
      if (!token) {
        return config
      }

      const scheme = requestOptions?.authenticationScheme || 'Bearer'
      config.headers = config.headers || {}
      config.headers.Authorization = `${scheme} ${token}`
      return config
    }

    this.transformRequestHook = (rawRes: GrowResponse, options: RequestOptions) => {
      if (options.isReturnNativeResponse) {
        return rawRes
      }

      const { data } = rawRes

      if (!options.isTransformResponse) {
        return data
      }

      if (!data) {
        throw new Error('接口返回为空')
      }

      if (data.type === 'error') {
        const error = new Error(data.message || '请求失败')
        if (options.errorMessageMode === 'message') useMsg().error?.(error.message)
        throw error
      }

      if (typeof data.code === 'number' && data.code !== 0 && data.code !== 200) {
        const error = new Error(data.message || '请求失败')
        if (options.errorMessageMode === 'message') useMsg().error?.(error.message)
        throw error
      }

      if (data.data !== undefined) {
        return data.data
      }

      if (data.result !== undefined) {
        return data.result
      }

      return data
    }

    this.responseInterceptorsCatch = (error: unknown) => {
      const requestError = error as {
        config?: { requestOptions?: RequestOptions }
        message?: string
        response?: { data?: { message?: string; error?: { message?: string } } }
      }
      const message =
        requestError.response?.data?.message ||
        requestError.response?.data?.error?.message ||
        requestError.message ||
        '网络请求失败'
      if (requestError.config?.requestOptions?.errorMessageMode === 'message') {
        useMsg().error?.(message)
      }
      return Promise.reject(
        error instanceof Error && error.message === message ? error : new Error(message),
      )
    }
  }
}

export function useRequest(): InfrastructureAxios {
  return diKT(infrastructureLib.types.InfrastructureAxios)
}
