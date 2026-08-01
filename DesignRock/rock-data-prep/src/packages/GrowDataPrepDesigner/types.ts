import type { DataPrepDatabaseSchema } from '../../core/schemaTypes'

export type {
  DataPrepMysqlColumnType,
  DataPrepSchemaColumn,
  DataPrepSchemaTable,
  DataPrepSchemaRelation,
  DataPrepDatabaseSchema,
} from '../../core/schemaTypes'

/** 聚合 / 计算方式（Phase 1） */
export type DataPrepAgg =
  | 'sum'
  | 'avg'
  | 'count'
  | 'count_distinct'
  | 'max'
  | 'min'
  /** 占比：本组求和 / 全部组合计 */
  | 'ratio'
  /** 累计：同系列按时间维度累加求和 */
  | 'running_sum'
  /** 同比：(本期 - 去年同期) / 去年同期；需时间类维度 */
  | 'yoy'
  /** 环比：(本期 - 上期) / 上期；需时间类维度，否则按排序相邻行 */
  | 'mom'
  /** 同比差值：本期 - 去年同期 */
  | 'yoy_diff'
  /** 环比差值：本期 - 上期 */
  | 'mom_diff'

export type DataPrepJoinType = 'inner' | 'left' | 'right'

/** 多字段 Join 条件之间的逻辑 */
export type DataPrepJoinOnLogic = 'and' | 'or'

export type DataPrepJoinOnCondition = {
  leftField: string
  rightField: string
}

/** 数据集引用的建模（可多个，支持跨建模） */
export type DataPrepSchemaRef = {
  schemaId: string
  schemaName?: string
}

export type DataPrepSource = {
  id: string
  alias: string
  /** 所属建模 id */
  schemaId: string
  tableId: string
  tableName: string
  position: { x: number; y: number }
}

export type DataPrepJoin = {
  id: string
  leftSourceId: string
  rightSourceId: string
  type: DataPrepJoinType
  /** 多字段条件之间：并(and) / 或(or)；单条件时可忽略 */
  onLogic?: DataPrepJoinOnLogic
  /** 物理列名（不含 alias） */
  on: DataPrepJoinOnCondition[]
}

export type DataPrepDimension = {
  id: string
  name: string
  /** alias.column */
  field: string
  dataType?: string
}

export type DataPrepMeasure = {
  id: string
  name: string
  /** alias.column */
  field: string
  agg: DataPrepAgg
  format?: 'number' | 'percent' | 'currency'
}

/** 数据准备 Dataset（分析模型） */
export type DataPrepDataset = {
  version: 1
  id: string
  name: string
  description?: string
  /** 引用的建模列表（跨建模时多项） */
  schemaRefs: DataPrepSchemaRef[]
  /**
   * @deprecated 兼容旧数据；读写请用 schemaRefs
   */
  schemaRef?: DataPrepSchemaRef
  sources: DataPrepSource[]
  joins: DataPrepJoin[]
  dimensions: DataPrepDimension[]
  measures: DataPrepMeasure[]
  updatedAt?: string
}

/** 查询请求（设计器预览 / 报表运行时） */
export type DatasetQueryRequest = {
  /** 完整定义（优先）或仅 id（由存储解析） */
  dataset?: DataPrepDataset
  datasetId?: string
  dimensionIds?: string[]
  measureIds?: string[]
  limit?: number
}

export type DatasetQueryColumn = {
  key: string
  title: string
  role: 'dimension' | 'measure'
}

export type DatasetQueryResult = {
  columns: DatasetQueryColumn[]
  rows: Record<string, unknown>[]
}

/** Mock Schema 列表项（结构与 DatabaseSchema 契合，多 id 便于接口） */
export type DataPrepSchemaListItem = {
  id: string
  schema: DataPrepDatabaseSchema
}

export type DataPrepSchemaBundle = DataPrepSchemaListItem & {
  /** 表名 → 明细行（前端 / mock 聚合用） */
  tableRows: Record<string, Record<string, unknown>[]>
}

/** 跨建模行数据：key = `${schemaId}::${tableName}` */
export type DataPrepTableRowsMap = Record<string, Record<string, unknown>[]>

export function sourceTableRowsKey(schemaId: string, tableName: string): string {
  return `${schemaId}::${tableName}`
}
