import { nanoid } from 'nanoid'
import { clampIdentifier, MAX_COLUMN_NAME_LENGTH, MAX_DATABASE_NAME_LENGTH, MAX_TABLE_NAME_LENGTH } from './mysqlTypes'
import type {
  DatabaseSchema,
  MysqlColumnType,
  SchemaColumn,
  SchemaRelation,
  SchemaRelationType,
  SchemaTable,
} from './types'

export function createSchemaColumn(
  patch: Partial<SchemaColumn> & Pick<SchemaColumn, 'name'> = { name: 'column' },
): SchemaColumn {
  const type: MysqlColumnType = patch.type ?? 'VARCHAR'
  return {
    id: patch.id ?? nanoid(10),
    name: clampIdentifier(patch.name, MAX_COLUMN_NAME_LENGTH),
    type,
    length: patch.length ?? (type === 'VARCHAR' ? 255 : type === 'DECIMAL' ? 10 : null),
    scale: patch.scale ?? (type === 'DECIMAL' ? 2 : null),
    primaryKey: patch.primaryKey ?? false,
    autoIncrement: patch.autoIncrement ?? false,
    unique: patch.unique ?? false,
    nullable: patch.nullable ?? true,
    indexed: patch.indexed ?? false,
    defaultValue: patch.defaultValue ?? null,
    comment: patch.comment ?? '',
  }
}

export function createIdColumn(): SchemaColumn {
  return createSchemaColumn({
    name: 'id',
    type: 'BIGINT',
    length: null,
    primaryKey: true,
    autoIncrement: true,
    unique: false,
    nullable: false,
    indexed: false,
    comment: '主键',
  })
}

export function createSchemaTable(
  patch: Partial<SchemaTable> & Pick<SchemaTable, 'name'> = { name: 'table' },
): SchemaTable {
  return {
    id: patch.id ?? nanoid(10),
    name: clampIdentifier(patch.name, MAX_TABLE_NAME_LENGTH),
    comment: patch.comment ?? '',
    columns: patch.columns ?? [createIdColumn()],
    position: patch.position ?? { x: 80, y: 80 },
    isJunction: patch.isJunction ?? false,
  }
}

export function createSchemaRelation(
  patch: Partial<SchemaRelation> &
    Pick<
      SchemaRelation,
      'type' | 'sourceTableId' | 'sourceColumnId' | 'targetTableId' | 'targetColumnId'
    >,
): SchemaRelation {
  return {
    id: patch.id ?? nanoid(10),
    type: patch.type,
    sourceTableId: patch.sourceTableId,
    sourceColumnId: patch.sourceColumnId,
    targetTableId: patch.targetTableId,
    targetColumnId: patch.targetColumnId,
    junctionTableId: patch.junctionTableId,
    junctionSourceColumnId: patch.junctionSourceColumnId,
    junctionTargetColumnId: patch.junctionTargetColumnId,
    onDelete: patch.onDelete ?? 'RESTRICT',
    onUpdate: patch.onUpdate ?? 'CASCADE',
  }
}

export function createDatabaseSchema(
  patch: Partial<DatabaseSchema> = {},
): DatabaseSchema {
  return {
    version: 1,
    dialect: 'mysql',
    name: clampIdentifier(patch.name ?? 'untitled_db', MAX_DATABASE_NAME_LENGTH),
    comment: patch.comment ?? '',
    tables: patch.tables ?? [],
    relations: patch.relations ?? [],
  }
}

export function findPrimaryKeyColumn(table: SchemaTable): SchemaColumn | undefined {
  return table.columns.find((c) => c.primaryKey) ?? table.columns[0]
}

export function nextTableName(tables: SchemaTable[], base = 'table'): string {
  const names = new Set(tables.map((t) => t.name))
  if (!names.has(base)) return base
  let i = 1
  while (names.has(`${base}_${i}`)) i += 1
  return `${base}_${i}`
}

export function nextColumnName(columns: SchemaColumn[], base = 'column'): string {
  const names = new Set(columns.map((c) => c.name))
  if (!names.has(base)) return base
  let i = 1
  while (names.has(`${base}_${i}`)) i += 1
  return `${base}_${i}`
}

export function buildJunctionTableName(a: string, b: string): string {
  return `${a}_${b}`
}

/** 创建多对多：中间表 + 两端外键列 */
export function createManyToManyArtifacts(options: {
  sourceTable: SchemaTable
  targetTable: SchemaTable
  sourceColumn: SchemaColumn
  targetColumn: SchemaColumn
  existingTables: SchemaTable[]
}): {
  junctionTable: SchemaTable
  relation: SchemaRelation
} {
  const { sourceTable, targetTable, sourceColumn, targetColumn, existingTables } = options
  const baseName = buildJunctionTableName(sourceTable.name, targetTable.name)
  const junctionName = nextTableName(existingTables, baseName)

  const junctionSourceCol = createSchemaColumn({
    name: `${sourceTable.name}_id`,
    type: sourceColumn.type,
    length: sourceColumn.length,
    scale: sourceColumn.scale,
    nullable: false,
    indexed: true,
    comment: `关联 ${sourceTable.name}.${sourceColumn.name}`,
  })
  const junctionTargetCol = createSchemaColumn({
    name: `${targetTable.name}_id`,
    type: targetColumn.type,
    length: targetColumn.length,
    scale: targetColumn.scale,
    nullable: false,
    indexed: true,
    comment: `关联 ${targetTable.name}.${targetColumn.name}`,
  })

  const midX = (sourceTable.position.x + targetTable.position.x) / 2
  const midY = (sourceTable.position.y + targetTable.position.y) / 2 + 40

  const junctionTable = createSchemaTable({
    name: junctionName,
    comment: `${sourceTable.name} ↔ ${targetTable.name} 中间表`,
    isJunction: true,
    position: { x: midX, y: midY },
    columns: [createIdColumn(), junctionSourceCol, junctionTargetCol],
  })

  const relation = createSchemaRelation({
    type: 'many-to-many',
    sourceTableId: sourceTable.id,
    sourceColumnId: sourceColumn.id,
    targetTableId: targetTable.id,
    targetColumnId: targetColumn.id,
    junctionTableId: junctionTable.id,
    junctionSourceColumnId: junctionSourceCol.id,
    junctionTargetColumnId: junctionTargetCol.id,
  })

  return { junctionTable, relation }
}

export function ensureFkColumn(options: {
  table: SchemaTable
  refTable: SchemaTable
  refColumn: SchemaColumn
  relationType: Exclude<SchemaRelationType, 'many-to-many'>
}): { table: SchemaTable; column: SchemaColumn; created: boolean } {
  const expectedName = `${options.refTable.name}_id`
  const existing = options.table.columns.find((c) => c.name === expectedName)
  if (existing) {
    return { table: options.table, column: existing, created: false }
  }

  const column = createSchemaColumn({
    name: expectedName,
    type: options.refColumn.type,
    length: options.refColumn.length,
    scale: options.refColumn.scale,
    nullable: options.relationType === 'one-to-one' ? false : true,
    unique: options.relationType === 'one-to-one',
    indexed: true,
    comment: `外键 → ${options.refTable.name}.${options.refColumn.name}`,
  })

  return {
    table: {
      ...options.table,
      columns: [...options.table.columns, column],
    },
    column,
    created: true,
  }
}
