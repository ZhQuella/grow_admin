import {
  createDataPrepDataset,
  createDataPrepMetricConfig,
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

  const amountField = fieldKey(source.alias, 'amount')
  const qtyField = fieldKey(source.alias, 'quantity')
  const regionField = fieldKey(source.alias, 'region')

  const dataset = createDataPrepDataset({
    id: 'dataset_demo_orders_region',
    name: '订单区域汇总',
    description: 'Demo：按区域汇总订单金额 / 数量',
    schemaRefs: [{ schemaId: bundle.id, schemaName: bundle.schema.name }],
    sources: [source],
    primarySourceId: source.id,
    metricConfigs: [
      createDataPrepMetricConfig({
        id: 'cfg_amount',
        dimensionFields: [regionField],
        measure: {
          name: '订单金额',
          outputKey: 'amount',
          formula: `SUM([${amountField}])`,
        },
      }),
      createDataPrepMetricConfig({
        id: 'cfg_qty',
        dimensionFields: [regionField],
        measure: {
          name: '数量',
          outputKey: 'quantity',
          formula: `SUM([${qtyField}])`,
        },
      }),
    ],
  })

  return upsertDatasetInStorage(dataset)
}
