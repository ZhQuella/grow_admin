import {
  StoreGeneric,
  storeToRefs,
  useSiteGeneral
} from '@grow-admin-rock/state'

import { _merge } from '@grow-admin-rock/utils'
import { DefineSiteOptions } from '@grow-admin-rock/types'
import { unref } from 'vue-demi'

/**
 * 获取全局定义配置
 * 
 * @returns 
 */
export const useDefininationConfig = () => {
  const siteGeneralStore = useSiteGeneral()
  const siteGeneral = storeToRefs(
    siteGeneralStore as StoreGeneric,
  ) as unknown as DefineSiteOptions
  const initSiteGeneralConfig = (
    configs: DeepPartial<DefineSiteOptions>,
  ) => {
    siteGeneralStore.$patch((state) => {
      _merge(state, configs)
    })
  }
  return {
    ...siteGeneral,
    envValues: unref(siteGeneral.env),
    initSiteGeneralConfig,
  }
}
