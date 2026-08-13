import type { DesignerSchema } from '@grow-admin-rock/designer'

/** 低代码资产类型：表单 / 页面 */
export type LowcodeAssetType = 'form' | 'page'

export type LowcodeAssetVersion = {
  version: string
  schema: DesignerSchema
  publishedAt: string
  publishedBy?: string
  remark?: string
}

export type LowcodeAsset = {
  id: string
  name: string
  code: string
  type: LowcodeAssetType
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
  draftSchema: DesignerSchema
  versions: LowcodeAssetVersion[]
  createdAt: string
  updatedAt: string
}

/** 列表行（不含大字段） */
export type LowcodeAssetListItem = Omit<LowcodeAsset, 'draftSchema' | 'versions'> & {
  versionCount: number
}

export type LowcodeAssetPageResult = {
  items: LowcodeAssetListItem[]
  total: number
}

export type LowcodeAssetQuery = {
  page?: number
  pageSize?: number
  name?: string
  code?: string
  type?: LowcodeAssetType | ''
  enabled?: boolean | '' | string
  /** 发布状态：draft 从未发布 / published 已有发布版本 */
  publishStatus?: 'draft' | 'published' | ''
  updatedAtStart?: string
  updatedAtEnd?: string
}

export type LowcodeAssetCreatePayload = {
  name: string
  code: string
  type: LowcodeAssetType
  description?: string
}

export type LowcodeAssetUpdatePayload = {
  name: string
  description?: string
  type: LowcodeAssetType
}

export function createEmptyDesignerSchema(): DesignerSchema {
  return {
    structures: [],
    renderArgument: {},
    props: {},
    styles: {},
    pageConfig: {},
    dataSource: [],
    computedProps: [],
    apiOutlined: [],
    propBindModes: {},
    events: {},
  }
}

export const LOWCODE_ASSET_TYPE_OPTIONS = [
  { label: '表单', value: 'form' },
  { label: '页面', value: 'page' },
] as const

export function lowcodeAssetTypeLabel(type: LowcodeAssetType): string {
  return type === 'form' ? '表单' : '页面'
}
