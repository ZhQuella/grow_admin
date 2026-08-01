import {
  createDataPrepDataset,
  createDataPrepDimension,
  createDataPrepMeasure,
  createDataPrepSource,
  fieldKey,
} from './factories'
import { createDemoSalesSchemaBundle } from './demoSchema'
import { loadDatasetsFromStorage, upsertDatasetInStorage } from './datasetStorage'
import type { DataPrepDataset } from './types'

/** 若本地无数据集，写入一份可直接绑报表的单表示例 */
export function ensureDemoDataset(): DataPrepDataset[] {
  const existing = loadDatasetsFromStorage()
  if (existing.length) return existing

  const bundle = createDemoSalesSchemaBundle()
  const orders = bundle.schema.tables.find((t) => t.name === 'orders')
  if (!orders) return existing

  const source = createDataPrepSource({
    schemaId: bundle.id,
    tableId: orders.id,
    tableName: orders.name,
    alias: orders.name,
    position: { x: 160, y: 120 },
  })

  const dataset = createDataPrepDataset({
    id: 'dataset_demo_orders_region',
    name: '订单区域汇总',
    description: 'Demo：按区域汇总订单金额 / 数量',
    schemaRefs: [{ schemaId: bundle.id, schemaName: bundle.schema.name }],
    sources: [source],
    dimensions: [
      createDataPrepDimension({
        id: 'dim_region',
        name: '销售区域',
        field: fieldKey(source.alias, 'region'),
        dataType: 'VARCHAR',
      }),
    ],
    measures: [
      createDataPrepMeasure({
        id: 'mea_amount',
        name: '订单金额',
        field: fieldKey(source.alias, 'amount'),
        agg: 'sum',
      }),
      createDataPrepMeasure({
        id: 'mea_qty',
        name: '数量',
        field: fieldKey(source.alias, 'quantity'),
        agg: 'sum',
      }),
    ],
  })

  return upsertDatasetInStorage(dataset)
}
