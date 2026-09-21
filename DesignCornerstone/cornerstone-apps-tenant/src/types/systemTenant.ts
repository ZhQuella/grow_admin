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

export type SystemTenantListItem = {
  id: string
  tenantCode: string
  tenantName: string
  shortName: string
  status: TenantStatus
  startedAt: string | null
  expiredAt: string | null
  gracedDays: number
  contactName: string
  contactMobile: string
  accountCount: number
  personCount: number
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  builtIn: boolean
}

export type SystemTenantDetail = SystemTenantListItem & {
  createdBy: string
  updatedBy: string
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

export const TENANT_HISTORY_ACTION_LABELS = {
  create: '新增租户',
  edit: '编辑租户',
  code: '修改租户编码',
  trial: '试用租户',
  activate: '开通租户',
  disable: '停用租户',
  grant: '变更授权',
  clear: '清空租户数据',
  delete: '删除租户',
} as const

export type TenantHistoryAction = keyof typeof TENANT_HISTORY_ACTION_LABELS

export type SystemTenantHistoryItem = {
  id: string
  tenantId: string
  action: TenantHistoryAction
  description: string
  operatedAt: string
  operatorName: string
  remark: string
}

export type SystemTenantHistoryPageResult = {
  items: SystemTenantHistoryItem[]
  total: number
}

export type SystemTenantOption = {
  id: string
  tenantCode: string
  tenantName: string
  status: TenantStatus
  builtIn: boolean
}

export type SystemTenantUpdatePayload = {
  tenantName: string
  shortName?: string
  contactName?: string
  contactMobile?: string
}

export type SystemTenantCreatePayload = SystemTenantUpdatePayload & {
  tenantCode: string
}

export type SystemTenantCodePayload = {
  tenantId: string
  newTenantCode: string
  confirmTenantCode: string
  remark: string
}

export type SystemTenantPeriodPayload = {
  tenantId: number
  expiredOn: string
  graceDays: number
  remark: string
}

export type SystemTenantRemarkPayload = {
  tenantId: string
  remark: string
}

export type SystemTenantDeletePayload = {
  tenantId: string
  confirmTenantCode: string
  remark: string
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

export type SystemTenantGrantColumn = {
  id: string
  menuName: string
  tableCode: string
  tableTitle: string
  title: string
  code: string
  enabled: boolean
  columnPermission: boolean
  sort: number
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
  columnIds?: string[]
}

export type SystemTenantGrantPayload = {
  tenantId: string
  menuIds: string[]
  functionIds: string[]
  columnIds: string[]
}

export type TenantActionKey =
  | 'view'
  | 'history'
  | 'edit'
  | 'grant'
  | 'trial'
  | 'activate'
  | 'disable'
  | 'code'
  | 'clear'
  | 'delete'
