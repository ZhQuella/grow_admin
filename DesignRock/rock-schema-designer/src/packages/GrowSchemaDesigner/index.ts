import GrowSchemaDesigner from './GrowSchemaDesigner.vue'

export { GrowSchemaDesigner }
export type {
  DatabaseSchema,
  SchemaTable,
  SchemaColumn,
  SchemaRelation,
  SchemaRelationType,
  SchemaSqlQuery,
  SchemaColumnType,
  SchemaReferentialAction,
  SchemaSelection,
} from './types'
export {
  createDatabaseSchema,
  createSchemaTable,
  createSchemaColumn,
  createSchemaRelation,
  createSchemaSqlQuery,
} from './factories'
export {
  SCHEMA_COLUMN_TYPE_OPTIONS,
  RELATION_TYPE_OPTIONS,
  REFERENTIAL_ACTION_OPTIONS,
  RELATION_TYPE_LABEL,
  MAX_TABLE_NAME_LENGTH,
  MAX_COLUMN_NAME_LENGTH,
  MAX_DATABASE_NAME_LENGTH,
  clampIdentifier,
  formatColumnType,
} from './static/postgresTypes'
export { exportSchemaJson, downloadSchemaJson, copySchemaJson } from './utils/exportSchema'
