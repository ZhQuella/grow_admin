import { cloneDeep } from '@grow-admin-rock/utils'
import type { CartesianSeriesType } from '../chartTypes'

function resolveCartesianSeriesType(type: unknown): CartesianSeriesType {
  if (type === 'scatter' || type === 'bar' || type === 'candlestick') return type
  return 'line'
}

function isEmptyValue(value: unknown): boolean {
  if (value == null) return true
  if (value === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

/** 递归剔除空字符串 / 空对象 / undefined，避免污染 ECharts option */
function pruneEmpty<T>(input: T): T {
  if (Array.isArray(input)) {
    return input
      .map((item) => pruneEmpty(item))
      .filter((item) => !isEmptyValue(item)) as T
  }
  if (!isPlainObject(input)) return input

  const out: Record<string, any> = {}
  Object.entries(input).forEach(([key, value]) => {
    if (isEmptyValue(value)) return
    const next = pruneEmpty(value)
    if (isEmptyValue(next)) return
    if (isPlainObject(next) && !Object.keys(next).length) return
    out[key] = next
  })
  return out as T
}

function parseNumberList(value: unknown): number | number[] | undefined {
  if (value == null || value === '') return undefined
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (Array.isArray(value)) {
    const nums = value.map((item) => Number(item)).filter((n) => !Number.isNaN(n))
    return nums.length ? nums : undefined
  }
  const text = String(value).trim()
  if (!text) return undefined
  if (!text.includes(',') && !text.includes('，')) {
    const n = Number(text)
    return Number.isNaN(n) ? undefined : n
  }
  const nums = text
    .split(/[,，]/)
    .map((item) => Number(item.trim()))
    .filter((n) => !Number.isNaN(n))
  return nums.length ? nums : undefined
}

function parseOffset(value: unknown): (string | number)[] | undefined {
  if (value == null || value === '') return undefined
  if (Array.isArray(value)) return value as (string | number)[]
  const text = String(value).trim()
  if (!text) return undefined
  const parts = text.split(/[,，\s]+/).filter(Boolean)
  if (parts.length < 2) return undefined
  return parts.slice(0, 2).map((part) => {
    const n = Number(part)
    return Number.isNaN(n) ? part : n
  })
}

/**
 * 将设计器中的直角坐标系列项编译为 ECharts series（不含 data）
 * 兼容旧字段：areaStyle true/false、扁平 barWidth 等
 */
export function compileCartesianSeriesItem(
  raw: Record<string, any>,
  index: number,
): Record<string, any> {
  const item = cloneDeep(raw || {})
  delete item._dragKey

  // 兼容旧布尔面积开关
  if (item.areaStyle === true) item.areaStyle = {}
  if (item.areaStyle === false) delete item.areaStyle

  const type = resolveCartesianSeriesType(item.type)
  item.type = type
  item.name = item.name || `系列${index + 1}`
  item.yAxisIndex = Number(item.yAxisIndex) === 1 ? 1 : 0
  if (item.xAxisIndex != null) item.xAxisIndex = Number(item.xAxisIndex) || 0

  if (item.borderRadius != null || item.itemStyle?.borderRadius != null) {
    item.itemStyle = {
      ...(item.itemStyle || {}),
      borderRadius:
        parseNumberList(item.itemStyle?.borderRadius ?? item.borderRadius) ??
        item.itemStyle?.borderRadius,
    }
    delete item.borderRadius
  }

  if (item.symbolOffset != null) {
    const offset = parseOffset(item.symbolOffset)
    if (offset) item.symbolOffset = offset
    else delete item.symbolOffset
  }

  if (item.backgroundStyle?.borderRadius != null) {
    item.backgroundStyle = {
      ...item.backgroundStyle,
      borderRadius: parseNumberList(item.backgroundStyle.borderRadius),
    }
  }

  // step: false 删除
  if (item.step === false || item.step === '' || item.step === 'false') delete item.step

  // 空 stack 删除
  if (item.stack === '') delete item.stack

  item.data = []

  return pruneEmpty(item)
}

export function compileCartesianSeriesList(
  list?: Array<Record<string, any>> | null,
): Array<Record<string, any>> {
  if (!Array.isArray(list) || !list.length) return []
  return list.map((item, index) => compileCartesianSeriesItem(item, index))
}
