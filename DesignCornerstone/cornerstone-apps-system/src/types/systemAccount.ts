export const ACCOUNT_STATUS_VALUES = ['enabled', 'disabled'] as const
export type AccountStatus = (typeof ACCOUNT_STATUS_VALUES)[number]

export const ACCOUNT_EVENT_VALUES = [
  'create',
  'update',
  'assign',
  'unassign',
  'enable',
  'disable',
  'reset_password',
  'login',
] as const
export type AccountEventType = (typeof ACCOUNT_EVENT_VALUES)[number]

export const ACCOUNT_USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9._@-]{2,31}$/
export const ACCOUNT_USERNAME_MESSAGE = '登录名需以字母开头，3-32 位，可含字母数字 . _ @ -'

export const ACCOUNT_EVENT_OPTIONS: Array<{ label: string; value: AccountEventType }> = [
  { label: '开通账号', value: 'create' },
  { label: '修改账号', value: 'update' },
  { label: '分配人员', value: 'assign' },
  { label: '解绑人员', value: 'unassign' },
  { label: '启用', value: 'enable' },
  { label: '停用', value: 'disable' },
  { label: '重置密码', value: 'reset_password' },
  { label: '登录', value: 'login' },
]

export function accountEventLabel(value?: string) {
  return ACCOUNT_EVENT_OPTIONS.find((item) => item.value === value)?.label || '-'
}

export type AccountRoleRef = {
  id: string
  name: string
  code: string
}

export type AccountHistoryItem = {
  id: string
  type: AccountEventType
  title: string
  summary: string
  operator: string
  createdAt: string
}

export type SystemAccountListItem = {
  accountId: string
  username: string
  enabled: boolean
  personId: string
  personName: string
  deptName: string
  roleIds: string[]
  roles: AccountRoleRef[]
  lastLoginAt: string
  remark: string
  updatedAt: string
}

export type SystemAccountDetail = SystemAccountListItem & {
  createdAt: string
  history: AccountHistoryItem[]
}

export type SystemAccountQuery = {
  keyword?: string
  enabled?: string | boolean
  unbound?: string | boolean
  page?: number
  pageSize?: number
}

export type SystemAccountPageResult = {
  items: SystemAccountListItem[]
  total: number
}

export type SystemAccountCreatePayload = {
  username: string
  password: string
  roleIds?: string[]
  remark?: string
}

export type SystemAccountUpdatePayload = {
  username: string
  roleIds?: string[]
  remark?: string
}

export type SystemAccountAssignPayload = {
  accountId: string
  personId: string
}

export type SystemAccountResetPayload = {
  accountId: string
  password: string
}

export type SystemAccountBrief = {
  accountId: string
  username: string
  personName: string
  enabled: boolean
}
