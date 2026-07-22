/** 页面级 state 监听配置：pageConfig.watchers[source] */

export type DesignerWatcherItem = {
  /** 内部函数名（由 source 自动生成，UI 不展示） */
  name: string
  /** 监听路径，如 state.user.name（与 map key 一致） */
  source: string
  /** 函数体：可用 value / oldValue / state */
  code: string
  /** 是否启用绑定 */
  enabled: boolean
  /** 是否深度监听（对象/数组内部变化） */
  deep: boolean
  /** 挂载时是否先执行一次 */
  immediate: boolean
}

/** source -> 配置 */
export type DesignerWatchersMap = Record<string, DesignerWatcherItem>

export const isWatcherEnabled = (
  item?: Pick<DesignerWatcherItem, 'enabled'> | null,
): boolean => Boolean(item?.enabled)

/** 由监听路径生成默认函数名：state.user.name → onUserNameChange */
export const defaultWatcherName = (source: string) => {
  const path = String(source || '')
    .replace(/^state\./, '')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
  if (!path.length) return 'onStateChange'
  const pascal = path
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('')
  return `on${pascal}Change`
}
