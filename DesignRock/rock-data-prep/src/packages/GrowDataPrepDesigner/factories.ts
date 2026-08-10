import { nanoid } from 'nanoid'
import type {
  DataPrepDataset,
  DataPrepJoin,
  DataPrepJoinOnLogic,
  DataPrepJoinType,
  DataPrepMetricConfig,
  DataPrepSchemaRef,
  DataPrepSource,
} from './types'

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

/** 查询结果中度量的输出字段名 */
export function measureOutputKey(
  measure: Pick<DataPrepMetricConfig['measure'], 'outputKey'> & { id?: string },
  configId?: string,
): string {
  const key = measure.outputKey?.trim()
  return key || configId || measure.id || 'value'
}

export function defaultMeasureOutputKey(name: string): string {
  const base = (name || '').replace(/[^\w\u4e00-\u9fa5]+/g, '_') || 'value'
  return base
}

export function ensureUniqueMeasureOutputKey(
  configs: DataPrepMetricConfig[],
  base: string,
  excludeId?: string,
): string {
  const used = new Set(
    configs
      .filter((item) => item.id !== excludeId)
      .map((item) => measureOutputKey(item.measure, item.id)),
  )
  const seed = base.trim() || 'value'
  if (!used.has(seed)) return seed
  let i = 2
  while (used.has(`${seed}_${i}`)) i += 1
  return `${seed}_${i}`
}

export function createDataPrepMetricConfig(
  patch: Partial<DataPrepMetricConfig> & {
    measure?: Partial<DataPrepMetricConfig['measure']>
  } = {},
): DataPrepMetricConfig {
  const id = patch.id ?? nanoid(10)
  const name = patch.measure?.name?.trim() || '未命名度量'
  return {
    id,
    dimensionFields: [...(patch.dimensionFields ?? [])],
    measure: {
      name,
      outputKey:
        patch.measure?.outputKey?.trim() || defaultMeasureOutputKey(name) || id,
      formula: patch.measure?.formula ?? '',
    },
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
  const primarySourceId =
    patch.primarySourceId && sources.some((item) => item.id === patch.primarySourceId)
      ? patch.primarySourceId
      : sources[0]?.id
  return {
    version: 1,
    id: patch.id ?? nanoid(10),
    name: patch.name || '未命名数据集',
    description: patch.description ?? '',
    schemaRefs,
    schemaRef: schemaRefs[0],
    sources,
    primarySourceId,
    joins: patch.joins ?? [],
    metricConfigs: (patch.metricConfigs ?? []).map((item) =>
      createDataPrepMetricConfig(item),
    ),
    outputFields: [...(patch.outputFields ?? [])],
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

/** 公式中的字段引用 token */
export function formulaFieldToken(field: string): string {
  return `[${field}]`
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
