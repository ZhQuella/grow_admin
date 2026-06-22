import type { VNodeChild, PropType as VuePropType } from 'vue-demi'
import type { RouteRecordItem as IRouteRecordItem } from './router'

declare global {
  // define global
  const __VITE_USE_MOCK__: boolean
  const __APP_INFO__: {
    pkg: {
      name: string
      version: string
      dependencies: Recordable<string>
      devDependencies: Recordable<string>
    }
    lastBuildTime: string
  }

  // router
  type RouteRecordItem = IRouteRecordItem

  // vue
  type PropType<T> = VuePropType<T>
  type VueNode = VNodeChild | JSX.Element

  // utils
  type AnyFunction<T> = (...args: any[]) => T
  type PartialReturnType<T extends (...args: unknown[]) => unknown> = Partial<
    ReturnType<T>
  >
  type Nullable<T> = T | null
  type Recordable<T> = Record<string, T>
  type TimeoutHandle = ReturnType<typeof setTimeout>
  type IntervalHandle = ReturnType<typeof setInterval>
  type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>
  }
  interface Fn<T = any, R = T> {
    (...arg: T[]): R
  }

  interface PromiseFn<T = any, R = T> {
    (...arg: T[]): Promise<R>
  }

  type RefType<T> = T | null

  type LabelValueOptions = {
    label: string
    value: any
    [key: string]: string | number | boolean
  }[]

  type EmitType = (event: string, ...args: any[]) => void

  type TargetContext = '_self' | '_blank'

  interface ComponentElRef<T extends HTMLElement = HTMLDivElement> {
    $el: T
  }

  type ComponentRef<T extends HTMLElement = HTMLDivElement> =
    ComponentElRef<T> | null

  type ElRef<T extends HTMLElement = HTMLDivElement> = Nullable<T>
  /**
   * Support for vite import.meta.glob
   */
  type GlobModule = Recordable<any>
  // import.meta
  interface ImportMetaEnv extends ViteEnv {
    __: never
  }
  /**
   * Vite global variable interface
   */
  interface ViteEnv {
    /**
   * 是否开启MOCk
   */
    VITE_USE_MOCK: boolean
    VITE_PUBLIC_PATH: string
    VITE_PROXY: [string, string][]
    /**
     * UNOCSS 独立创建配置文件还是Vite插件集成
     */
    VITE_UNOCSS_TYPE: 'independent' | 'plugin'
    /**
     * 应用的Title
     */
    VITE_GLOB_APP_TITLE: string
    /**
     * 应用的短名称
     */
    VITE_GLOB_APP_SHORT_NAME: string
    /**
     * 是否去掉log日志
     */
    VITE_DROP_CONSOLE: boolean
    /**
     * 是否启用https代理
     */
    VITE_USE_HTTPS: boolean
    /**
     * 是否启用代理
     */
    VITE_USE_PROXY: boolean
    VITE_BUILD_COMPRESS: 'gzip' | 'brotli' | 'none'
    VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE: boolean
    VITE_USE_IMAGEMIN: boolean,
    /**
     * 是否兼容遗产浏览器
     */
    VITE_LEGACY: boolean,
  }
}
