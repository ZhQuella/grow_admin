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
  DataPrepJoinType,
  DataPrepJoinOnLogic,
  DataPrepJoinOnCondition,
  DataPrepSchemaRef,
  DataPrepSource,
  DataPrepJoin,
  DataPrepMetricConfig,
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
  createDataPrepDataset,
  createDataPrepMetricConfig,
  createDataPrepSource,
  createDataPrepJoin,
  measureOutputKey,
  defaultMeasureOutputKey,
  ensureUniqueMeasureOutputKey,
  fieldKey,
  parseFieldKey,
  formulaFieldToken,
  ensureUniqueAlias,
  upsertSchemaRef,
  normalizeSchemaRefs,
} from '../packages/GrowDataPrepDesigner/factories'

export {
  createDemoSalesSchemaBundle,
  createDemoRegionSchemaBundle,
  DEMO_SCHEMA_BUNDLES,
} from '../packages/GrowDataPrepDesigner/demoSchema'

export {
  queryDatasetLocal,
  previewMetricConfig,
  toCartesianSeriesPayload,
  mergeSchemaBundlesToRowsMap,
} from '../packages/GrowDataPrepDesigner/queryDataset'

export {
  evaluateFormulaOnGroup,
  extractFormulaFields,
  FORMULA_FUNCTION_DOCS,
} from '../packages/GrowDataPrepDesigner/formulaEval'

export {
  DATA_PREP_DATASETS_STORAGE_KEY,
  loadDatasetsFromStorage,
  saveDatasetsToStorage,
  upsertDatasetInStorage,
  removeDatasetFromStorage,
  getDatasetFromStorage,
} from '../packages/GrowDataPrepDesigner/datasetStorage'
