/**
 * 无 Vue 的 core 入口：供 sample/mock（esbuild）安全引用。
 * 勿从此处 re-export 任何 .vue 组件。
 */
export type {
  DataPrepColumnType,
  DataPrepMysqlColumnType,
  DataPrepSchemaColumn,
  DataPrepSchemaTable,
  DataPrepSchemaRelation,
  DataPrepDatabaseSchema,
} from './schemaTypes'

export type {
  DataPrepAgg,
  DataPrepJoinType,
  DataPrepJoinOnLogic,
  DataPrepJoinOnCondition,
  DataPrepSchemaRef,
  DataPrepSource,
  DataPrepJoin,
  DataPrepDimension,
  DataPrepMeasure,
  DataPrepDataset,
  DatasetQueryRequest,
  DatasetQueryColumn,
  DatasetQueryResult,
  DataPrepSchemaListItem,
  DataPrepSchemaBundle,
  DataPrepTableRowsMap,
} from '../packages/GrowDataPrepDesigner/types'

export { sourceTableRowsKey } from '../packages/GrowDataPrepDesigner/types'

export {
  DATA_PREP_AGG_OPTIONS,
  DATA_PREP_AGG_LABELS,
  getDataPrepAggDescription,
  isCompareAgg,
  isCompareRateAgg,
  isDerivedAgg,
  isPercentDisplayAgg,
  createDataPrepDataset,
  createDataPrepDimension,
  createDataPrepMeasure,
  createDataPrepSource,
  createDataPrepJoin,
  measureOutputKey,
  defaultMeasureOutputKey,
  ensureUniqueMeasureOutputKey,
  fieldKey,
  parseFieldKey,
  ensureUniqueAlias,
  upsertSchemaRef,
  normalizeSchemaRefs,
} from '../packages/GrowDataPrepDesigner/factories'
export type { DataPrepAggOption } from '../packages/GrowDataPrepDesigner/factories'

export {
  createDemoSalesSchemaBundle,
  createDemoRegionSchemaBundle,
  DEMO_SCHEMA_BUNDLES,
} from '../packages/GrowDataPrepDesigner/demoSchema'

export {
  queryDatasetLocal,
  toCartesianSeriesPayload,
  mergeSchemaBundlesToRowsMap,
} from '../packages/GrowDataPrepDesigner/queryDataset'

export {
  DATA_PREP_DATASETS_STORAGE_KEY,
  loadDatasetsFromStorage,
  saveDatasetsToStorage,
  upsertDatasetInStorage,
  removeDatasetFromStorage,
  getDatasetFromStorage,
} from '../packages/GrowDataPrepDesigner/datasetStorage'
