import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 与 GET /menu/list 合并后的节点字段对齐 */
export type SystemMenuNode = {
  name: string
  title: string
  path: string
  componentKey?: string
  icon?: string
  menuType: MenuTypeEnum
  enabled: boolean
  description?: string
  isVisible: boolean
  isKeepAlive?: boolean
  affix?: boolean
  defaultShow?: boolean
  sort?: number
  isExternalPage?: boolean
  openMode?: PageOpenModeEnum
  link?: string
  children?: SystemMenuNode[]
}

export type SystemMenuCreatePayload = Omit<SystemMenuNode, 'children'> & {
  parentName?: string
}

export type SystemMenuUpdatePayload = SystemMenuCreatePayload

export type SystemMenuDeleteImpact = {
  childCount: number
  roleMenuGrantCount: number
  functionCount: number
  functionGrantCount: number
  tableCount: number
  columnPermissionCount: number
}

export type SystemMenuCodeImpact = {
  roleMenuGrantCount: number
  functionCount: number
  tableCount: number
  dataPermissionCount: number
}
