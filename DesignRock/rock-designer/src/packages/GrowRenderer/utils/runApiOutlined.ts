/**
 * 页面级数据请求运行时：
 * - defaultData 首屏写入 state[name]
 * - autoLoad 挂载后按 serial / parallel 发起请求
 * - processors: willFetch / fit / didFetch / onError
 */

import type { DesignerApiOutlinedItem, DesignerApiParam, DesignerApiProcessor } from '../../GrowDesigner/components/apiOutlined/types'
import {
  normalizePropBindMode,
  PROP_BIND_MODE_BIND,
} from '../../GrowDesigner/static/propBindModes'
import {
  evaluateComputedExpression,
  evaluateExpression,
  resolveBoundExpression,
} from './resolveBoundProps'
import { createInfrastructureHttpClient } from './infrastructureHttpClient'
import { watch, type WatchStopHandle } from 'vue'

export type ReportHttpRequestConfig = {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params?: Record<string, unknown>
  data?: Record<string, unknown>
  headers?: Record<string, string>
}

export type ReportHttpClient = (
  config: ReportHttpRequestConfig,
) => Promise<unknown>

export type RunApiOutlinedOptions = {
  /** 宿主注入的 HTTP 客户端；缺省走 infrastructure Axios */
  httpClient?: ReportHttpClient
  /** 仅执行 autoLoad 的项；false 时仍可写入 defaultData */
  autoLoadOnly?: boolean
}

const runProcessor = (
  processor: DesignerApiProcessor | undefined,
  args: Record<string, unknown>,
): unknown => {
  if (!processor) return undefined
  const code = String(processor.code ?? '').trim()
  if (!code) return undefined
  const keys = Object.keys(args)
  const values = keys.map((key) => args[key])
  try {
    // eslint-disable-next-line no-new-func
    const runner = new Function(...keys, `"use strict";\n${code}`)
    return runner(...values)
  } catch (error) {
    console.error(`[GrowApiOutlined:${processor.type}]`, error)
    return undefined
  }
}

const findProcessor = (
  item: DesignerApiOutlinedItem,
  type: DesignerApiProcessor['type'],
) => item.processors?.find((p) => p.type === type)

/** 求值参数列表中的 value：bind 模式读 state；text 模式为固定值 */
const resolveParams = (
  params: DesignerApiParam[] | undefined,
  state: Record<string, unknown>,
): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  if (!Array.isArray(params)) return out
  for (const row of params) {
    const key = String(row?.key ?? '').trim()
    if (!key) continue
    const raw = String(row?.value ?? '')
    if (!raw) {
      out[key] = raw
      continue
    }

    const hasExplicitMode = row?.bindMode != null && String(row.bindMode).trim() !== ''

    // 明确 text：固定字面量
    if (hasExplicitMode && normalizePropBindMode(row.bindMode) !== PROP_BIND_MODE_BIND) {
      out[key] = raw
      continue
    }

    // 明确 bind：按 state 表达式求值
    if (hasExplicitMode) {
      out[key] = resolveBoundExpression(raw, state)
      continue
    }

    // 旧数据无 bindMode：尝试函数体求值，失败则回退字面量
    try {
      const evaluated = resolveBoundExpression(raw, state)
      out[key] = evaluated === undefined ? raw : evaluated
    } catch {
      out[key] = raw
    }
  }
  return out
}

/** 路径占位未传递：null / undefined / "" */
const isPathValueMissing = (value: unknown) => value == null || value === ''

/**
 * 将 URL 中的 {key} / {key?} 替换为 pathParams 值。
 * {key?} 的 ? 仅表示可选语义，运行时与 {key} 相同；未传时替换为空段。
 */
export const applyPathParams = (
  url: string,
  pathParams: Record<string, unknown>,
): string => {
  return String(url || '').replace(/\{([^{}?]+)(\?)?\}/g, (_match, key: string) => {
    const value = pathParams[key]
    if (isPathValueMissing(value)) return ''
    return encodeURIComponent(String(value))
  })
}

export const defaultHttpClient: ReportHttpClient = async (config) => {
  const method = config.method || 'GET'
  const url = new URL(config.url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.headers || {}),
  }

  Object.entries(config.params || {}).forEach(([key, value]) => {
    if (value == null) return
    url.searchParams.set(key, String(value))
  })

  let body: string | undefined
  if (method !== 'GET' && config.data != null) {
    body = JSON.stringify(config.data)
  }

  const response = await fetch(url.toString(), { method, headers, body })
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`) as Error & { response?: unknown }
    error.response = payload
    throw error
  }
  return payload
}

/**
 * 解析实际 HTTP 客户端：
 * 1. 宿主显式传入
 * 2. 默认 @grow-admin-rock/infrastructure Axios（与业务 API 同一套）
 * 3. infrastructure 不可用时回退原生 fetch
 */
export const resolveDesignerHttpClient = (
  injected?: ReportHttpClient | null,
): ReportHttpClient => {
  if (injected) return injected
  return createInfrastructureHttpClient(defaultHttpClient)
}

const shouldFetchItem = (
  item: DesignerApiOutlinedItem,
  state: Record<string, unknown>,
): boolean => {
  if (item.shouldFetch === false) return false
  // shouldFetch 目前为 boolean；后续可扩展为表达式
  return true
}

/** 将 defaultData 写入 state（不发请求） */
export const applyApiDefaultData = (
  apiList: unknown,
  state: Record<string, unknown>,
) => {
  if (!Array.isArray(apiList)) return
  for (const raw of apiList as DesignerApiOutlinedItem[]) {
    if (!raw || typeof raw !== 'object') continue
    const name = String(raw.name ?? '').trim()
    if (!name) continue
    const defaultData = String(raw.defaultData ?? '').trim()
    if (!defaultData) continue
    // 已有同名数据源时不覆盖
    if (Object.prototype.hasOwnProperty.call(state, name) && state[name] !== undefined) {
      continue
    }
    state[name] = evaluateExpression(defaultData)
  }
}

export type RunSingleApiOutlinedOptions = {
  /** 事件手动调用时忽略 shouldFetch，强制发起请求 */
  force?: boolean
}

export type ApiOutlinedMethods = Record<
  string,
  () => Promise<unknown>
>

export type BuildApiOutlinedMethodsOptions = {
  httpClient?: ReportHttpClient
  /** 请求成功后按最新 state 重算计算属性 */
  computedProps?: unknown
}

/** 执行单个 API，结果写入 state[name] */
export const runSingleApiOutlined = async (
  item: DesignerApiOutlinedItem,
  state: Record<string, unknown>,
  httpClient: ReportHttpClient = resolveDesignerHttpClient(),
  options: RunSingleApiOutlinedOptions = {},
): Promise<void> => {
  const name = String(item.name ?? '').trim()
  if (!name) return
  if (!options.force && !shouldFetchItem(item, state)) return

  const url = String(item.url ?? '').trim()
  if (!url) return

  const method = item.method || 'GET'
  let request: ReportHttpRequestConfig = {
    url: applyPathParams(url, resolveParams(item.pathParams, state)),
    method,
    params: resolveParams(item.params, state),
  }
  if (method !== 'GET') {
    request.data = resolveParams(item.body, state)
  }

  const willFetch = findProcessor(item, 'willFetch')
  if (willFetch) {
    const next = runProcessor(willFetch, { request, state, config: item })
    if (next && typeof next === 'object') {
      request = { ...request, ...(next as ReportHttpRequestConfig) }
    }
  }

  try {
    let response = await httpClient(request)

    const fit = findProcessor(item, 'fit')
    if (fit) {
      const fitted = runProcessor(fit, { response, state, config: item })
      if (fitted !== undefined) response = fitted
    }

    state[name] = response

    const didFetch = findProcessor(item, 'didFetch')
    if (didFetch) {
      runProcessor(didFetch, { response, state, config: item })
    }
  } catch (error) {
    const onError = findProcessor(item, 'onError')
    if (onError) {
      runProcessor(onError, { error, state, config: item })
    } else {
      console.error(`[GrowApiOutlined:${name}]`, error)
    }
  }
}

/**
 * 执行页面 apiOutlined：
 * 1. 先写入 defaultData
 * 2. 再按 loadType 执行 autoLoad 项（或全部，由 options 控制）
 */
export const runApiOutlinedList = async (
  apiList: unknown,
  state: Record<string, unknown>,
  options: RunApiOutlinedOptions = {},
): Promise<void> => {
  if (!Array.isArray(apiList) || !apiList.length) return

  applyApiDefaultData(apiList, state)

  const httpClient = options.httpClient || resolveDesignerHttpClient()
  const list = (apiList as DesignerApiOutlinedItem[]).filter((item) => {
    if (!item || typeof item !== 'object') return false
    if (options.autoLoadOnly !== false && !item.autoLoad) return false
    return !!String(item.name ?? '').trim()
  })

  if (!list.length) return

  // loadType 取第一项作为整页策略（与配置 UI 一致：每项都有 loadType，按组串/并）
  const loadType = list[0]?.loadType === 'serial' ? 'serial' : 'parallel'

  if (loadType === 'serial') {
    for (const item of list) {
      await runSingleApiOutlined(item, state, httpClient)
    }
    return
  }

  await Promise.all(list.map((item) => runSingleApiOutlined(item, state, httpClient)))
}

/**
 * 将页面 apiOutlined 转为可在事件中调用的方法表：
 * 配置名称 getList → 事件里 `apis.getList()` / `await apis.getList()`
 */
export const buildApiOutlinedMethods = (
  apiList: unknown,
  state: Record<string, unknown>,
  options: BuildApiOutlinedMethodsOptions = {},
): ApiOutlinedMethods => {
  const methods: ApiOutlinedMethods = {}
  if (!Array.isArray(apiList)) return methods

  const httpClient = options.httpClient || resolveDesignerHttpClient()
  for (const raw of apiList as DesignerApiOutlinedItem[]) {
    if (!raw || typeof raw !== 'object') continue
    const name = String(raw.name ?? '').trim()
    if (!name) continue
    const item = raw
    methods[name] = async () => {
      await runSingleApiOutlined(item, state, httpClient, { force: true })
      recomputeComputedProps(options.computedProps, state)
      return state[name]
    }
  }
  return methods
}

/** 重新计算 computedProps（API 写入 state / 依赖变化后调用） */
export const recomputeComputedProps = (
  computedProps: unknown,
  state: Record<string, unknown>,
) => {
  if (!Array.isArray(computedProps)) return
  for (const item of computedProps as Array<{ name?: string; code?: string }>) {
    if (!item || typeof item !== 'object') continue
    const name = String(item.name ?? '').trim()
    if (!name) continue
    const code = String(item.code ?? '').trim()
    if (!code) {
      state[name] = undefined
      continue
    }
    state[name] = evaluateComputedExpression(code, state)
  }
}

/** 收集计算属性名称，避免监听自身写入造成循环 */
export const collectComputedPropNames = (computedProps: unknown): Set<string> => {
  const names = new Set<string>()
  if (!Array.isArray(computedProps)) return names
  for (const item of computedProps as Array<{ name?: string }>) {
    if (!item || typeof item !== 'object') continue
    const name = String(item.name ?? '').trim()
    if (name) names.add(name)
  }
  return names
}

/**
 * 监听 state 中「非计算属性」字段变化，自动重算 computedProps。
 * 覆盖：数据源/请求结果更新、双向绑定回写、事件修改 state 等。
 */
export const setupComputedPropReactivity = (
  state: Record<string, unknown>,
  getComputedProps: () => unknown,
): WatchStopHandle => {
  let running = false
  return watch(
    () => {
      const computedNames = collectComputedPropNames(getComputedProps())
      const deps: Record<string, unknown> = {}
      for (const key of Object.keys(state)) {
        if (computedNames.has(key)) continue
        deps[key] = state[key]
      }
      return deps
    },
    () => {
      if (running) return
      running = true
      try {
        recomputeComputedProps(getComputedProps(), state)
      } finally {
        running = false
      }
    },
    { deep: true },
  )
}
