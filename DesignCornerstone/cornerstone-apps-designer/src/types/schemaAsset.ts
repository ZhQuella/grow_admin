import type { DatabaseSchema } from '@grow-admin-rock/schema-designer'
import { createDatabaseSchema } from '@grow-admin-rock/schema-designer'

export type SchemaAssetVersion = {
  version: string
  schema: DatabaseSchema
  publishedAt: string
  publishedBy?: string
  remark?: string
}

export type SchemaAsset = {
  id: string
  name: string
  code: string
  description: string
  /** 启用中不可删除 */
  enabled: boolean
  /** 已发布中的最新版本号，如 v1；从未发布为 null */
  currentVersion: string | null
  /** 最近一次发布时间；从未发布为 null */
  publishedAt: string | null
  /** 最近一次发布人；从未发布为 null */
  publishedBy: string | null
  /** 最近更新人 */
  updatedBy: string
  draftSchema: DatabaseSchema
  versions: SchemaAssetVersion[]
  createdAt: string
  updatedAt: string
}

export type SchemaAssetListItem = Omit<SchemaAsset, 'draftSchema' | 'versions'> & {
  versionCount: number
}

export type SchemaAssetPageResult = {
  items: SchemaAssetListItem[]
  total: number
}

export type SchemaAssetQuery = {
  page?: number
  pageSize?: number
  name?: string
  code?: string
  enabled?: boolean | '' | string
  publishStatus?: 'draft' | 'published' | ''
  updatedAtStart?: string
  updatedAtEnd?: string
}

export type SchemaAssetCreatePayload = {
  name: string
  code: string
  description?: string
}

export type SchemaAssetUpdatePayload = {
  name: string
  description?: string
}

export function createEmptySchema(): DatabaseSchema {
  return createDatabaseSchema()
}
