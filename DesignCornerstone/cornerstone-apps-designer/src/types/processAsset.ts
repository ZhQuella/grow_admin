import type { ProcessFlow } from '@grow-admin-rock/process-engine'
import { createProcessFlow } from '@grow-admin-rock/process-engine'

export type ProcessAssetVersion = {
  version: string
  schema: ProcessFlow
  publishedAt: string
  publishedBy?: string
  remark?: string
}

export type ProcessAsset = {
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
  draftSchema: ProcessFlow
  versions: ProcessAssetVersion[]
  createdAt: string
  updatedAt: string
}

export type ProcessAssetListItem = Omit<ProcessAsset, 'draftSchema' | 'versions'> & {
  versionCount: number
}

export type ProcessAssetPageResult = {
  items: ProcessAssetListItem[]
  total: number
}

export type ProcessAssetQuery = {
  page?: number
  pageSize?: number
  name?: string
  code?: string
  enabled?: boolean | '' | string
  publishStatus?: 'draft' | 'published' | ''
  updatedAtStart?: string
  updatedAtEnd?: string
}

export type ProcessAssetCreatePayload = {
  name: string
  code: string
  description?: string
}

export type ProcessAssetUpdatePayload = {
  name: string
  description?: string
}

export function createEmptyProcessSchema(): ProcessFlow {
  return createProcessFlow({ name: '未命名流程' })
}
