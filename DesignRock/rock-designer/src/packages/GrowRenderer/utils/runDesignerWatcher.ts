import { watch, type WatchStopHandle } from 'vue'
import type { DesignerWatcherItem } from '../../GrowDesigner/static/pageWatchers'
import { isWatcherEnabled } from '../../GrowDesigner/static/pageWatchers'
import {
  parseStatePath,
  resolveBoundExpression,
} from './resolveBoundProps'

const SAFE_NAME_RE = /^[A-Za-z_$][\w$]*$/

/** 执行监听回调函数体；上下文：value、oldValue、state */
export const runDesignerWatcher = (
  item: DesignerWatcherItem,
  value: unknown,
  oldValue: unknown,
  state: Record<string, unknown>,
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
      `"use strict";\nreturn (function ${fnName}(value, oldValue, state) {\n${code}\n})(value, oldValue, state);`,
    )
    runner(value, oldValue, state)
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
      () => resolveBoundExpression(source, state),
      (value, oldValue) => {
        runDesignerWatcher(item, value, oldValue, state)
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
