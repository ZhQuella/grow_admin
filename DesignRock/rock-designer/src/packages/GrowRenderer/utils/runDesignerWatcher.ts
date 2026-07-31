import { watch, type WatchStopHandle } from 'vue'
import type { DesignerWatcherItem } from '../../GrowDesigner/static/pageWatchers'
import { isWatcherEnabled } from '../../GrowDesigner/static/pageWatchers'
import {
  parseStatePath,
} from './resolveBoundProps'
import type { DesignerRuntimeRefs } from './runtimeRefs'

const SAFE_NAME_RE = /^[A-Za-z_$][\w$]*$/

/** 按 state.xxx 路径读取当前值（监听源，不做函数体求值） */
const getByStatePath = (
  state: Record<string, unknown>,
  expr: string,
): unknown => {
  const path = parseStatePath(expr)
  if (!path?.length) return undefined
  let cursor: any = state
  for (const key of path) {
    if (cursor == null || typeof cursor !== 'object') return undefined
    cursor = cursor[key]
  }
  return cursor
}

/** 执行监听回调函数体；上下文：value、oldValue、state、refs */
export const runDesignerWatcher = (
  item: DesignerWatcherItem,
  value: unknown,
  oldValue: unknown,
  state: Record<string, unknown>,
  refs: DesignerRuntimeRefs = {},
) => {
  if (!isWatcherEnabled(item)) return
  const code = String(item.code ?? '')
  const rawName = String(item.name || 'handler').trim()
  const fnName = SAFE_NAME_RE.test(rawName) ? rawName : 'handler'
  try {
    // eslint-disable-next-line no-new-func
    const runner = new Function(
      'value',
      'oldValue',
      'state',
      'refs',
      `"use strict";\nreturn (function ${fnName}(value, oldValue, state, refs) {\n${code}\n})(value, oldValue, state, refs);`,
    )
    runner(value, oldValue, state, refs)
  } catch (error) {
    console.error(`[GrowWatcher:${fnName}/${item.source}]`, error)
  }
}

/**
 * 为 pageConfig.watchers 建立运行时 watch。
 * 返回 stop 函数，便于卸载时清理。
 */
export const setupPageWatchers = (
  watchers: Record<string, DesignerWatcherItem> | undefined,
  state: Record<string, unknown>,
  refs: DesignerRuntimeRefs = {},
): WatchStopHandle => {
  const stops: WatchStopHandle[] = []
  if (!watchers || typeof watchers !== 'object') {
    return () => undefined
  }

  for (const [key, item] of Object.entries(watchers)) {
    if (!item || typeof item !== 'object') continue
    if (!isWatcherEnabled(item)) continue
    const source = String(item.source || key).trim()
    if (!source) continue
    // 仅支持 state.xxx 路径，避免任意表达式带来的副作用
    if (!parseStatePath(source)) {
      console.warn(`[GrowWatcher] 仅支持 state.xxx 路径：${source}`)
      continue
    }

    const stop = watch(
      () => getByStatePath(state, source),
      (value, oldValue) => {
        runDesignerWatcher(item, value, oldValue, state, refs)
      },
      {
        deep: Boolean(item.deep),
        immediate: Boolean(item.immediate),
      },
    )
    stops.push(stop)
  }

  return () => {
    for (const stop of stops) stop()
  }
}
