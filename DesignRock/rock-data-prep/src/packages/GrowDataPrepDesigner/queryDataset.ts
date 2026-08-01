import type {
  DataPrepAgg,
  DataPrepDataset,
  DataPrepJoin,
  DataPrepSchemaBundle,
  DataPrepSource,
  DataPrepTableRowsMap,
  DatasetQueryRequest,
  DatasetQueryResult,
} from './types'
import { sourceTableRowsKey } from './types'
import { parseFieldKey } from './factories'

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
  // 兼容旧单建模：仅按表名索引
  return tableRows[source.tableName] || []
}

const toNumber = (value: unknown): number => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function aggregateValues(values: unknown[], agg: DataPrepAgg): number {
  if (agg === 'count') return values.length
  if (agg === 'count_distinct') return new Set(values.map((v) => String(v))).size
  const nums = values.map(toNumber)
  if (!nums.length) return 0
  if (agg === 'sum') return nums.reduce((a, b) => a + b, 0)
  if (agg === 'avg') return nums.reduce((a, b) => a + b, 0) / nums.length
  if (agg === 'max') return Math.max(...nums)
  if (agg === 'min') return Math.min(...nums)
  return 0
}

function flattenRow(alias: string, row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    out[`${alias}.${key}`] = value
  }
  return out
}

function applyJoin(
  leftRows: Record<string, unknown>[],
  rightSource: DataPrepSource,
  rightRaw: Record<string, unknown>[],
  join: DataPrepJoin,
  leftSourceAlias: string,
): Record<string, unknown>[] {
  const rightAlias = rightSource.alias
  const rightRows = rightRaw.map((row) => flattenRow(rightAlias, row))
  const result: Record<string, unknown>[] = []

  for (const left of leftRows) {
    let matched = false
    for (const right of rightRows) {
      const matchCond = (cond: { leftField: string; rightField: string }) => {
        const leftValue = left[`${leftSourceAlias}.${cond.leftField}`]
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

/** 将多表按 joins 拼成扁平行（字段键为 alias.column；支持跨建模行索引） */
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
    throw new Error('多表查询需要先配置表关联（侧栏「表关联」或画布连线）')
  }

  const sourceById = new Map(sources.map((s) => [s.id, s]))
  const included = new Set<string>()
  const joinQueue = [...joins]

  // 从第一条 join 的左侧开始
  const seedJoin = joinQueue[0]
  const seedLeft = sourceById.get(seedJoin.leftSourceId)
  if (!seedLeft) throw new Error('Join 引用了不存在的来源表')

  let rows = rowsOfSource(seedLeft, tableRows).map((row) =>
    flattenRow(seedLeft.alias, row),
  )
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
      // 反转语义：以已在结果中的 right 为左，补 left 表
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
    throw new Error('存在未关联的表，请在「表关联」中补全 Join，使所有表连通')
  }

  return rows
}

/**
 * 本地聚合：支持单表与多表（基于 joins）。
 * tableRows 的 key 为物理表名（与 Schema.table.name 一致）。
 */
export function queryDatasetLocal(
  dataset: DataPrepDataset,
  tableRows: DataPrepTableRowsMap,
  request: Pick<DatasetQueryRequest, 'dimensionIds' | 'measureIds' | 'limit'> = {},
): DatasetQueryResult {
  if (dataset.sources.length === 0) {
    return { columns: [], rows: [] }
  }

  const rows = buildJoinedRows(dataset, tableRows)

  const dimensionIds = request.dimensionIds?.length
    ? request.dimensionIds
    : dataset.dimensions.map((d) => d.id)
  const measureIds = request.measureIds?.length
    ? request.measureIds
    : dataset.measures.map((m) => m.id)

  const dimensions = dimensionIds
    .map((id) => dataset.dimensions.find((d) => d.id === id))
    .filter(Boolean) as DataPrepDataset['dimensions']
  const measures = measureIds
    .map((id) => dataset.measures.find((m) => m.id === id))
    .filter(Boolean) as DataPrepDataset['measures']

  if (!dimensions.length && !measures.length) {
    return { columns: [], rows: [] }
  }

  const columns = [
    ...dimensions.map((d) => ({
      key: d.id,
      title: d.name,
      role: 'dimension' as const,
    })),
    ...measures.map((m) => ({
      key: m.id,
      title: `${m.name}(${m.agg})`,
      role: 'measure' as const,
    })),
  ]

  const resolveCell = (row: Record<string, unknown>, field: string) => {
    if (field in row) return row[field]
    const { alias, column } = parseFieldKey(field)
    if (!alias) return row[column]
    return row[`${alias}.${column}`]
  }

  if (!dimensions.length) {
    const resultRow: Record<string, unknown> = {}
    for (const measure of measures) {
      const values = rows.map((row) => resolveCell(row, measure.field))
      resultRow[measure.id] = aggregateValues(values, measure.agg)
    }
    return { columns, rows: [resultRow] }
  }

  const groups = new Map<string, Record<string, unknown>[]>()
  for (const row of rows) {
    const keyParts = dimensions.map((d) => String(resolveCell(row, d.field) ?? ''))
    const key = keyParts.join('\u0001')
    const list = groups.get(key)
    if (list) list.push(row)
    else groups.set(key, [row])
  }

  let resultRows: Record<string, unknown>[] = []
  for (const groupRows of groups.values()) {
    const resultRow: Record<string, unknown> = {}
    for (const dimension of dimensions) {
      resultRow[dimension.id] = resolveCell(groupRows[0], dimension.field)
    }
    for (const measure of measures) {
      const values = groupRows.map((row) => resolveCell(row, measure.field))
      resultRow[measure.id] = aggregateValues(values, measure.agg)
    }
    resultRows.push(resultRow)
  }

  if (dimensions[0]) {
    const dimId = dimensions[0].id
    resultRows = resultRows.sort((a, b) =>
      String(a[dimId] ?? '').localeCompare(String(b[dimId] ?? ''), 'zh-CN'),
    )
  }

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
