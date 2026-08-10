import type { SchemaColumnType, SchemaRelationType, SchemaReferentialAction } from '../types'

/** PostgreSQL 标识符最大长度（NAMEDATALEN - 1） */
export const MAX_TABLE_NAME_LENGTH = 63
export const MAX_COLUMN_NAME_LENGTH = 63
export const MAX_DATABASE_NAME_LENGTH = 63

export function clampIdentifier(value: string, maxLength: number): string {
  return String(value ?? '').slice(0, maxLength)
}

export const SCHEMA_COLUMN_TYPE_OPTIONS: { label: string; value: SchemaColumnType }[] = [
  { label: 'SMALLINT', value: 'SMALLINT' },
  { label: 'INTEGER', value: 'INTEGER' },
  { label: 'BIGINT', value: 'BIGINT' },
  { label: 'NUMERIC', value: 'NUMERIC' },
  { label: 'REAL', value: 'REAL' },
  { label: 'DOUBLE PRECISION', value: 'DOUBLE PRECISION' },
  { label: 'VARCHAR', value: 'VARCHAR' },
  { label: 'CHAR', value: 'CHAR' },
  { label: 'TEXT', value: 'TEXT' },
  { label: 'DATE', value: 'DATE' },
  { label: 'TIME', value: 'TIME' },
  { label: 'TIMESTAMP', value: 'TIMESTAMP' },
  { label: 'TIMESTAMPTZ', value: 'TIMESTAMPTZ' },
  { label: 'BOOLEAN', value: 'BOOLEAN' },
  { label: 'JSON', value: 'JSON' },
  { label: 'JSONB', value: 'JSONB' },
  { label: 'BYTEA', value: 'BYTEA' },
  { label: 'UUID', value: 'UUID' },
]

export const RELATION_TYPE_OPTIONS: { label: string; value: SchemaRelationType }[] = [
  { label: '一对一 (1:1)', value: 'one-to-one' },
  { label: '一对多 (1:N)', value: 'one-to-many' },
  { label: '多对多 (N:N)', value: 'many-to-many' },
]

export const REFERENTIAL_ACTION_OPTIONS: { label: string; value: SchemaReferentialAction }[] = [
  { label: '级联', value: 'CASCADE' },
  { label: '设为空', value: 'SET NULL' },
  { label: '限制', value: 'RESTRICT' },
  { label: '不操作', value: 'NO ACTION' },
]

export const RELATION_TYPE_LABEL: Record<SchemaRelationType, string> = {
  'one-to-one': '1:1',
  'one-to-many': '1:N',
  'many-to-many': 'N:N',
}

export function typeNeedsLength(type: SchemaColumnType): boolean {
  return type === 'VARCHAR' || type === 'CHAR' || type === 'NUMERIC'
}

export function typeNeedsScale(type: SchemaColumnType): boolean {
  return type === 'NUMERIC'
}

export function formatColumnType(
  type: SchemaColumnType,
  length?: number | null,
  scale?: number | null,
): string {
  if (type === 'NUMERIC') {
    const p = length ?? 10
    const s = scale ?? 0
    return `NUMERIC(${p},${s})`
  }
  if ((type === 'VARCHAR' || type === 'CHAR') && length) {
    return `${type}(${length})`
  }
  return type
}
