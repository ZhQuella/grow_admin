export const TENANT_STATUS_VALUES = [
  'not_opened',
  'trial',
  'active',
  'expired',
  'disabled',
  'deleted',
] as const

export type TenantStatus = typeof TENANT_STATUS_VALUES[number]

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  not_opened: '未开通',
  trial: '试用中',
  active: '已开通',
  expired: '已到期',
  disabled: '已停用',
  deleted: '已删除',
}

export const TENANT_TYPE_OPTIONS = [
  { label: '企业', value: 'company' },
  { label: '学校', value: 'school' },
  { label: '政府', value: 'government' },
  { label: '组织', value: 'organization' },
  { label: '其他', value: 'other' },
] as const

export type TenantType = typeof TENANT_TYPE_OPTIONS[number]['value']

export type SystemTenantListItem = {
  id: string
  tenantCode: string
  tenantName: string
  shortName: string
  tenantType: TenantType
  status: TenantStatus
  startedAt: string | null
  expiredAt: string | null
  contactName: string
  contactMobile: string
  accountCount: number
  personCount: number
  lastLoginAt: string | null
  createdAt: string
  builtIn: boolean
}

export type SystemTenantDetail = SystemTenantListItem & {
  contactEmail: string
  creditCode: string
  industry: string
  regionCode: string
  address: string
  remark: string
  createdBy: string
  updatedBy: string
  updatedAt: string
  deletedAt: string | null
}

export type SystemTenantQuery = {
  keyword?: string
  status?: TenantStatus | ''
  createdStartAt?: string
  createdEndAt?: string
  expiredStartAt?: string
  expiredEndAt?: string
  page?: number
  pageSize?: number
}

export type SystemTenantPageResult = {
  items: SystemTenantListItem[]
  total: number
}

export type SystemTenantOption = {
  id: string
  tenantCode: string
  tenantName: string
  status: TenantStatus
  builtIn: boolean
}

export type SystemTenantSavePayload = {
  tenantCode?: string
  tenantName: string
  shortName?: string
  tenantType?: TenantType
  contactName?: string
  contactMobile?: string
  contactEmail?: string
  creditCode?: string
  industry?: string
  regionCode?: string
  address?: string
  remark?: string
}

export type SystemTenantCodePayload = {
  tenantId: string
  newTenantCode: string
  confirmTenantCode: string
  reason: string
}

export type SystemTenantPeriodPayload = {
  tenantId: string
  expiredOn: string
  reason: string
}

export type SystemTenantReasonPayload = {
  tenantId: string
  reason: string
}

export type SystemTenantDeletePayload = {
  tenantId: string
  confirmTenantCode: string
  reason: string
}

export type SystemTenantClearImpact = {
  accountCount: number
  deptCount: number
  postCount: number
  positionCount: number
  personCount: number
  roleCount: number
  selfMenuCount: number
  lowcodePageCount: number
  reportCount: number
  processCount: number
}

export type SystemTenantApplicationFunction = {
  name: string
  title: string
}

export type SystemTenantGrantMenu = {
  id: string
  title: string
  directory: boolean
  functions: Array<{ id: string; title: string; code: string }>
  children?: SystemTenantGrantMenu[]
}

export type SystemTenantGrantDetail = {
  tenantId: string
  tenantName: string
  tenantCode: string
  grantedAt: string | null
  grantedBy: string
  tree: SystemTenantGrantMenu[]
  menuIds: string[]
  functionIds: string[]
}

export type SystemTenantGrantPayload = {
  tenantId: string
  menuIds: string[]
  functionIds: string[]
}

export type TenantActionKey =
  | 'view'
  | 'edit'
  | 'grant'
  | 'trial'
  | 'activate'
  | 'disable'
  | 'code'
  | 'clear'
  | 'delete'
