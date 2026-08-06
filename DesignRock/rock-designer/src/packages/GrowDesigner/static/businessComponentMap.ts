import type { Component } from 'vue'
import { GrowPersonSelect } from '@grow-admin-rock/business-components'

/** 业务组件：本地解析，不依赖全局 Vue.component 注册 */
export const businessComponentMap: Record<string, Component> = {
  GrowPersonSelect,
}

export function resolveBusinessComponent(
  elTagName?: string,
): string | Component | undefined {
  if (!elTagName) return elTagName
  return businessComponentMap[elTagName] || elTagName
}
