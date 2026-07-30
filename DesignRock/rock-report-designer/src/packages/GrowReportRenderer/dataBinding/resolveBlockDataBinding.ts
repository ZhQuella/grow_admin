import {
  resolveBoundExpression,
  evaluateExpression,
} from '@grow-admin-rock/designer'
import type { ReportBlockDataBinding, ReportDataBindRef } from './types'

const getBySimplePath = (source: unknown, path?: string): unknown => {
  const trimmed = String(path ?? '').trim()
  if (!trimmed) return source
  const keys = trimmed.split('.').filter(Boolean)
  let cur: any = source
  for (const key of keys) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[key]
  }
  return cur
}

/** 是否应按函数体（含 state 上下文）求值，而非字面量表达式 */
const looksLikeBoundScript = (source: string): boolean => {
  const trimmed = source.trim()
  if (!trimmed) return false
  if (/^\s*return\b/.test(trimmed)) return true
  if (/^\s*state\s*[\.\[]/.test(trimmed)) return true
  if (/^\s*(const|let|var|if|for|while|switch|try)\b/.test(trimmed)) return true
  if (/[\n;]/.test(trimmed)) return true
  return false
}

/** 解析单路绑定 */
export function resolveDataBindRef(
  ref: ReportDataBindRef | null | undefined,
  state: Record<string, unknown>,
): unknown {
  if (!ref) return undefined
  const source = String(ref.source ?? '').trim()
  if (!source) return undefined

  let value: unknown
  try {
    value = looksLikeBoundScript(source)
      ? resolveBoundExpression(source, state)
      : evaluateExpression(source)
  } catch {
    value = undefined
  }

  if ((ref.mode || 'bind') === 'bind') return value

  const mapped = getBySimplePath(value, ref.mapping?.path)
  const fields = ref.mapping?.fields
  if (Array.isArray(fields) && fields.length && Array.isArray(mapped)) {
    if (fields.length === 1) {
      return mapped.map((row: any) =>
        row && typeof row === 'object' ? row[fields[0]] : row,
      )
    }
    return mapped.map((row: any) => {
      if (!row || typeof row !== 'object') return row
      return fields.map((field) => row[field])
    })
  }
  return mapped
}

export type ResolvedChartDataPayload = {
  xAxisData?: unknown
  yAxisData?: unknown
  seriesData?: unknown[]
  chartData?: unknown
  radarIndicator?: unknown
}

/** 将区块 dataBinding 解析为可注入 ECharts 的数据载荷 */
export function resolveBlockDataBinding(
  binding: ReportBlockDataBinding | null | undefined,
  state: Record<string, unknown>,
): ResolvedChartDataPayload {
  if (!binding) return {}
  return {
    xAxisData: resolveDataBindRef(binding.xAxisData, state),
    yAxisData: resolveDataBindRef(binding.yAxisData, state),
    seriesData: Array.isArray(binding.seriesData)
      ? binding.seriesData.map((item) => resolveDataBindRef(item, state))
      : undefined,
    chartData: resolveDataBindRef(binding.chartData, state),
    radarIndicator: resolveDataBindRef(binding.radarIndicator, state),
  }
}
