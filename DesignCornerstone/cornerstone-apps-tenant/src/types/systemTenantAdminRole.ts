import type { SystemTenantGrantMenu, TenantStatus } from './systemTenant'

export const ROLE_CODE_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/
export const ROLE_CODE_MESSAGE = '编码需以字母开头，仅含字母数字下划线'

export const TENANT_ADMIN_ROLE_NAME = '租户管理员'
export const TENANT_ADMIN_ROLE_CODE = 'TENANT_ADMIN'

export type TenantAdminRoleListItem = {
  id: string
  tenantId: string
  tenantCode: string
  tenantName: string
  tenantStatus: TenantStatus
  name: string
  code: string
  builtIn: boolean
  enabled: boolean
  memberCount: number
  menuCount: number
  functionCount: number
  grantedAt: string | null
  createdAt: string
  remark?: string
  sort?: number
}

export type TenantAdminRoleMember = {
  accountId: string
  username: string
  nickname: string
  enabled: boolean
}

export type TenantAdminRoleDetail = TenantAdminRoleListItem & {
  members: TenantAdminRoleMember[]
  tree: SystemTenantGrantMenu[]
  menuIds: string[]
  functionIds: string[]
}

export type TenantAdminRoleQuery = {
  keyword?: string
  tenantId?: string
  tenantStatus?: TenantStatus | ''
  builtIn?: string | boolean
  page?: number
  pageSize?: number
}

export type TenantAdminRolePageResult = {
  items: TenantAdminRoleListItem[]
  total: number
}

export type TenantAdminRoleCreatePayload = {
  tenantId: string
  name: string
  code: string
  sort?: number
  remark?: string
}
