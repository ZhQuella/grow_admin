/** 设计器事件配置类型：events[uuid][eventType] */

export type DesignerEventItem = {
  /** 函数名（便于调试） */
  name: string
  /** 事件类型，与 map key 一致 */
  eventType: string
  /** 函数体代码 */
  code: string
  /** 是否启用绑定（预览/运行时真正挂载并执行） */
  enabled: boolean
  /**
   * @deprecated 请使用 enabled；读取时兼容旧数据
   */
  immediate?: boolean
}

/** 某组件可配置的事件项 */
export type ComponentEventOption = {
  type: string
  label: string
  describe?: string
}

/** uuid -> eventType -> 配置 */
export type DesignerEventsMap = Record<string, Record<string, DesignerEventItem>>

/** 是否启用绑定（兼容旧字段 immediate） */
export const isEventEnabled = (
  item?: Pick<DesignerEventItem, 'enabled' | 'immediate'> | null,
): boolean => {
  if (!item) return false
  if (typeof item.enabled === 'boolean') return item.enabled
  return item.immediate === true
}
