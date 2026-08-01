/**
 * 与 `@grow-admin-rock/schema-designer` 的 DatabaseSchema 结构契合。
 * 刻意不从 schema-designer 运行时导入，避免 mock(esbuild) 拉入 .vue。
 */

export type DataPrepMysqlColumnType =
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

export type DataPrepSchemaColumn = {
  id: string
  name: string
  type: DataPrepMysqlColumnType
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
  dialect: 'mysql'
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
