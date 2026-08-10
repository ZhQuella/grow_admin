import { fieldKey, measureOutputKey, parseFieldKey } from '../factories'
import type {
  DataPrepDataset,
  DataPrepSchemaBundle,
  DataPrepSchemaColumn,
} from '../types'

export type DataPrepOutputFieldCandidate = {
  key: string
  label: string
  role: 'detail' | 'measure'
  groupLabel: string
}

function columnLabel(col: DataPrepSchemaColumn) {
  return col.comment?.trim() || col.name
}

/** 可输出字段候选：关联表明细全量字段 + 度量 outputKey */
export function listOutputFieldCandidates(
  dataset: DataPrepDataset,
  bundlesById: Record<string, DataPrepSchemaBundle | undefined>,
): DataPrepOutputFieldCandidate[] {
  const result: DataPrepOutputFieldCandidate[] = []
  const seen = new Set<string>()

  for (const source of dataset.sources || []) {
    const bundle = bundlesById[source.schemaId]
    const table = bundle?.schema.tables.find((item) => item.id === source.tableId)
    const groupLabel = `${source.alias}（${source.tableName}）`
    for (const col of table?.columns || []) {
      const key = fieldKey(source.alias, col.name)
      if (seen.has(key)) continue
      seen.add(key)
      result.push({
        key,
        label: columnLabel(col),
        role: 'detail',
        groupLabel,
      })
    }
  }

  for (const config of dataset.metricConfigs || []) {
    const key = measureOutputKey(config.measure, config.id)
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push({
      key,
      label: config.measure.name?.trim() || key,
      role: 'measure',
      groupLabel: '度量',
    })
  }

  return result
}

/** 剔除已不存在的输出字段，保持原有顺序 */
export function pruneOutputFields(
  outputFields: string[] | undefined,
  candidates: DataPrepOutputFieldCandidate[],
): string[] {
  const valid = new Set(candidates.map((item) => item.key))
  return (outputFields || []).filter((key) => valid.has(key))
}

export function outputFieldTitle(
  key: string,
  candidates: DataPrepOutputFieldCandidate[],
): string {
  const hit = candidates.find((item) => item.key === key)
  if (hit) return hit.label
  const { column } = parseFieldKey(key)
  return column || key
}
