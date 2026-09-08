export const ACCOUNT_USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9._@-]{2,31}$/
export const ACCOUNT_USERNAME_MESSAGE = '登录名需以字母开头，3-32 位，可含字母数字 . _ @ -'

export type TenantAccountListItem = {
  accountId: string
  tenantId: string
  tenantCode: string
  tenantName: string
  username: string
  nickname: string
  mobile: string
  email: string
  enabled: boolean
  tenantAdmin: boolean
  lastLoginAt: string
  remark: string
  updatedAt: string
}

export type TenantAccountDetail = TenantAccountListItem & {
  createdAt: string
}

export type TenantAccountQuery = {
  tenantId?: string
  username?: string
  nickname?: string
  enabled?: string | boolean
  tenantAdmin?: string | boolean
  page?: number
  pageSize?: number
}

export type TenantAccountPageResult = {
  items: TenantAccountListItem[]
  total: number
}

export type TenantAccountCreatePayload = {
  tenantId: string
  username: string
  nickname?: string
  mobile?: string
  email?: string
  password: string
  tenantAdmin?: boolean
  remark?: string
}

export type TenantAccountUpdatePayload = {
  nickname?: string
  mobile?: string
  email?: string
  remark?: string
  enabled?: boolean
}

export type TenantAccountAssignPayload = {
  accountId: string
  assigned: boolean
}
