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

export const DATA_PREP_AGG_OPTIONS: Array<{ label: string; value: DataPrepAgg }> = [
  { label: '求和', value: 'sum' },
  { label: '平均', value: 'avg' },
  { label: '计数', value: 'count' },
  { label: '去重计数', value: 'count_distinct' },
  { label: '最大值', value: 'max' },
  { label: '最小值', value: 'min' },
]

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

export function createDataPrepMeasure(
  patch: Partial<DataPrepMeasure> & Pick<DataPrepMeasure, 'name' | 'field'>,
): DataPrepMeasure {
  return {
    id: patch.id ?? nanoid(10),
    name: patch.name,
    field: patch.field,
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
