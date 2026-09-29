import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

/** 应用功能列表与菜单写入接口共用的字段 */
export type ApplicationFunctionNode = {
  parentName?: string
  name: string
  title: string
  path: string
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
  pageDataId?: string
  pageType?: 'sandbox' | 'lowcode' | 'report'
  children?: ApplicationFunctionNode[]
}

export type ApplicationFunctionCreatePayload = Omit<ApplicationFunctionNode, 'children'> & {
  parentName?: string
}

export type ApplicationFunctionUpdatePayload = ApplicationFunctionCreatePayload

export type ApplicationFunctionDeleteImpact = {
  childCount: number
  roleMenuGrantCount: number
  functionCount: number
  functionGrantCount: number
  tableCount: number
  columnPermissionCount: number
}
