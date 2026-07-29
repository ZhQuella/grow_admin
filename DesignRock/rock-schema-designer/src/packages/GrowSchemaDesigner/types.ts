export type MysqlColumnType =
  | 'TINYINT'
  | 'SMALLINT'
  | 'INT'
  | 'BIGINT'
  | 'DECIMAL'
  | 'FLOAT'
  | 'DOUBLE'
  | 'VARCHAR'
  | 'CHAR'
  | 'TEXT'
  | 'MEDIUMTEXT'
  | 'LONGTEXT'
  | 'DATE'
  | 'DATETIME'
  | 'TIMESTAMP'
  | 'TIME'
  | 'BOOLEAN'
  | 'JSON'
  | 'BLOB'

export type SchemaRelationType = 'one-to-one' | 'one-to-many' | 'many-to-many'

export type SchemaReferentialAction = 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'

export interface SchemaColumn {
  id: string
  name: string
  type: MysqlColumnType
  /** VARCHAR / CHAR 长度；DECIMAL 精度 */
  length?: number | null
  /** DECIMAL 小数位 */
  scale?: number | null
  primaryKey: boolean
  autoIncrement: boolean
  unique: boolean
  nullable: boolean
  indexed: boolean
  defaultValue?: string | null
  comment?: string
}

export interface SchemaTable {
  id: string
  name: string
  comment?: string
  columns: SchemaColumn[]
  position: { x: number; y: number }
  /** 多对多自动生成的中间表 */
  isJunction?: boolean
}

export interface SchemaRelation {
  id: string
  type: SchemaRelationType
  /** 1:1 / 1:N 时为被引用侧（通常是主键）；N:N 时为左侧表 */
  sourceTableId: string
  sourceColumnId: string
  /** 1:1 / 1:N 时为外键侧；N:N 时为右侧表 */
  targetTableId: string
  targetColumnId: string
  junctionTableId?: string
  junctionSourceColumnId?: string
  junctionTargetColumnId?: string
  onDelete: SchemaReferentialAction
  onUpdate: SchemaReferentialAction
}

/** 建模侧 SQL 查询配置（执行走库信息.name，存档走后端；本版仅本地状态） */
export interface SchemaSqlQuery {
  id: string
  name: string
  description?: string
  sql: string
}

export interface DatabaseSchema {
  version: 1
  dialect: 'mysql'
  name: string
  comment?: string
  tables: SchemaTable[]
  relations: SchemaRelation[]
  queries?: SchemaSqlQuery[]
}

export type SchemaSelection =
  | { kind: 'table'; tableId: string }
  | { kind: 'relation'; relationId: string }
  | null
