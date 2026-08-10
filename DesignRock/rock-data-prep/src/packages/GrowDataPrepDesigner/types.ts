import type { DataPrepDatabaseSchema } from '../../core/schemaTypes'

export type {
  DataPrepColumnType,
  DataPrepMysqlColumnType,
  DataPrepSchemaColumn,
  DataPrepSchemaTable,
  DataPrepSchemaRelation,
  DataPrepDatabaseSchema,
} from '../../core/schemaTypes'

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

/** 一条「维度 / 度量」配置：多个维度字段 + 一条公式度量 */
export type DataPrepMetricConfig = {
  id: string
  /** 维度字段（alias.column），顺序即分组顺序 */
  dimensionFields: string[]
  measure: {
    name: string
    /**
     * 查询结果行对象中的字段名。
     * 缺省时回退为配置 id。
     */
    outputKey?: string
    /**
     * 公式文本。字段引用写作 `[alias.column]`，
     * 支持 SUM/AVG/COUNT/MAX/MIN 及四则运算、IF/AND/OR/NOT。
     */
    formula: string
  }
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
  /**
   * 主表来源 id（sources[].id）。
   * 缺省时取 sources[0]；添加的第一张表会自动设为主表。
   */
  primarySourceId?: string
  joins: DataPrepJoin[]
  /** 维度/度量配置列表（每项：多维度 + 单度量） */
  metricConfigs: DataPrepMetricConfig[]
  updatedAt?: string
}

/** 查询请求（设计器预览 / 报表运行时） */
export type DatasetQueryRequest = {
  /** 完整定义（优先）或仅 id（由存储解析） */
  dataset?: DataPrepDataset
  datasetId?: string
  /** 指定配置 id；缺省为全部（按相同维度集合合并度量列） */
  configIds?: string[]
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

/** schemaId + 表名 → 行数据（本地 demo / 预览） */
export type DataPrepTableRowsMap = Record<string, Record<string, unknown>[]>

export type DataPrepSchemaListItem = {
  id: string
  schema: DataPrepDatabaseSchema
}

export type DataPrepSchemaBundle = {
  id: string
  schema: DataPrepDatabaseSchema
  tableRows: Record<string, Record<string, unknown>[]>
}

export function sourceTableRowsKey(schemaId: string, tableName: string) {
  return `${schemaId}::${tableName}`
}
