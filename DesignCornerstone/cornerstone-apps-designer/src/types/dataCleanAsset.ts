import type { CleanFlow } from '@grow-admin-rock/data-clean'
import { createCleanFlow } from '@grow-admin-rock/data-clean'

export type DataCleanAssetVersion = {
  version: string
  schema: CleanFlow
  publishedAt: string
  publishedBy?: string
  remark?: string
}

export type DataCleanAsset = {
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
  draftSchema: CleanFlow
  versions: DataCleanAssetVersion[]
  createdAt: string
  updatedAt: string
}

export type DataCleanAssetListItem = Omit<DataCleanAsset, 'draftSchema' | 'versions'> & {
  versionCount: number
}

export type DataCleanAssetPageResult = {
  items: DataCleanAssetListItem[]
  total: number
}

export type DataCleanAssetQuery = {
  page?: number
  pageSize?: number
  name?: string
  code?: string
  enabled?: boolean | '' | string
  publishStatus?: 'draft' | 'published' | ''
  updatedAtStart?: string
  updatedAtEnd?: string
}

export type DataCleanAssetCreatePayload = {
  name: string
  code: string
  description?: string
}

export type DataCleanAssetUpdatePayload = {
  name: string
  description?: string
}

export function createEmptyDataCleanSchema(): CleanFlow {
  return createCleanFlow({ name: '未命名清洗流' })
}
