import type {
  CleanApiSourceConfig,
  CleanConditionConfig,
  CleanDedupeConfig,
  CleanFilterCondition,
  CleanFilterConfig,
  CleanFlow,
  CleanFlowEdge,
  CleanFlowNode,
  CleanFormatConfig,
  CleanGroupByConfig,
  CleanGroupByMetric,
  CleanJoinConfig,
  CleanNodeType,
  CleanNullHandleConfig,
  CleanOutputConfig,
  CleanOutlierConfig,
  CleanPivotConfig,
  CleanPreviewColumn,
  CleanPreviewResult,
  CleanSplitFieldConfig,
  CleanTableSourceConfig,
  CleanTrimCaseConfig,
  CleanUnionConfig,
} from '../types'
import {
  buildCleanTableRowsMap,
  findDemoTable,
  resolveDemoApiFrame,
  type CleanTableRowsMap,
} from '../static/demoTables'
import { NODE_TYPE_META } from '../static/nodeCatalog'

/** 已实现真实变换的节点（当前全部类型） */
export const CLEAN_IMPLEMENTED_NODE_TYPES: CleanNodeType[] = [
  'table',
  'api',
  'null-handle',
  'format',
  'dedupe',
  'trim-case',
  'outlier',
  'filter',
  'condition',
  'split-field',
  'join',
  'union',
  'groupby',
  'pivot',
  'output',
]

const DEFAULT_PREVIEW_LIMIT = 50

export type CleanRunOptions = {
  targetNodeId?: string
  toOutput?: boolean
  tableRows?: CleanTableRowsMap
  limit?: number
}

type Frame = {
  columns: CleanPreviewColumn[]
  rows: Record<string, unknown>[]
}

function cloneRows(rows: Record<string, unknown>[]) {
  return rows.map((row) => ({ ...row }))
}

function inferColumns(rows: Record<string, unknown>[], fallback?: CleanPreviewColumn[]) {
  if (fallback?.length) return fallback.map((col) => ({ ...col }))
  const keys = new Set<string>()
  for (const row of rows.slice(0, 20)) {
    Object.keys(row).forEach((key) => keys.add(key))
  }
  return [...keys].map((key) => ({ key, title: key }))
}

function isEmptyValue(value: unknown) {
  return value == null || value === ''
}

/** `fields: []` 表示「全部字段」；空数组在 JS 中为 truthy，不能用 `||` 回退 */
function resolveFields(
  configured: string[] | undefined,
  fallback: string[],
): string[] {
  const fields = (configured || []).filter(Boolean)
  return fields.length ? fields : fallback
}

function asString(value: unknown) {
  return value == null ? '' : String(value)
}

/** 按字段列表投影；`null`/`undefined` = 透传全部；`[]` = 空结果 */
function projectFrame(frame: Frame, fields?: string[] | null): Frame {
  if (fields == null) return frame

  const keys = fields.filter(Boolean)
  const colMap = new Map(frame.columns.map((col) => [col.key, col]))
  return {
    columns: keys.map((key) => colMap.get(key) || { key, title: key }),
    rows: keys.length
      ? frame.rows.map((row) => {
          const next: Record<string, unknown> = {}
          for (const key of keys) next[key] = row[key]
          return next
        })
      : frame.rows.map(() => ({})),
  }
}

function compareValues(left: unknown, op: string, right: string): boolean {
  if (op === 'empty') return isEmptyValue(left)
  if (op === 'not-empty') return !isEmptyValue(left)

  const leftStr = asString(left)
  const rightStr = right ?? ''

  if (op === 'contains') return leftStr.includes(rightStr)
  if (op === 'not-contains') return !leftStr.includes(rightStr)

  const leftNum = Number(left)
  const rightNum = Number(rightStr)
  const bothNumeric =
    left !== '' &&
    rightStr !== '' &&
    !Number.isNaN(leftNum) &&
    !Number.isNaN(rightNum) &&
    Number.isFinite(leftNum) &&
    Number.isFinite(rightNum)

  switch (op) {
    case 'eq':
      return bothNumeric ? leftNum === rightNum : leftStr === rightStr
    case 'neq':
      return bothNumeric ? leftNum !== rightNum : leftStr !== rightStr
    case 'gt':
      return bothNumeric ? leftNum > rightNum : leftStr > rightStr
    case 'gte':
      return bothNumeric ? leftNum >= rightNum : leftStr >= rightStr
    case 'lt':
      return bothNumeric ? leftNum < rightNum : leftStr < rightStr
    case 'lte':
      return bothNumeric ? leftNum <= rightNum : leftStr <= rightStr
    default:
      return false
  }
}

function matchConditions(
  row: Record<string, unknown>,
  logic: 'and' | 'or',
  conditions: CleanFilterCondition[],
) {
  const list = conditions.filter((item) => item.field)
  if (!list.length) return true
  const check = (cond: CleanFilterCondition) =>
    compareValues(row[cond.field], cond.op || 'eq', cond.value ?? '')
  return logic === 'or' ? list.some(check) : list.every(check)
}

function loadTableFrame(
  node: CleanFlowNode,
  tableRows: CleanTableRowsMap,
  warnings: string[],
): Frame {
  const config = (node.config || {}) as CleanTableSourceConfig
  const key = config.refId || config.tableId || config.tableName || ''
  if (!key) {
    warnings.push(`「${node.name}」：未选择数据表`)
    return { columns: [], rows: [] }
  }

  const demo = findDemoTable(key)
  let rows =
    tableRows[key] ||
    (config.tableName ? tableRows[config.tableName] : undefined) ||
    demo?.rows ||
    []

  rows = cloneRows(rows)

  // null/undefined = 全部；[] = 无字段；非空 = 投影
  if (config.fields != null) {
    return projectFrame(
      {
        columns:
          demo?.columns.map((col) => ({ ...col })) || inferColumns(rows),
        rows,
      },
      config.fields,
    )
  }

  const columns =
    demo?.columns.map((col) => ({ ...col })) || inferColumns(rows)

  if (!rows.length) {
    warnings.push(`「${node.name}」：未找到 Mock 行数据（${key}）`)
  }

  return { columns, rows }
}

function loadApiFrame(node: CleanFlowNode, warnings: string[]): Frame {
  const config = (node.config || {}) as CleanApiSourceConfig
  const frame = resolveDemoApiFrame(config.url)
  if (!config.url) {
    warnings.push(`「${node.name}」：未填写 URL，已使用默认 Mock API 样例`)
  } else {
    warnings.push(`「${node.name}」：API 源使用本地 Mock（不会发起真实 HTTP）`)
  }
  return {
    columns: frame.columns.map((col) => ({ ...col })),
    rows: cloneRows(frame.rows),
  }
}

function applyTrimCase(frame: Frame, config: CleanTrimCaseConfig): Frame {
  const fields = resolveFields(
    config.fields,
    frame.columns.map((col) => col.key).filter((key) => {
      const sample = frame.rows.find((row) => row[key] != null)?.[key]
      return typeof sample === 'string' || sample == null
    }),
  )
  const ops = config.ops?.length ? config.ops : (['trim'] as CleanTrimCaseConfig['ops'])

  const rows = frame.rows.map((row) => {
    const next = { ...row }
    for (const field of fields) {
      let value = next[field]
      if (value == null) continue
      let text = String(value)
      for (const op of ops || []) {
        if (op === 'trim') text = text.trim()
        else if (op === 'trim-all') text = text.replace(/\s+/g, '')
        else if (op === 'upper') text = text.toUpperCase()
        else if (op === 'lower') text = text.toLowerCase()
        else if (op === 'capitalize') {
          const trimmed = text.trim()
          text = trimmed
            ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
            : trimmed
        }
      }
      next[field] = text
    }
    return next
  })
  return { columns: frame.columns, rows }
}

function applyNullHandle(frame: Frame, config: CleanNullHandleConfig): Frame {
  const fields = resolveFields(
    config.fields,
    frame.columns.map((col) => col.key),
  )
  const strategy = config.strategy || 'fill'

  if (strategy === 'drop-row') {
    const rows = frame.rows.filter((row) =>
      fields.every((field) => !isEmptyValue(row[field])),
    )
    return { columns: frame.columns, rows }
  }

  if (strategy === 'ffill' || strategy === 'bfill') {
    const rows = cloneRows(frame.rows)
    const sequence = strategy === 'ffill' ? rows : [...rows].reverse()
    const last = new Map<string, unknown>()
    for (const row of sequence) {
      for (const field of fields) {
        if (!isEmptyValue(row[field])) last.set(field, row[field])
        else if (last.has(field)) row[field] = last.get(field)
      }
    }
    return {
      columns: frame.columns,
      rows: strategy === 'ffill' ? rows : sequence.reverse(),
    }
  }

  const fillValue = config.fillValue ?? ''
  const rows = frame.rows.map((row) => {
    const next = { ...row }
    for (const field of fields) {
      if (isEmptyValue(next[field])) next[field] = fillValue
    }
    return next
  })
  return { columns: frame.columns, rows }
}

function applyFilter(frame: Frame, config: CleanFilterConfig): Frame {
  const logic = config.logic || 'and'
  const conditions = config.conditions || []
  const rows = frame.rows.filter((row) => matchConditions(row, logic, conditions))
  return { columns: frame.columns, rows }
}

function applyDedupe(frame: Frame, config: CleanDedupeConfig): Frame {
  const fields = resolveFields(
    config.fields,
    frame.columns.map((col) => col.key),
  )
  const keep = config.keep || 'first'
  const keyOf = (row: Record<string, unknown>) =>
    fields.map((field) => JSON.stringify(row[field] ?? null)).join('||')

  if (keep === 'last') {
    const map = new Map<string, Record<string, unknown>>()
    for (const row of frame.rows) map.set(keyOf(row), { ...row })
    return { columns: frame.columns, rows: [...map.values()] }
  }

  if (keep === 'random') {
    const buckets = new Map<string, Record<string, unknown>[]>()
    for (const row of frame.rows) {
      const key = keyOf(row)
      const list = buckets.get(key) || []
      list.push({ ...row })
      buckets.set(key, list)
    }
    const rows = [...buckets.values()].map(
      (list) => list[Math.floor(Math.random() * list.length)],
    )
    return { columns: frame.columns, rows }
  }

  const seen = new Set<string>()
  const rows: Record<string, unknown>[] = []
  for (const row of frame.rows) {
    const key = keyOf(row)
    if (seen.has(key)) continue
    seen.add(key)
    rows.push({ ...row })
  }
  return { columns: frame.columns, rows }
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  return digits || value
}

function formatIdCard(value: string) {
  return value.replace(/\s+/g, '').toUpperCase()
}

function formatDate(value: string) {
  const trimmed = value.trim()
  const ts = Date.parse(trimmed.replace(/\//g, '-'))
  if (Number.isNaN(ts)) return trimmed
  const d = new Date(ts)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatMoney(value: unknown) {
  const num = Number(value)
  if (Number.isNaN(num)) return value
  return num.toFixed(2)
}

function applyFormat(frame: Frame, config: CleanFormatConfig, warnings: string[]): Frame {
  const field = config.field?.trim()
  if (!field) {
    warnings.push('格式标准化：未指定字段，已透传')
    return frame
  }
  const format = config.format || 'date'
  const rows = frame.rows.map((row) => {
    const next = { ...row }
    const raw = next[field]
    if (raw == null) return next
    const text = String(raw)
    if (format === 'phone') next[field] = formatPhone(text)
    else if (format === 'id-card') next[field] = formatIdCard(text)
    else if (format === 'date') next[field] = formatDate(text)
    else if (format === 'money') next[field] = formatMoney(raw)
    else if (format === 'regex') {
      try {
        const re = new RegExp(config.pattern || '.*')
        const matched = text.match(re)
        next[field] = matched?.[1] ?? matched?.[0] ?? text
      } catch {
        // keep
      }
    }
    return next
  })
  return { columns: frame.columns, rows }
}

function isOutlier(value: unknown, config: CleanOutlierConfig): boolean {
  const rule = config.rule || 'range'
  if (isEmptyValue(value)) return true

  if (rule === 'range') {
    const num = Number(value)
    if (Number.isNaN(num)) return true
    if (config.min !== undefined && config.min !== '' && num < Number(config.min)) return true
    if (config.max !== undefined && config.max !== '' && num > Number(config.max)) return true
    return false
  }

  if (rule === 'regex') {
    try {
      const re = new RegExp(config.pattern || '.*')
      return !re.test(String(value))
    } catch {
      return false
    }
  }

  // enum
  const allowed = String(config.enumValues || '')
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
  if (!allowed.length) return false
  return !allowed.includes(String(value))
}

function applyOutlier(frame: Frame, config: CleanOutlierConfig, warnings: string[]): Frame {
  const field = config.field?.trim()
  if (!field) {
    warnings.push('异常值处理：未指定字段，已透传')
    return frame
  }
  const action = config.action || 'mark'

  if (action === 'drop') {
    const rows = frame.rows.filter((row) => !isOutlier(row[field], config))
    return { columns: frame.columns, rows }
  }

  if (action === 'replace') {
    const rows = frame.rows.map((row) => {
      const next = { ...row }
      if (isOutlier(next[field], config)) next[field] = config.replaceValue ?? null
      return next
    })
    return { columns: frame.columns, rows }
  }

  // mark
  const markKey = `${field}__outlier`
  const columns = frame.columns.some((col) => col.key === markKey)
    ? frame.columns
    : [...frame.columns, { key: markKey, title: markKey, dataType: 'BOOL' }]
  const rows = frame.rows.map((row) => ({
    ...row,
    [markKey]: isOutlier(row[field], config),
  }))
  return { columns, rows }
}

function applySplitField(frame: Frame, config: CleanSplitFieldConfig, warnings: string[]): Frame {
  const field = config.field?.trim()
  if (!field) {
    warnings.push('字段拆分：未指定源字段，已透传')
    return frame
  }
  const mode = config.mode || 'delimiter'
  const outputs = config.outputs?.length
    ? config.outputs
    : [{ name: 'field_1' }, { name: 'field_2' }]
  const keepOriginal = config.keepOriginal !== false
  const padEmpty = config.padEmpty !== false

  const splitValue = (raw: unknown): Array<string | undefined> => {
    const text = raw == null ? '' : String(raw)
    if (mode === 'regex') {
      try {
        const re = new RegExp(config.pattern || '^(.*)$')
        const matched = text.match(re)
        if (!matched) return outputs.map(() => (padEmpty ? '' : undefined))
        return outputs.map((_, index) => {
          const part = matched[index + 1]
          if (part == null) return padEmpty ? '' : undefined
          return part
        })
      } catch {
        return outputs.map(() => (padEmpty ? '' : undefined))
      }
    }
    if (mode === 'fixed-width') {
      let cursor = 0
      return outputs.map((item) => {
        const width = item.width && item.width > 0 ? item.width : 1
        const part = text.slice(cursor, cursor + width)
        cursor += width
        if (!part && !padEmpty) return undefined
        return part
      })
    }
    const parts = text.split(config.delimiter ?? ',')
    return outputs.map((_, index) => {
      if (index < parts.length) return parts[index]
      return padEmpty ? '' : undefined
    })
  }

  const columns: CleanPreviewColumn[] = [
    ...(keepOriginal
      ? frame.columns
      : frame.columns.filter((col) => col.key !== field)),
    ...outputs.map((item) => ({
      key: item.name || 'field',
      title: item.name || 'field',
      dataType: 'STRING',
    })),
  ]

  const rows = frame.rows.map((row) => {
    const next: Record<string, unknown> = keepOriginal
      ? { ...row }
      : Object.fromEntries(Object.entries(row).filter(([key]) => key !== field))
    const parts = splitValue(row[field])
    outputs.forEach((item, index) => {
      next[item.name || `field_${index + 1}`] = parts[index]
    })
    return next
  })

  return { columns, rows }
}

function resolveJoinSides(incoming: CleanFlowEdge[]) {
  const top = incoming.find((edge) => edge.targetHandle === 'in-left-top')
  const bottom = incoming.find((edge) => edge.targetHandle === 'in-left-bottom')
  const main = incoming.find(
    (edge) => !edge.targetHandle || edge.targetHandle === 'in-left',
  )
  const left = top || main || incoming[0]
  const right =
    bottom ||
    incoming.find((edge) => edge.id !== left?.id) ||
    incoming[1]
  return { left, right }
}

function applyJoin(
  leftFrame: Frame,
  rightFrame: Frame,
  config: CleanJoinConfig,
  warnings: string[],
): Frame {
  const joinType = config.joinType || 'left'
  const keys = (config.keys || []).filter((item) => item.leftField && item.rightField)
  if (!keys.length) {
    warnings.push('关联合并：未配置关联字段，输出左表')
    return leftFrame
  }

  const rightOnlyRows: Record<string, unknown>[] = []
  const matchedRight = new Set<number>()
  const result: Record<string, unknown>[] = []
  const leftKeys = new Set(leftFrame.columns.map((col) => col.key))
  for (const row of leftFrame.rows.slice(0, 5)) {
    Object.keys(row).forEach((key) => leftKeys.add(key))
  }

  const renameRight = (row: Record<string, unknown>) => {
    const next: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      if (leftKeys.has(key)) {
        const usedByKey = keys.some((item) => item.rightField === key)
        next[usedByKey ? key : `${key}__r`] = value
      } else {
        next[key] = value
      }
    }
    return next
  }

  for (const left of leftFrame.rows) {
    let matched = false
    rightFrame.rows.forEach((right, rightIndex) => {
      const ok = keys.every(
        (item) =>
          String(left[item.leftField] ?? '') === String(right[item.rightField] ?? ''),
      )
      if (!ok) return
      matched = true
      matchedRight.add(rightIndex)
      result.push({ ...left, ...renameRight(right) })
    })
    if (!matched && (joinType === 'left' || joinType === 'full')) {
      result.push({ ...left })
    }
  }

  if (joinType === 'right' || joinType === 'full') {
    rightFrame.rows.forEach((right, index) => {
      if (matchedRight.has(index)) return
      rightOnlyRows.push(renameRight(right))
    })
    result.push(...rightOnlyRows)
  }

  if (joinType === 'inner') {
    // already only matches
  }

  let rows = result
  const outputFields = (config.outputFields || []).filter(Boolean)
  if (outputFields.length) {
    rows = rows.map((row) => {
      const next: Record<string, unknown> = {}
      for (const field of outputFields) next[field] = row[field]
      return next
    })
  }

  return {
    columns: outputFields.length
      ? outputFields.map((key) => ({ key, title: key }))
      : inferColumns(rows, [
          ...leftFrame.columns,
          ...rightFrame.columns.map((col) =>
            leftFrame.columns.some((left) => left.key === col.key)
              ? { ...col, key: `${col.key}__r`, title: `${col.title}__r` }
              : col,
          ),
        ]),
    rows,
  }
}

function applyUnion(
  leftFrame: Frame,
  rightFrame: Frame,
  config: CleanUnionConfig,
): Frame {
  const fieldMap = config.fieldMap || {}
  const mappedRight = rightFrame.rows.map((row) => {
    const next: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      next[fieldMap[key] || key] = value
    }
    return next
  })
  let rows = [...cloneRows(leftFrame.rows), ...mappedRight]
  if (config.dedupe) {
    rows = applyDedupe(
      { columns: inferColumns(rows), rows },
      { keep: 'first', fields: [] },
    ).rows
  }
  return {
    columns: inferColumns(rows, [...leftFrame.columns, ...rightFrame.columns]),
    rows,
  }
}

function aggValue(values: unknown[], fn: CleanGroupByMetric['fn']) {
  const nums = values
    .map((item) => Number(item))
    .filter((item) => !Number.isNaN(item) && Number.isFinite(item))
  if (fn === 'COUNT') return values.filter((item) => !isEmptyValue(item)).length
  if (!nums.length) return null
  if (fn === 'SUM') return nums.reduce((sum, item) => sum + item, 0)
  if (fn === 'AVG') return nums.reduce((sum, item) => sum + item, 0) / nums.length
  if (fn === 'MAX') return Math.max(...nums)
  if (fn === 'MIN') return Math.min(...nums)
  return null
}

function applyGroupBy(frame: Frame, config: CleanGroupByConfig, warnings: string[]): Frame {
  const groupFields = (config.groupFields || []).filter(Boolean)
  const metrics = (config.metrics || []).filter((item) => item.field && item.alias)
  if (!groupFields.length && !metrics.length) {
    warnings.push('分组聚合：未配置分组或度量，已透传')
    return frame
  }

  const buckets = new Map<string, Record<string, unknown>[]>()
  for (const row of frame.rows) {
    const key = groupFields.map((field) => JSON.stringify(row[field] ?? null)).join('||')
    const list = buckets.get(key) || []
    list.push(row)
    buckets.set(key, list)
  }

  const rows = [...buckets.values()].map((group) => {
    const next: Record<string, unknown> = {}
    for (const field of groupFields) next[field] = group[0]?.[field]
    for (const metric of metrics) {
      next[metric.alias] = aggValue(
        group.map((row) => row[metric.field]),
        metric.fn || 'SUM',
      )
    }
    return next
  })

  const columns = [
    ...groupFields.map((key) => ({ key, title: key })),
    ...metrics.map((item) => ({ key: item.alias, title: item.alias })),
  ]
  return { columns, rows }
}

function applyPivot(frame: Frame, config: CleanPivotConfig, warnings: string[]): Frame {
  const rowField = config.rowField?.trim()
  const colField = config.colField?.trim()
  const valueField = config.valueField?.trim()
  const agg = config.agg || 'SUM'
  if (!rowField || !colField || !valueField) {
    warnings.push('透视表：请配置行/列/值字段，已透传')
    return frame
  }

  const colValues = [
    ...new Set(frame.rows.map((row) => asString(row[colField])).filter((item) => item !== '')),
  ]
  const groups = new Map<string, Record<string, unknown>[]>()
  for (const row of frame.rows) {
    const key = asString(row[rowField])
    const list = groups.get(key) || []
    list.push(row)
    groups.set(key, list)
  }

  const rows = [...groups.entries()].map(([rowValue, group]) => {
    const next: Record<string, unknown> = { [rowField]: rowValue === '' ? null : group[0]?.[rowField] }
    for (const colValue of colValues) {
      const cells = group
        .filter((row) => asString(row[colField]) === colValue)
        .map((row) => row[valueField])
      next[colValue || '(空)'] = aggValue(cells, agg)
    }
    return next
  })

  const columns = [
    { key: rowField, title: rowField },
    ...colValues.map((value) => ({
      key: value || '(空)',
      title: value || '(空)',
    })),
  ]
  return { columns, rows }
}

function collectAncestors(targetId: string, edges: CleanFlowEdge[]) {
  const incoming = new Map<string, string[]>()
  for (const edge of edges) {
    const list = incoming.get(edge.target) || []
    list.push(edge.source)
    incoming.set(edge.target, list)
  }
  const result = new Set<string>([targetId])
  const stack = [targetId]
  while (stack.length) {
    const cur = stack.pop()!
    for (const src of incoming.get(cur) || []) {
      if (result.has(src)) continue
      result.add(src)
      stack.push(src)
    }
  }
  return result
}

function topoSort(nodeIds: Set<string>, edges: CleanFlowEdge[]) {
  const indegree = new Map<string, number>()
  const outgoing = new Map<string, string[]>()
  for (const id of nodeIds) {
    indegree.set(id, 0)
    outgoing.set(id, [])
  }
  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue
    indegree.set(edge.target, (indegree.get(edge.target) || 0) + 1)
    outgoing.get(edge.source)!.push(edge.target)
  }

  const queue = [...nodeIds].filter((id) => (indegree.get(id) || 0) === 0)
  const ordered: string[] = []
  while (queue.length) {
    const id = queue.shift()!
    ordered.push(id)
    for (const next of outgoing.get(id) || []) {
      const value = (indegree.get(next) || 0) - 1
      indegree.set(next, value)
      if (value === 0) queue.push(next)
    }
  }

  if (ordered.length !== nodeIds.size) {
    throw new Error('清洗流存在环，无法预览')
  }
  return ordered
}

function resolveTargetNode(flow: CleanFlow, options: CleanRunOptions): CleanFlowNode {
  if (options.targetNodeId) {
    const node = flow.nodes.find((item) => item.id === options.targetNodeId)
    if (!node) throw new Error('预览目标节点不存在')
    return node
  }

  if (options.toOutput) {
    const outputs = flow.nodes.filter((item) => item.type === 'output')
    if (!outputs.length) throw new Error('请先添加「数据输出」节点')
    if (outputs.length > 1) throw new Error('全流预览仅支持一个「数据输出」节点')
    return outputs[0]
  }

  throw new Error('请指定预览目标')
}

function emptyResult(
  patch: Partial<CleanPreviewResult> & Pick<CleanPreviewResult, 'warnings' | 'error'>,
): CleanPreviewResult {
  return {
    columns: [],
    rows: [],
    ...patch,
  }
}

function frameFromEdge(
  edge: CleanFlowEdge,
  frames: Map<string, Frame>,
  nodeById: Map<string, CleanFlowNode>,
): Frame {
  const sourceFrame = frames.get(edge.source) || { columns: [], rows: [] }
  const sourceNode = nodeById.get(edge.source)
  if (sourceNode?.type !== 'condition') {
    return {
      columns: sourceFrame.columns.map((col) => ({ ...col })),
      rows: cloneRows(sourceFrame.rows),
    }
  }

  const config = (sourceNode.config || {}) as CleanConditionConfig
  const logic = config.logic || 'and'
  const conditions = config.conditions || []
  const handle = edge.sourceHandle || 'out-true'
  const wantTrue = handle !== 'out-false'
  const rows = sourceFrame.rows.filter(
    (row) => matchConditions(row, logic, conditions) === wantTrue,
  )
  return {
    columns: sourceFrame.columns.map((col) => ({ ...col })),
    rows,
  }
}

/**
 * 本地执行清洗流子图，返回目标节点输出（截断 limit 行）。
 */
export function runCleanFlowLocal(
  flow: CleanFlow,
  options: CleanRunOptions = {},
): CleanPreviewResult {
  const warnings: string[] = []
  const limit = options.limit ?? DEFAULT_PREVIEW_LIMIT
  const tableRows = options.tableRows || buildCleanTableRowsMap()

  let target: CleanFlowNode
  try {
    target = resolveTargetNode(flow, options)
  } catch (error) {
    return emptyResult({
      warnings,
      error: error instanceof Error ? error.message : '预览失败',
    })
  }

  const ancestorIds = collectAncestors(target.id, flow.edges || [])
  const nodeById = new Map(flow.nodes.map((item) => [item.id, item]))
  const orderedIds = topoSort(ancestorIds, flow.edges || [])
  const frames = new Map<string, Frame>()

  const incomingOf = (nodeId: string) =>
    (flow.edges || []).filter(
      (edge) => edge.target === nodeId && ancestorIds.has(edge.source),
    )

  for (const nodeId of orderedIds) {
    const node = nodeById.get(nodeId)
    if (!node) continue

    if (node.type === 'table') {
      frames.set(nodeId, loadTableFrame(node, tableRows, warnings))
      continue
    }

    if (node.type === 'api') {
      frames.set(nodeId, loadApiFrame(node, warnings))
      continue
    }

    const incoming = incomingOf(nodeId)
    if (!incoming.length) {
      warnings.push(`「${node.name}」：没有上游输入`)
      frames.set(nodeId, { columns: [], rows: [] })
      continue
    }

    let frame: Frame

    if (node.type === 'join' || node.type === 'union') {
      if (incoming.length < 2) {
        warnings.push(`「${node.name}」：需要两路上游，当前仅 ${incoming.length} 路`)
      }
      const { left, right } = resolveJoinSides(incoming)
      const leftFrame = left
        ? frameFromEdge(left, frames, nodeById)
        : { columns: [], rows: [] }
      const rightFrame = right
        ? frameFromEdge(right, frames, nodeById)
        : { columns: [], rows: [] }
      frame =
        node.type === 'join'
          ? applyJoin(
              leftFrame,
              rightFrame,
              (node.config || {}) as CleanJoinConfig,
              warnings,
            )
          : applyUnion(leftFrame, rightFrame, (node.config || {}) as CleanUnionConfig)
    } else {
      const upstream = frameFromEdge(incoming[0], frames, nodeById)
      frame = {
        columns: upstream.columns.map((col) => ({ ...col })),
        rows: cloneRows(upstream.rows),
      }

      if (node.type === 'trim-case') {
        frame = applyTrimCase(frame, (node.config || {}) as CleanTrimCaseConfig)
      } else if (node.type === 'null-handle') {
        frame = applyNullHandle(frame, (node.config || {}) as CleanNullHandleConfig)
      } else if (node.type === 'filter') {
        frame = applyFilter(frame, (node.config || {}) as CleanFilterConfig)
      } else if (node.type === 'condition') {
        // 条件节点本身输出全量；分流在下游取边时按 handle 过滤
      } else if (node.type === 'dedupe') {
        frame = applyDedupe(frame, (node.config || {}) as CleanDedupeConfig)
      } else if (node.type === 'format') {
        frame = applyFormat(frame, (node.config || {}) as CleanFormatConfig, warnings)
      } else if (node.type === 'outlier') {
        frame = applyOutlier(frame, (node.config || {}) as CleanOutlierConfig, warnings)
      } else if (node.type === 'split-field') {
        frame = applySplitField(frame, (node.config || {}) as CleanSplitFieldConfig, warnings)
      } else if (node.type === 'groupby') {
        frame = applyGroupBy(frame, (node.config || {}) as CleanGroupByConfig, warnings)
      } else if (node.type === 'pivot') {
        frame = applyPivot(frame, (node.config || {}) as CleanPivotConfig, warnings)
      } else if (node.type === 'output') {
        frame = projectFrame(frame, ((node.config || {}) as CleanOutputConfig).fields)
      } else {
        warnings.push(
          `「${node.name}」（${NODE_TYPE_META[node.type].label}）暂未实现，已透传上游`,
        )
      }
    }

    if (!frame.columns.length) {
      frame.columns = inferColumns(frame.rows)
    }
    frames.set(nodeId, frame)
  }

  const resultFrame = frames.get(target.id) || { columns: [], rows: [] }
  const rows = resultFrame.rows.slice(0, limit)

  return {
    columns: resultFrame.columns,
    rows,
    warnings,
    targetNodeId: target.id,
    targetNodeName: target.name,
  }
}

export function countOutputNodes(flow: CleanFlow) {
  return (flow.nodes || []).filter((item) => item.type === 'output').length
}
