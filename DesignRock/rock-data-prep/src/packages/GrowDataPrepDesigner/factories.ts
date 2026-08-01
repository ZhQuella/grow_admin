import { nanoid } from 'nanoid'
import type {
  DataPrepAgg,
  DataPrepDataset,
  DataPrepDimension,
  DataPrepJoin,
  DataPrepJoinOnLogic,
  DataPrepJoinType,
  DataPrepMeasure,
  DataPrepSchemaRef,
  DataPrepSource,
} from './types'

export type DataPrepAggOption = {
  label: string
  value: DataPrepAgg
  /** 下拉与选中态说明 */
  description: string
}

export const DATA_PREP_AGG_OPTIONS: DataPrepAggOption[] = [
  {
    label: '求和',
    value: 'sum',
    description: '对分组内各行数值相加',
  },
  {
    label: '平均',
    value: 'avg',
    description: '对分组内各行数值求算术平均',
  },
  {
    label: '计数',
    value: 'count',
    description: '统计分组内行数（含重复）',
  },
  {
    label: '去重计数',
    value: 'count_distinct',
    description: '统计分组内不重复值的个数',
  },
  {
    label: '最大值',
    value: 'max',
    description: '取分组内数值的最大值',
  },
  {
    label: '最小值',
    value: 'min',
    description: '取分组内数值的最小值',
  },
  {
    label: '占比',
    value: 'ratio',
    description: '本组求和 ÷ 全部组合计，结果为比率',
  },
  {
    label: '累计',
    value: 'running_sum',
    description: '同系列按时间顺序累加求和',
  },
  {
    label: '同比',
    value: 'yoy',
    description: '(本期 − 去年同期) ÷ 去年同期，需时间维度',
  },
  {
    label: '环比',
    value: 'mom',
    description: '(本期 − 上期) ÷ 上期；无时间维时取相邻上期',
  },
  {
    label: '同比差值',
    value: 'yoy_diff',
    description: '本期 − 去年同期（绝对增减），需时间维度',
  },
  {
    label: '环比差值',
    value: 'mom_diff',
    description: '本期 − 上期（绝对增减）',
  },
]

export function getDataPrepAggDescription(agg: DataPrepAgg): string {
  return DATA_PREP_AGG_OPTIONS.find((item) => item.value === agg)?.description || ''
}

export const DATA_PREP_AGG_LABELS: Record<DataPrepAgg, string> = {
  sum: '求和',
  avg: '平均',
  count: '计数',
  count_distinct: '去重计数',
  max: '最大值',
  min: '最小值',
  ratio: '占比',
  running_sum: '累计',
  yoy: '同比',
  mom: '环比',
  yoy_diff: '同比差值',
  mom_diff: '环比差值',
}

/** 需在分组求和后再二次计算的方式 */
export function isDerivedAgg(agg: DataPrepAgg): boolean {
  return (
    agg === 'ratio' ||
    agg === 'running_sum' ||
    agg === 'yoy' ||
    agg === 'mom' ||
    agg === 'yoy_diff' ||
    agg === 'mom_diff'
  )
}

export function isCompareAgg(agg: DataPrepAgg): boolean {
  return agg === 'yoy' || agg === 'mom' || agg === 'yoy_diff' || agg === 'mom_diff'
}

export function isCompareRateAgg(agg: DataPrepAgg): boolean {
  return agg === 'yoy' || agg === 'mom'
}

export function isPercentDisplayAgg(agg: DataPrepAgg): boolean {
  return agg === 'ratio' || isCompareRateAgg(agg)
}

export function normalizeSchemaRefs(
  patch: Partial<DataPrepDataset> & { schemaRef?: DataPrepSchemaRef },
): DataPrepSchemaRef[] {
  if (Array.isArray(patch.schemaRefs) && patch.schemaRefs.length) {
    return patch.schemaRefs.map((item) => ({
      schemaId: item.schemaId,
      schemaName: item.schemaName,
    }))
  }
  if (patch.schemaRef?.schemaId) {
    return [{ schemaId: patch.schemaRef.schemaId, schemaName: patch.schemaRef.schemaName }]
  }
  return []
}

export function createDataPrepSource(
  patch: Partial<DataPrepSource> &
    Pick<DataPrepSource, 'tableId' | 'tableName' | 'schemaId'>,
): DataPrepSource {
  const alias = patch.alias || patch.tableName
  return {
    id: patch.id ?? nanoid(10),
    alias,
    schemaId: patch.schemaId,
    tableId: patch.tableId,
    tableName: patch.tableName,
    position: patch.position ?? { x: 120, y: 100 },
  }
}

export function createDataPrepJoin(
  patch: Partial<DataPrepJoin> &
    Pick<DataPrepJoin, 'leftSourceId' | 'rightSourceId' | 'on'>,
): DataPrepJoin {
  const type: DataPrepJoinType = patch.type ?? 'inner'
  const onLogic: DataPrepJoinOnLogic = patch.onLogic ?? 'and'
  return {
    id: patch.id ?? nanoid(10),
    leftSourceId: patch.leftSourceId,
    rightSourceId: patch.rightSourceId,
    type,
    onLogic,
    on: patch.on ?? [],
  }
}

export function createDataPrepDimension(
  patch: Partial<DataPrepDimension> & Pick<DataPrepDimension, 'name' | 'field'>,
): DataPrepDimension {
  return {
    id: patch.id ?? nanoid(10),
    name: patch.name,
    field: patch.field,
    dataType: patch.dataType,
  }
}

/** 查询结果中度量的输出字段名 */
export function measureOutputKey(measure: Pick<DataPrepMeasure, 'id' | 'outputKey'>): string {
  const key = measure.outputKey?.trim()
  return key || measure.id
}

/** 由来源字段生成默认 outputKey（取 alias.column 的列名） */
export function defaultMeasureOutputKey(field: string): string {
  const { column } = parseFieldKey(field)
  const base = (column || field).replace(/[^\w\u4e00-\u9fa5]+/g, '_') || 'value'
  return base
}

export function ensureUniqueMeasureOutputKey(
  measures: Array<Pick<DataPrepMeasure, 'id' | 'outputKey'>>,
  base: string,
  excludeId?: string,
): string {
  const used = new Set(
    measures
      .filter((m) => m.id !== excludeId)
      .map((m) => measureOutputKey(m)),
  )
  const seed = base.trim() || 'value'
  if (!used.has(seed)) return seed
  let i = 2
  while (used.has(`${seed}_${i}`)) i += 1
  return `${seed}_${i}`
}

export function createDataPrepMeasure(
  patch: Partial<DataPrepMeasure> & Pick<DataPrepMeasure, 'name' | 'field'>,
): DataPrepMeasure {
  const id = patch.id ?? nanoid(10)
  const outputKey =
    patch.outputKey?.trim() || defaultMeasureOutputKey(patch.field) || id
  return {
    id,
    name: patch.name,
    field: patch.field,
    outputKey,
    agg: patch.agg ?? 'sum',
    format: patch.format,
  }
}

export function createDataPrepDataset(
  patch: Partial<DataPrepDataset> & Pick<DataPrepDataset, 'name'> = {
    name: '未命名数据集',
  },
): DataPrepDataset {
  const schemaRefs = normalizeSchemaRefs(patch)
  const sources = (patch.sources ?? []).map((source) =>
    createDataPrepSource({
      ...source,
      schemaId: source.schemaId || schemaRefs[0]?.schemaId || '',
    }),
  )
  return {
    version: 1,
    id: patch.id ?? nanoid(10),
    name: patch.name || '未命名数据集',
    description: patch.description ?? '',
    schemaRefs,
    // 兼容旧读取方
    schemaRef: schemaRefs[0],
    sources,
    joins: patch.joins ?? [],
    dimensions: patch.dimensions ?? [],
    measures: patch.measures ?? [],
    updatedAt: patch.updatedAt ?? new Date().toISOString(),
  }
}

export function fieldKey(alias: string, column: string): string {
  return `${alias}.${column}`
}

export function parseFieldKey(field: string): { alias: string; column: string } {
  const idx = field.indexOf('.')
  if (idx <= 0) return { alias: '', column: field }
  return { alias: field.slice(0, idx), column: field.slice(idx + 1) }
}

export function ensureUniqueAlias(
  sources: DataPrepSource[],
  tableName: string,
  schemaName?: string,
): string {
  const used = new Set(sources.map((s) => s.alias))
  if (!used.has(tableName)) return tableName
  const prefixed = `${schemaName || 'schema'}_${tableName}`.replace(/[^\w\u4e00-\u9fa5]+/g, '_')
  if (!used.has(prefixed)) return prefixed
  let i = 2
  while (used.has(`${prefixed}_${i}`)) i += 1
  return `${prefixed}_${i}`
}

export function upsertSchemaRef(
  refs: DataPrepSchemaRef[],
  next: DataPrepSchemaRef,
): DataPrepSchemaRef[] {
  if (refs.some((item) => item.schemaId === next.schemaId)) return refs
  return [...refs, next]
}
