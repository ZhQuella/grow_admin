import type { MysqlColumnType, SchemaRelationType, SchemaReferentialAction } from './types'

export const MYSQL_COLUMN_TYPE_OPTIONS: { label: string; value: MysqlColumnType }[] = [
  { label: 'TINYINT', value: 'TINYINT' },
  { label: 'SMALLINT', value: 'SMALLINT' },
  { label: 'INT', value: 'INT' },
  { label: 'BIGINT', value: 'BIGINT' },
  { label: 'DECIMAL', value: 'DECIMAL' },
  { label: 'FLOAT', value: 'FLOAT' },
  { label: 'DOUBLE', value: 'DOUBLE' },
  { label: 'VARCHAR', value: 'VARCHAR' },
  { label: 'CHAR', value: 'CHAR' },
  { label: 'TEXT', value: 'TEXT' },
  { label: 'MEDIUMTEXT', value: 'MEDIUMTEXT' },
  { label: 'LONGTEXT', value: 'LONGTEXT' },
  { label: 'DATE', value: 'DATE' },
  { label: 'DATETIME', value: 'DATETIME' },
  { label: 'TIMESTAMP', value: 'TIMESTAMP' },
  { label: 'TIME', value: 'TIME' },
  { label: 'BOOLEAN', value: 'BOOLEAN' },
  { label: 'JSON', value: 'JSON' },
  { label: 'BLOB', value: 'BLOB' },
]

export const RELATION_TYPE_OPTIONS: { label: string; value: SchemaRelationType }[] = [
  { label: '一对一 (1:1)', value: 'one-to-one' },
  { label: '一对多 (1:N)', value: 'one-to-many' },
  { label: '多对多 (N:N)', value: 'many-to-many' },
]

export const REFERENTIAL_ACTION_OPTIONS: { label: string; value: SchemaReferentialAction }[] = [
  { label: 'CASCADE', value: 'CASCADE' },
  { label: 'SET NULL', value: 'SET NULL' },
  { label: 'RESTRICT', value: 'RESTRICT' },
  { label: 'NO ACTION', value: 'NO ACTION' },
]

export const RELATION_TYPE_LABEL: Record<SchemaRelationType, string> = {
  'one-to-one': '1:1',
  'one-to-many': '1:N',
  'many-to-many': 'N:N',
}

export function typeNeedsLength(type: MysqlColumnType): boolean {
  return type === 'VARCHAR' || type === 'CHAR' || type === 'DECIMAL'
}

export function typeNeedsScale(type: MysqlColumnType): boolean {
  return type === 'DECIMAL'
}

export function formatColumnType(type: MysqlColumnType, length?: number | null, scale?: number | null): string {
  if (type === 'DECIMAL') {
    const p = length ?? 10
    const s = scale ?? 0
    return `DECIMAL(${p},${s})`
  }
  if ((type === 'VARCHAR' || type === 'CHAR') && length) {
    return `${type}(${length})`
  }
  return type
}
