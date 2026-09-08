import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'

export const TENANT_MENU_SOURCE_VALUES = ['platform', 'tenant'] as const
export type TenantMenuSource = (typeof TENANT_MENU_SOURCE_VALUES)[number]

export const TENANT_MENU_SOURCE_LABELS: Record<TenantMenuSource, string> = {
  platform: '平台下发',
  tenant: '租户自建',
}

export type TenantMenuNode = {
  name: string
  title: string
  originTitle?: string
  path: string
  componentKey?: string
  icon?: string
  source: TenantMenuSource
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
  children?: TenantMenuNode[]
}

export type TenantMenuTreeResult = {
  tenantId: string
  tenantCode: string
  tenantName: string
  tree: TenantMenuNode[]
}

export type TenantMenuAssemblyResult = TenantMenuTreeResult & {
  availableFunctions: TenantMenuNode[]
}

export type TenantMenuAssemblyPayload = {
  tenantId: string
  tree: TenantMenuNode[]
}
