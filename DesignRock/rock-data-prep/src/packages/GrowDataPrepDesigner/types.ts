/**
 * 与 `@grow-admin-rock/schema-designer` 的 DatabaseSchema 结构契合。
 * 刻意不从 schema-designer 运行时导入，避免 mock(esbuild) 拉入 .vue。
 */

export type DataPrepColumnType =
  | 'SMALLINT'
  | 'INTEGER'
  | 'BIGINT'
  | 'NUMERIC'
  | 'REAL'
  | 'DOUBLE PRECISION'
  | 'VARCHAR'
  | 'CHAR'
  | 'TEXT'
  | 'DATE'
  | 'TIME'
  | 'TIMESTAMP'
  | 'TIMESTAMPTZ'
  | 'BOOLEAN'
  | 'JSON'
  | 'JSONB'
  | 'BYTEA'
  | 'UUID'

/** @deprecated 使用 DataPrepColumnType */
export type DataPrepMysqlColumnType = DataPrepColumnType

export type DataPrepSchemaColumn = {
  id: string
  name: string
  type: DataPrepColumnType
  length?: number | null
  scale?: number | null
  primaryKey: boolean
  autoIncrement: boolean
  unique: boolean
  nullable: boolean
  indexed: boolean
  defaultValue?: string | null
  comment?: string
}

export type DataPrepSchemaTable = {
  id: string
  name: string
  comment?: string
  columns: DataPrepSchemaColumn[]
  position: { x: number; y: number }
  isJunction?: boolean
}

export type DataPrepSchemaRelation = {
  id: string
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  sourceTableId: string
  sourceColumnId: string
  targetTableId: string
  targetColumnId: string
  junctionTableId?: string
  junctionSourceColumnId?: string
  junctionTargetColumnId?: string
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'
  onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'
}

export type DataPrepDatabaseSchema = {
  version: 1
  dialect: 'postgresql'
  name: string
  comment?: string
  tables: DataPrepSchemaTable[]
  relations: DataPrepSchemaRelation[]
  queries?: Array<{
    id: string
    name: string
    description?: string
    sql: string
  }>
}

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
  /**
   * 数据输出字段（有序）。
   * 明细字段为 alias.column，度量字段为 measure.outputKey。
   * 空数组表示尚未配置；预览/对外输出均按此投影。
   */
  outputFields: string[]
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
  role: 'dimension' | 'measure' | 'detail'
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
