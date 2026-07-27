/**
 * 页面级数据请求运行时：
 * - defaultData 首屏写入 state[name]
 * - autoLoad 挂载后按 serial / parallel 发起请求
 * - processors: willFetch / fit / didFetch / onError
 */

import type { DesignerApiOutlinedItem, DesignerApiProcessor } from '../../GrowDesigner/components/apiOutlined/types'
import { evaluateExpression } from './resolveBoundProps'

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
  /** 宿主注入的 HTTP 客户端；缺省用原生 fetch */
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

/** 求值 params 中的 value（支持字面量 / 简单表达式） */
const resolveParams = (
  params: DesignerApiOutlinedItem['params'] | undefined,
  state: Record<string, unknown>,
): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  if (!Array.isArray(params)) return out
  for (const row of params) {
    const key = String(row?.key ?? '').trim()
    if (!key) continue
    const raw = String(row?.value ?? '')
    try {
      // eslint-disable-next-line no-new-func
      out[key] = new Function('state', `"use strict"; return (${raw});`)(state)
    } catch {
      out[key] = raw
    }
  }
  return out
}

const defaultHttpClient: ReportHttpClient = async (config) => {
  const method = config.method || 'GET'
  const url = new URL(config.url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.headers || {}),
  }

  let body: string | undefined
  if (method === 'GET' || method === 'DELETE') {
    Object.entries(config.params || {}).forEach(([key, value]) => {
      if (value == null) return
      url.searchParams.set(key, String(value))
    })
  } else {
    body = JSON.stringify(config.data ?? config.params ?? {})
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

/** 执行单个 API，结果写入 state[name] */
export const runSingleApiOutlined = async (
  item: DesignerApiOutlinedItem,
  state: Record<string, unknown>,
  httpClient: ReportHttpClient = defaultHttpClient,
): Promise<void> => {
  const name = String(item.name ?? '').trim()
  if (!name) return
  if (!shouldFetchItem(item, state)) return

  const url = String(item.url ?? '').trim()
  if (!url) return

  let request: ReportHttpRequestConfig = {
    url,
    method: item.method || 'GET',
    params: resolveParams(item.params, state),
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

  const httpClient = options.httpClient || defaultHttpClient
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

/** 重新计算 computedProps（API 写入 state 后调用） */
export const recomputeComputedProps = (
  computedProps: unknown,
  state: Record<string, unknown>,
) => {
  if (!Array.isArray(computedProps)) return
  for (const item of computedProps as Array<{ name?: string; code?: string }>) {
    if (!item || typeof item !== 'object') continue
    const name = String(item.name ?? '').trim()
    if (!name) continue
    try {
      // eslint-disable-next-line no-new-func
      state[name] = new Function(
        'state',
        `"use strict"; return (${String(item.code ?? '')});`,
      )(state)
    } catch (error) {
      console.warn('[GrowComputedProp]', error)
    }
  }
}
