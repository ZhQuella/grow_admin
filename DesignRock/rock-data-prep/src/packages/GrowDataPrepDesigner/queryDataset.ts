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
import {
  DATA_PREP_AGG_LABELS,
  isCompareAgg,
  isCompareRateAgg,
  isDerivedAgg,
  measureOutputKey,
  parseFieldKey,
} from './factories'

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
  // 占比 / 累计 / 同比环比等在分组结果上二次计算，此处先按求和取基数
  const effective = isDerivedAgg(agg) ? 'sum' : agg
  if (effective === 'count') return values.length
  if (effective === 'count_distinct') return new Set(values.map((v) => String(v))).size
  const nums = values.map(toNumber)
  if (!nums.length) return 0
  if (effective === 'sum') return nums.reduce((a, b) => a + b, 0)
  if (effective === 'avg') return nums.reduce((a, b) => a + b, 0) / nums.length
  if (effective === 'max') return Math.max(...nums)
  if (effective === 'min') return Math.min(...nums)
  return 0
}

type PeriodUnit = 'day' | 'month' | 'quarter' | 'year'

type ParsedPeriod = {
  unit: PeriodUnit
  year: number
  month: number
  day: number
  quarter: number
  /** 规范化键，用于查找同期 */
  key: string
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function periodKey(unit: PeriodUnit, year: number, month: number, day: number, quarter: number) {
  if (unit === 'year') return `${year}`
  if (unit === 'quarter') return `${year}-Q${quarter}`
  if (unit === 'month') return `${year}-${pad2(month)}`
  return `${year}-${pad2(month)}-${pad2(day)}`
}

/** 解析常见时间维度：YYYY / YYYY-MM / YYYY-MM-DD / YYYY-Qn / 2024年1月 */
export function parsePeriod(value: unknown): ParsedPeriod | null {
  const raw = String(value ?? '').trim()
  if (!raw) return null

  let m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) {
    const year = Number(m[1])
    const month = Number(m[2])
    const day = Number(m[3])
    if (month < 1 || month > 12 || day < 1 || day > 31) return null
    return {
      unit: 'day',
      year,
      month,
      day,
      quarter: Math.ceil(month / 3),
      key: periodKey('day', year, month, day, 0),
    }
  }

  m = raw.match(/^(\d{4})-(\d{2})$/)
  if (m) {
    const year = Number(m[1])
    const month = Number(m[2])
    if (month < 1 || month > 12) return null
    return {
      unit: 'month',
      year,
      month,
      day: 1,
      quarter: Math.ceil(month / 3),
      key: periodKey('month', year, month, 1, 0),
    }
  }

  m = raw.match(/^(\d{4})-[Qq]([1-4])$/)
  if (m) {
    const year = Number(m[1])
    const quarter = Number(m[2])
    const month = (quarter - 1) * 3 + 1
    return {
      unit: 'quarter',
      year,
      month,
      day: 1,
      quarter,
      key: periodKey('quarter', year, month, 1, quarter),
    }
  }

  m = raw.match(/^(\d{4})$/)
  if (m) {
    const year = Number(m[1])
    return {
      unit: 'year',
      year,
      month: 1,
      day: 1,
      quarter: 1,
      key: periodKey('year', year, 1, 1, 1),
    }
  }

  m = raw.match(/^(\d{4})年(?:(\d{1,2})月)?(?:(\d{1,2})日)?$/)
  if (m) {
    const year = Number(m[1])
    const month = m[2] ? Number(m[2]) : 0
    const day = m[3] ? Number(m[3]) : 0
    if (day) {
      return {
        unit: 'day',
        year,
        month,
        day,
        quarter: Math.ceil(month / 3),
        key: periodKey('day', year, month, day, 0),
      }
    }
    if (month) {
      return {
        unit: 'month',
        year,
        month,
        day: 1,
        quarter: Math.ceil(month / 3),
        key: periodKey('month', year, month, 1, 0),
      }
    }
    return {
      unit: 'year',
      year,
      month: 1,
      day: 1,
      quarter: 1,
      key: periodKey('year', year, 1, 1, 1),
    }
  }

  return null
}

function shiftPeriod(period: ParsedPeriod, mode: 'yoy' | 'mom'): ParsedPeriod {
  if (mode === 'yoy') {
    const year = period.year - 1
    return {
      ...period,
      year,
      key: periodKey(period.unit, year, period.month, period.day, period.quarter),
    }
  }

  // 环比：上一日 / 上一月 / 上一季 / 上一年
  if (period.unit === 'year') {
    const year = period.year - 1
    return { ...period, year, key: periodKey('year', year, 1, 1, 1) }
  }
  if (period.unit === 'quarter') {
    let { year, quarter } = period
    quarter -= 1
    if (quarter < 1) {
      quarter = 4
      year -= 1
    }
    const month = (quarter - 1) * 3 + 1
    return {
      unit: 'quarter',
      year,
      month,
      day: 1,
      quarter,
      key: periodKey('quarter', year, month, 1, quarter),
    }
  }
  if (period.unit === 'month') {
    let { year, month } = period
    month -= 1
    if (month < 1) {
      month = 12
      year -= 1
    }
    return {
      unit: 'month',
      year,
      month,
      day: 1,
      quarter: Math.ceil(month / 3),
      key: periodKey('month', year, month, 1, 0),
    }
  }
  const date = new Date(period.year, period.month - 1, period.day)
  date.setDate(date.getDate() - 1)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return {
    unit: 'day',
    year,
    month,
    day,
    quarter: Math.ceil(month / 3),
    key: periodKey('day', year, month, day, 0),
  }
}

function growthRate(current: number, previous: number | null | undefined): number | null {
  if (previous == null || !Number.isFinite(previous) || previous === 0) return null
  if (!Number.isFinite(current)) return null
  return (current - previous) / previous
}

function growthDiff(current: number, previous: number | null | undefined): number | null {
  if (previous == null || !Number.isFinite(previous)) return null
  if (!Number.isFinite(current)) return null
  return current - previous
}

function compareKind(agg: DataPrepAgg): 'yoy' | 'mom' {
  return agg === 'yoy' || agg === 'yoy_diff' ? 'yoy' : 'mom'
}

function sortRowsBySeriesAndTime(
  resultRows: Record<string, unknown>[],
  seriesDims: DataPrepDataset['dimensions'],
  orderDim: DataPrepDataset['dimensions'][number],
) {
  return [...resultRows].sort((a, b) => {
    const seriesA = seriesDims.map((d) => String(a[d.id] ?? '')).join('\u0001')
    const seriesB = seriesDims.map((d) => String(b[d.id] ?? '')).join('\u0001')
    if (seriesA !== seriesB) return seriesA.localeCompare(seriesB, 'zh-CN')
    const pa = parsePeriod(a[orderDim.id])
    const pb = parsePeriod(b[orderDim.id])
    if (pa && pb) return pa.key.localeCompare(pb.key)
    return String(a[orderDim.id] ?? '').localeCompare(String(b[orderDim.id] ?? ''), 'zh-CN')
  })
}

function resolveTimeLayout(
  resultRows: Record<string, unknown>[],
  dimensions: DataPrepDataset['dimensions'],
) {
  const timeDimIndex = dimensions.findIndex((d) =>
    resultRows.some((row) => parsePeriod(row[d.id])),
  )
  const timeDim = timeDimIndex >= 0 ? dimensions[timeDimIndex] : null
  const seriesDims = timeDim
    ? dimensions.filter((d) => d.id !== timeDim.id)
    : dimensions.slice(1)
  const orderDim = timeDim || dimensions[0]
  return { timeDim, seriesDims, orderDim }
}

/**
 * 同比 / 环比（比率或差值）。
 * - 优先用可解析的时间维度定位对比期
 * - 时间维度无法解析时：环比类取同系列排序相邻上期；同比类无法计算则为 null
 */
function applyCompareMeasures(
  resultRows: Record<string, unknown>[],
  dimensions: DataPrepDataset['dimensions'],
  measures: DataPrepDataset['measures'],
): Record<string, unknown>[] {
  const compareMeasures = measures.filter((m) => isCompareAgg(m.agg))
  if (!compareMeasures.length || !resultRows.length || !dimensions.length) {
    return resultRows
  }

  const { seriesDims, orderDim } = resolveTimeLayout(resultRows, dimensions)
  const sorted = sortRowsBySeriesAndTime(resultRows, seriesDims, orderDim)

  type LookupEntry = { row: Record<string, unknown>; period: ParsedPeriod | null }
  const bySeriesPeriod = new Map<string, LookupEntry>()
  const seriesBucket = new Map<string, LookupEntry[]>()

  for (const row of sorted) {
    const seriesKey = seriesDims.map((d) => String(row[d.id] ?? '')).join('\u0001')
    const period = parsePeriod(row[orderDim.id])
    const entry: LookupEntry = { row, period }
    if (period) {
      bySeriesPeriod.set(`${seriesKey}\u0001${period.key}`, entry)
    }
    const list = seriesBucket.get(seriesKey)
    if (list) list.push(entry)
    else seriesBucket.set(seriesKey, [entry])
  }

  return sorted.map((row) => {
    const next = { ...row }
    const seriesKey = seriesDims.map((d) => String(row[d.id] ?? '')).join('\u0001')
    const period = parsePeriod(row[orderDim.id])

    for (const measure of compareMeasures) {
      const key = measureOutputKey(measure)
      const current = toNumber(row[key])
      let previous: number | null = null
      const kind = compareKind(measure.agg)

      if (period) {
        const target = shiftPeriod(period, kind)
        const hit = bySeriesPeriod.get(`${seriesKey}\u0001${target.key}`)
        if (hit) previous = toNumber(hit.row[key])
      } else if (kind === 'mom') {
        const bucket = seriesBucket.get(seriesKey) || []
        const idx = bucket.findIndex((item) => item.row === row)
        if (idx > 0) previous = toNumber(bucket[idx - 1].row[key])
      }

      next[key] = isCompareRateAgg(measure.agg)
        ? growthRate(current, previous)
        : growthDiff(current, previous)
    }
    return next
  })
}

/** 占比：本组求和 / 全部组合计 */
function applyRatioMeasures(
  resultRows: Record<string, unknown>[],
  measures: DataPrepDataset['measures'],
): Record<string, unknown>[] {
  const ratioMeasures = measures.filter((m) => m.agg === 'ratio')
  if (!ratioMeasures.length || !resultRows.length) return resultRows

  const totals = new Map<string, number>()
  for (const measure of ratioMeasures) {
    const key = measureOutputKey(measure)
    totals.set(
      key,
      resultRows.reduce((sum, row) => sum + toNumber(row[key]), 0),
    )
  }

  return resultRows.map((row) => {
    const next = { ...row }
    for (const measure of ratioMeasures) {
      const key = measureOutputKey(measure)
      const total = totals.get(key) || 0
      next[key] = total === 0 ? null : toNumber(row[key]) / total
    }
    return next
  })
}

/** 累计：同系列按时间（或首维）顺序累加 */
function applyRunningSumMeasures(
  resultRows: Record<string, unknown>[],
  dimensions: DataPrepDataset['dimensions'],
  measures: DataPrepDataset['measures'],
): Record<string, unknown>[] {
  const runningMeasures = measures.filter((m) => m.agg === 'running_sum')
  if (!runningMeasures.length || !resultRows.length || !dimensions.length) {
    return resultRows
  }

  const { seriesDims, orderDim } = resolveTimeLayout(resultRows, dimensions)
  const sorted = sortRowsBySeriesAndTime(resultRows, seriesDims, orderDim)
  const acc = new Map<string, number>()

  return sorted.map((row) => {
    const next = { ...row }
    const seriesKey = seriesDims.map((d) => String(row[d.id] ?? '')).join('\u0001')
    for (const measure of runningMeasures) {
      const outKey = measureOutputKey(measure)
      const key = `${seriesKey}\u0001${outKey}`
      const current = toNumber(row[outKey])
      const nextAcc = (acc.get(key) || 0) + current
      acc.set(key, nextAcc)
      next[outKey] = nextAcc
    }
    return next
  })
}

function applyDerivedMeasures(
  resultRows: Record<string, unknown>[],
  dimensions: DataPrepDataset['dimensions'],
  measures: DataPrepDataset['measures'],
): Record<string, unknown>[] {
  let rows = resultRows
  // 先占比 / 累计（基于原始求和），再同比环比（同样基于原始求和行）
  // 注意：同比环比查找依赖未改写的求和值，故 compare 内部用原 row 取值
  rows = applyRatioMeasures(rows, measures)
  rows = applyRunningSumMeasures(rows, dimensions, measures)
  rows = applyCompareMeasures(rows, dimensions, measures)
  return rows
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
      key: measureOutputKey(m),
      title: `${m.name}(${DATA_PREP_AGG_LABELS[m.agg] || m.agg})`,
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
      const key = measureOutputKey(measure)
      if (isCompareAgg(measure.agg)) {
        // 无维度时无法定位对比期
        resultRow[key] = null
        continue
      }
      const values = rows.map((row) => resolveCell(row, measure.field))
      if (measure.agg === 'ratio') {
        // 仅一行时占比为 100%
        resultRow[key] = values.length ? 1 : null
        continue
      }
      resultRow[key] = aggregateValues(values, measure.agg)
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
      resultRow[measureOutputKey(measure)] = aggregateValues(values, measure.agg)
    }
    resultRows.push(resultRow)
  }

  resultRows = applyDerivedMeasures(resultRows, dimensions, measures)

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
