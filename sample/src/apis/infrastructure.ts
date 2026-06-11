import type { RequestOptions } from '@grow-admin-rock/types'
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
        throw new Error(data.message || '请求失败')
      }

      if (data.data !== undefined) {
        return data.data
      }

      if (data.result !== undefined) {
        return data.result
      }

      return data
    }
  }
}

export function useRequest(): InfrastructureAxios {
  return diKT(infrastructureLib.types.InfrastructureAxios)
}
