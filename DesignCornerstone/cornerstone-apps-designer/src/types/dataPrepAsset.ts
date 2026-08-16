import type { DataPrepDataset } from '@grow-admin-rock/data-prep'
import { createDataPrepDataset } from '@grow-admin-rock/data-prep'

export type DataPrepAssetVersion = {
  version: string
  schema: DataPrepDataset
  publishedAt: string
  publishedBy?: string
  remark?: string
}

export type DataPrepAsset = {
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
  draftSchema: DataPrepDataset
  versions: DataPrepAssetVersion[]
  createdAt: string
  updatedAt: string
}

export type DataPrepAssetListItem = Omit<DataPrepAsset, 'draftSchema' | 'versions'> & {
  versionCount: number
}

export type DataPrepAssetPageResult = {
  items: DataPrepAssetListItem[]
  total: number
}

export type DataPrepAssetQuery = {
  page?: number
  pageSize?: number
  name?: string
  code?: string
  enabled?: boolean | '' | string
  publishStatus?: 'draft' | 'published' | ''
  updatedAtStart?: string
  updatedAtEnd?: string
}

export type DataPrepAssetCreatePayload = {
  name: string
  code: string
  description?: string
}

export type DataPrepAssetUpdatePayload = {
  name: string
  description?: string
}

export function createEmptyDataPrepSchema(): DataPrepDataset {
  return createDataPrepDataset({ name: '未命名数据集' })
}
