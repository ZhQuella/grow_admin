import type { ReportSchema } from '@grow-admin-rock/report-designer'
import { createReportSchema } from '@grow-admin-rock/report-designer'

export type ReportAssetVersion = {
  version: string
  schema: ReportSchema
  publishedAt: string
  publishedBy?: string
  remark?: string
}

export type ReportAsset = {
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
  draftSchema: ReportSchema
  versions: ReportAssetVersion[]
  createdAt: string
  updatedAt: string
}

export type ReportAssetListItem = Omit<ReportAsset, 'draftSchema' | 'versions'> & {
  versionCount: number
}

export type ReportAssetPageResult = {
  items: ReportAssetListItem[]
  total: number
}

export type ReportAssetQuery = {
  page?: number
  pageSize?: number
  name?: string
  code?: string
  enabled?: boolean | '' | string
  publishStatus?: 'draft' | 'published' | ''
  updatedAtStart?: string
  updatedAtEnd?: string
}

export type ReportAssetCreatePayload = {
  name: string
  code: string
  description?: string
}

export type ReportAssetUpdatePayload = {
  name: string
  description?: string
}

export function createEmptyReportSchema(): ReportSchema {
  return createReportSchema([])
}
