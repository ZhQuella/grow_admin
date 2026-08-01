import type { DatabaseSchema } from './types'

/** 导出可持久化的 JSON schema（深拷贝，去掉运行态噪声） */
export function exportSchemaJson(schema: DatabaseSchema, pretty = true): string {
  const payload: DatabaseSchema = {
    version: 1,
    dialect: 'postgresql',
    name: schema.name,
    comment: schema.comment ?? '',
    tables: schema.tables.map((table) => ({
      id: table.id,
      name: table.name,
      comment: table.comment ?? '',
      isJunction: table.isJunction ?? false,
      position: { ...table.position },
      columns: table.columns.map((col) => ({
        id: col.id,
        name: col.name,
        type: col.type,
        length: col.length ?? null,
        scale: col.scale ?? null,
        primaryKey: !!col.primaryKey,
        autoIncrement: !!col.autoIncrement,
        unique: !!col.unique,
        nullable: !!col.nullable,
        indexed: !!col.indexed,
        defaultValue: col.defaultValue ?? null,
        comment: col.comment ?? '',
      })),
    })),
    relations: schema.relations.map((rel) => ({
      id: rel.id,
      type: rel.type,
      sourceTableId: rel.sourceTableId,
      sourceColumnId: rel.sourceColumnId,
      targetTableId: rel.targetTableId,
      targetColumnId: rel.targetColumnId,
      junctionTableId: rel.junctionTableId,
      junctionSourceColumnId: rel.junctionSourceColumnId,
      junctionTargetColumnId: rel.junctionTargetColumnId,
      onDelete: rel.onDelete,
      onUpdate: rel.onUpdate,
    })),
    queries: (schema.queries ?? []).map((q) => ({
      id: q.id,
      name: q.name,
      description: q.description ?? '',
      sql: q.sql ?? '',
    })),
  }

  return pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload)
}

export function downloadSchemaJson(schema: DatabaseSchema, filename?: string) {
  const text = exportSchemaJson(schema)
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `${schema.name || 'schema'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function copySchemaJson(schema: DatabaseSchema): Promise<boolean> {
  const text = exportSchemaJson(schema)
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
