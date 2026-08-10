import type {
  DataPrepDataset,
  DataPrepJoin,
  DataPrepMetricConfig,
  DataPrepSchemaBundle,
  DataPrepSource,
  DataPrepTableRowsMap,
  DatasetQueryRequest,
  DatasetQueryResult,
} from '../types'
import { sourceTableRowsKey } from '../types'
import { measureOutputKey, parseFieldKey } from '../factories'
import { evaluateFormulaOnGroup } from './formulaEval'

export function mergeSchemaBundlesToRowsMap(
  bundles: DataPrepSchemaBundle[],
): DataPrepTableRowsMap {
  const map: DataPrepTableRowsMap = {}
  for (const bundle of bundles) {
    for (const [tableName, rows] of Object.entries(bundle.tableRows || {})) {
      map[sourceTableRowsKey(bundle.id, tableName)] = rows
    }
  }
  return map
}

function rowsOfSource(
  source: DataPrepSource,
  tableRows: DataPrepTableRowsMap,
): Record<string, unknown>[] {
  const keyed = tableRows[sourceTableRowsKey(source.schemaId, source.tableName)]
  if (keyed) return keyed
  return tableRows[source.tableName] || []
}

function flattenRow(alias: string, row: Record<string, unknown>) {
  const next: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    next[`${alias}.${key}`] = value
  }
  return next
}

function resolveCell(row: Record<string, unknown>, field: string) {
  if (field in row) return row[field]
  const { alias, column } = parseFieldKey(field)
  if (!alias) return row[column]
  return row[`${alias}.${column}`]
}

function applyJoin(
  leftRows: Record<string, unknown>[],
  rightSource: DataPrepSource,
  rightRawRows: Record<string, unknown>[],
  join: DataPrepJoin,
  leftAlias: string,
): Record<string, unknown>[] {
  const rightAlias = rightSource.alias
  const rightRows = rightRawRows.map((row) => flattenRow(rightAlias, row))
  const result: Record<string, unknown>[] = []

  for (const left of leftRows) {
    let matched = false
    for (const right of rightRows) {
      const matchCond = (cond: { leftField: string; rightField: string }) => {
        const leftValue = left[`${leftAlias}.${cond.leftField}`]
        const rightValue = right[`${rightAlias}.${cond.rightField}`]
        return String(leftValue ?? '') === String(rightValue ?? '')
      }
      const conditions = join.on || []
      if (!conditions.length) continue
      const ok =
        (join.onLogic || 'and') === 'or'
          ? conditions.some(matchCond)
          : conditions.every(matchCond)
      if (!ok) continue
      matched = true
      result.push({ ...left, ...right })
    }
    if (!matched && join.type === 'left') {
      result.push({ ...left })
    }
  }
  return result
}

/** 将多表按 joins 拼成扁平行（字段键为 alias.column） */
export function buildJoinedRows(
  dataset: DataPrepDataset,
  tableRows: DataPrepTableRowsMap,
): Record<string, unknown>[] {
  const { sources, joins } = dataset
  if (!sources.length) return []

  if (sources.length === 1) {
    const source = sources[0]
    return rowsOfSource(source, tableRows).map((row) => flattenRow(source.alias, row))
  }

  if (!joins.length) {
    throw new Error('多表查询需要先配置表关联（画布连线）')
  }

  const sourceById = new Map(sources.map((s) => [s.id, s]))
  const included = new Set<string>()
  const joinQueue = [...joins]

  const seedJoin = joinQueue[0]
  const seedLeft = sourceById.get(seedJoin.leftSourceId)
  if (!seedLeft) throw new Error('Join 引用了不存在的来源表')

  let rows = rowsOfSource(seedLeft, tableRows).map((row) => flattenRow(seedLeft.alias, row))
  included.add(seedLeft.id)

  let guard = 0
  while (included.size < sources.length && guard < joins.length + 2) {
    guard += 1
    const nextIdx = joinQueue.findIndex(
      (j) =>
        (included.has(j.leftSourceId) && !included.has(j.rightSourceId)) ||
        (included.has(j.rightSourceId) && !included.has(j.leftSourceId)),
    )
    if (nextIdx < 0) break
    const join = joinQueue.splice(nextIdx, 1)[0]

    if (included.has(join.leftSourceId) && !included.has(join.rightSourceId)) {
      const right = sourceById.get(join.rightSourceId)
      const left = sourceById.get(join.leftSourceId)
      if (!right || !left) throw new Error('Join 引用了不存在的来源表')
      rows = applyJoin(rows, right, rowsOfSource(right, tableRows), join, left.alias)
      included.add(right.id)
      continue
    }

    if (included.has(join.rightSourceId) && !included.has(join.leftSourceId)) {
      const left = sourceById.get(join.leftSourceId)
      const right = sourceById.get(join.rightSourceId)
      if (!left || !right) throw new Error('Join 引用了不存在的来源表')
      const flipped: DataPrepJoin = {
        ...join,
        leftSourceId: join.rightSourceId,
        rightSourceId: join.leftSourceId,
        onLogic: join.onLogic || 'and',
        on: join.on.map((cond) => ({
          leftField: cond.rightField,
          rightField: cond.leftField,
        })),
      }
      rows = applyJoin(rows, left, rowsOfSource(left, tableRows), flipped, right.alias)
      included.add(left.id)
    }
  }

  if (included.size < sources.length) {
    throw new Error('存在未关联的表，请补全 Join，使所有表连通')
  }

  return rows
}

function dimensionKeyOf(config: DataPrepMetricConfig) {
  return config.dimensionFields.join('\u0001')
}

function groupRows(
  rows: Record<string, unknown>[],
  dimensionFields: string[],
): Array<{ keyParts: string[]; rows: Record<string, unknown>[] }> {
  if (!dimensionFields.length) {
    return [{ keyParts: [], rows }]
  }
  const groups = new Map<string, { keyParts: string[]; rows: Record<string, unknown>[] }>()
  for (const row of rows) {
    const keyParts = dimensionFields.map((field) => String(resolveCell(row, field) ?? ''))
    const key = keyParts.join('\u0001')
    const existing = groups.get(key)
    if (existing) existing.rows.push(row)
    else groups.set(key, { keyParts, rows: [row] })
  }
  return [...groups.values()]
}

export type MetricPreviewResult = {
  label: string
  value: unknown
  groups: Array<{ label: string; value: unknown; dimensions: Record<string, unknown> }>
}

/** 按维度分组聚合，返回各组结果；预览取第一组 */
export function previewMetricConfig(
  dataset: DataPrepDataset,
  tableRows: DataPrepTableRowsMap,
  config: Pick<DataPrepMetricConfig, 'dimensionFields' | 'measure'>,
): MetricPreviewResult {
  const rows = buildJoinedRows(dataset, tableRows)
  const groups = groupRows(rows, config.dimensionFields)
  const evaluated = groups.map((group) => {
    const dimensions: Record<string, unknown> = {}
    config.dimensionFields.forEach((field, index) => {
      dimensions[field] = group.keyParts[index]
    })
    const value = evaluateFormulaOnGroup(config.measure.formula || '', group.rows)
    const label =
      config.dimensionFields.length > 0
        ? group.keyParts.filter(Boolean).join(' / ') || '(空)'
        : '全部'
    return { label, value, dimensions }
  })

  const first = evaluated[0]
  return {
    label: first?.label || '-',
    value: first?.value ?? null,
    groups: evaluated,
  }
}

/**
 * 本地聚合：按 metricConfigs 的维度分组，用公式计算度量。
 * 若多个配置维度集合相同，合并为同一结果表的多度量列。
 */
export function queryDatasetLocal(
  dataset: DataPrepDataset,
  tableRows: DataPrepTableRowsMap,
  request: Pick<DatasetQueryRequest, 'configIds' | 'limit'> = {},
): DatasetQueryResult {
  if (dataset.sources.length === 0) {
    return { columns: [], rows: [] }
  }

  const configs = (
    request.configIds?.length
      ? request.configIds
          .map((id) => dataset.metricConfigs.find((item) => item.id === id))
          .filter(Boolean)
      : dataset.metricConfigs
  ) as DataPrepMetricConfig[]

  if (!configs.length) return { columns: [], rows: [] }

  const rows = buildJoinedRows(dataset, tableRows)

  // 按维度集合分桶
  const buckets = new Map<string, DataPrepMetricConfig[]>()
  for (const config of configs) {
    const key = dimensionKeyOf(config)
    const list = buckets.get(key)
    if (list) list.push(config)
    else buckets.set(key, [config])
  }

  // 预览/默认：取第一组维度集合
  const firstBucket = buckets.values().next().value as DataPrepMetricConfig[]
  const dimensionFields = firstBucket[0].dimensionFields
  const groups = groupRows(rows, dimensionFields)

  const columns: DatasetQueryResult['columns'] = [
    ...dimensionFields.map((field) => ({
      key: field,
      title: field,
      role: 'dimension' as const,
    })),
    ...firstBucket.map((config) => ({
      key: measureOutputKey(config.measure, config.id),
      title: config.measure.name || measureOutputKey(config.measure, config.id),
      role: 'measure' as const,
    })),
  ]

  let resultRows: Record<string, unknown>[] = groups.map((group) => {
    const resultRow: Record<string, unknown> = {}
    dimensionFields.forEach((field, index) => {
      resultRow[field] = group.keyParts[index]
    })
    for (const config of firstBucket) {
      const key = measureOutputKey(config.measure, config.id)
      try {
        resultRow[key] = evaluateFormulaOnGroup(config.measure.formula || '', group.rows)
      } catch {
        resultRow[key] = null
      }
    }
    return resultRow
  })

  const limit = request.limit
  if (limit != null && limit > 0) {
    resultRows = resultRows.slice(0, limit)
  }

  return { columns, rows: resultRows }
}

/** 将查询结果转为笛卡尔图常用的 x / series 数组 */
export function toCartesianSeriesPayload(
  result: DatasetQueryResult,
  categoryFieldId: string,
  measureFieldIds: string[],
): { xAxisData: unknown[]; seriesData: unknown[][] } {
  const xAxisData = result.rows.map((row) => row[categoryFieldId])
  const seriesData = measureFieldIds.map((id) => result.rows.map((row) => row[id]))
  return { xAxisData, seriesData }
}