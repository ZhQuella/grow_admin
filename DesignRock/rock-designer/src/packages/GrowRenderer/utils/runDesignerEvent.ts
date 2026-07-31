import type { DesignerEventItem } from '../../GrowDesigner/static/elementEvents/types'
import { isEventEnabled } from '../../GrowDesigner/static/elementEvents/types'
import type { ApiOutlinedMethods } from './runApiOutlined'
import type { DesignerRuntimeRefs } from './runtimeRefs'

const SAFE_NAME_RE = /^[A-Za-z_$][\w$]*$/

/** 将事件类型转为 Vue onXxx 监听属性名 */
export const toVueListenerProp = (eventType: string): string => {
  const type = String(eventType || '').trim()
  if (!type) return 'onClick'
  if (type.includes(':')) {
    const [head, ...rest] = type.split(':')
    const suffix = rest.join(':')
    return `on${head.charAt(0).toUpperCase()}${head.slice(1)}:${suffix}`
  }
  // visible-change → onVisibleChange（Vue 也会匹配 visible-change）
  const camel = type.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
  return `on${camel.charAt(0).toUpperCase()}${camel.slice(1)}`
}

/** 编译并执行事件函数体；上下文：event、state、apis、refs */
export const runDesignerEvent = (
  item: DesignerEventItem,
  event: unknown,
  state: Record<string, unknown>,
  apis: ApiOutlinedMethods = {},
  refs: DesignerRuntimeRefs = {},
) => {
  if (!isEventEnabled(item)) return
  const code = String(item.code ?? '')
  const rawName = String(item.name || 'handler').trim()
  const fnName = SAFE_NAME_RE.test(rawName) ? rawName : 'handler'
  try {
    // eslint-disable-next-line no-new-func
    const runner = new Function(
      'event',
      'state',
      'apis',
      'refs',
      `"use strict";\nreturn (async function ${fnName}(event, state, apis, refs) {\n${code}\n})(event, state, apis, refs);`,
    )
    return runner(event, state, apis, refs)
  } catch (error) {
    console.error(`[GrowEvent:${fnName}/${item.eventType}]`, error)
  }
}

/** 由 events[uuid] 生成可合并进组件 props 的 onXxx 监听表 */
export const buildRuntimeEventProps = (
  events: Record<string, DesignerEventItem> | undefined,
  state: Record<string, unknown>,
  apis: ApiOutlinedMethods = {},
  refs: DesignerRuntimeRefs = {},
): Record<string, (...args: unknown[]) => void> => {
  const result: Record<string, (...args: unknown[]) => void> = {}
  if (!events || typeof events !== 'object') return result
  for (const [eventType, item] of Object.entries(events)) {
    if (!item || typeof item !== 'object') continue
    if (!isEventEnabled(item)) continue
    const key = toVueListenerProp(item.eventType || eventType)
    result[key] = (...args: unknown[]) => {
      void runDesignerEvent(item, args[0], state, apis, refs)
    }
  }
  return result
}
