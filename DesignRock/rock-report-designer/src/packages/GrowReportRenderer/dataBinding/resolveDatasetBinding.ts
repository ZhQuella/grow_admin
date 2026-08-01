import {
  getDatasetFromStorage,
  queryDataPrepDataset,
  toCartesianSeriesPayload,
  type DataPrepDataset,
} from '@grow-admin-rock/data-prep'
import type { ReportBlockDataBinding } from './types'
import type { ResolvedChartDataPayload } from './resolveBlockDataBinding'

export async function resolveDatasetBinding(
  binding: ReportBlockDataBinding | null | undefined,
): Promise<ResolvedChartDataPayload | null> {
  if (!binding || (binding.sourceMode || 'state') !== 'dataset') return null
  const conf = binding.dataset
  if (!conf?.datasetId) return null

  const local = getDatasetFromStorage(conf.datasetId)
  const dataset: DataPrepDataset | undefined = local
  if (!dataset) {
    // 仍尝试仅传 id（依赖 mock 会话存储）
    const result = await queryDataPrepDataset({
      datasetId: conf.datasetId,
      dimensionIds: conf.categoryFieldId ? [conf.categoryFieldId] : undefined,
      measureIds: conf.seriesFieldIds?.filter(Boolean),
    })
    if (!conf.categoryFieldId) {
      return { xAxisData: [], seriesData: [] }
    }
    const { xAxisData, seriesData } = toCartesianSeriesPayload(
      result,
      conf.categoryFieldId,
      conf.seriesFieldIds || [],
    )
    return { xAxisData, seriesData }
  }

  const dimensionIds = conf.categoryFieldId ? [conf.categoryFieldId] : undefined
  const measureIds = (conf.seriesFieldIds || []).filter(Boolean)
  const result = await queryDataPrepDataset({
    dataset,
    dimensionIds,
    measureIds: measureIds.length ? measureIds : undefined,
  })

  if (!conf.categoryFieldId) {
    return { xAxisData: [], seriesData: [] }
  }

  const { xAxisData, seriesData } = toCartesianSeriesPayload(
    result,
    conf.categoryFieldId,
    measureIds,
  )
  return { xAxisData, seriesData }
}
