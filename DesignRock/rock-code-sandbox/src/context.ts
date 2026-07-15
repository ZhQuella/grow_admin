import { inject, type InjectionKey } from 'vue'
import type { SandboxExpose } from './types'

/** 同时支持 Symbol / 字符串 inject，脚本编译场景使用字符串 key */
export const SANDBOX_EXPOSE_INJECT = 'grow-sandbox-expose'
export const SANDBOX_EXPOSE_KEY: InjectionKey<SandboxExpose> | string = SANDBOX_EXPOSE_INJECT

export function useSandboxExpose(): SandboxExpose {
  return inject(SANDBOX_EXPOSE_KEY, {})
}

/** 便捷取 API */
export function useSandboxApis() {
  return useSandboxExpose().apis ?? {}
}
