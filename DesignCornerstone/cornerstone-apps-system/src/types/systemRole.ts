export const ROLE_CODE_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/
export const ROLE_CODE_MESSAGE = '编码需以字母开头，仅含字母数字下划线'

export const EDIT_SCOPE_VALUES = ['all', 'dept', 'dept_and_sub', 'custom', 'self', 'specified'] as const
export type EditScope = (typeof EDIT_SCOPE_VALUES)[number]

export const VIEW_OTHER_VALUES = ['all', 'self', 'specified', 'none'] as const
export type ViewOtherScope = (typeof VIEW_OTHER_VALUES)[number]

export const FILTER_OPERATOR_VALUES = ['eq', 'neq', 'contains', 'not_contains', 'gt', 'gte', 'lt', 'lte'] as const
export type FilterOperator = (typeof FILTER_OPERATOR_VALUES)[number]

export const FILTER_CURRENT_USER = '__current_user__'

export const EDIT_SCOPE_OPTIONS: Array<{ label: string; value: EditScope }> = [
  { label: '所有记录', value: 'all' },
  { label: '本部门', value: 'dept' },
  { label: '本部门及下级', value: 'dept_and_sub' },
  { label: '自定义部门', value: 'custom' },
  { label: '与成员自己相关的记录', value: 'self' },
  { label: '指定记录', value: 'specified' },
]

export const VIEW_OTHER_OPTIONS: Array<{ label: string; value: ViewOtherScope }> = [
  { label: '可查看其他全部记录', value: 'all' },
  { label: '可查看其他与成员自己相关的记录', value: 'self' },
  { label: '可查看指定的其他记录', value: 'specified' },
  { label: '不可查看其它记录', value: 'none' },
]

export const FILTER_OPERATOR_OPTIONS: Array<{ label: string; value: FilterOperator }> = [
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'neq' },
  { label: '包含', value: 'contains' },
  { label: '不包含', value: 'not_contains' },
  { label: '大于', value: 'gt' },
  { label: '大于等于', value: 'gte' },
  { label: '小于', value: 'lt' },
  { label: '小于等于', value: 'lte' },
]

export function editScopeLabel(scope: EditScope | string | undefined) {
  return EDIT_SCOPE_OPTIONS.find((item) => item.value === scope)?.label || '-'
}

export function viewOtherLabel(scope: ViewOtherScope | string | undefined) {
  return VIEW_OTHER_OPTIONS.find((item) => item.value === scope)?.label || '-'
}

export function filterOperatorLabel(operator: FilterOperator | string | undefined) {
  return FILTER_OPERATOR_OPTIONS.find((item) => item.value === operator)?.label || '-'
}

export function filterValueLabel(value: string | string[] | undefined) {
  const ids = Array.isArray(value) ? value : (value ? [value] : [])
  if (!ids.length) return '-'
  return ids.map((id) => (id === FILTER_CURRENT_USER ? '我（当前用户）' : id)).join('、')
}

export type SelfRelatedConfig = {
  createdBySelf: boolean
  fieldContainsSelf: boolean
  columnIds: string[]
}

export type RowFilterCondition = {
  id: string
  columnId: string
  operator: FilterOperator
  value: string[]
}

export type SystemRoleMember = {
  userId: string
  name: string
  post: string
  deptName: string
}

export type SystemPerson = {
  userId: string
  name: string
  post: string
  deptId: string
  deptName: string
}

export type SystemRoleMenuRef = {
  name: string
  title: string
}

export type SystemRoleFunctionRef = {
  id: string
  title: string
  code: string
  menuName: string
  menuTitle: string
}

export type SystemRoleColumnRef = {
  id: string
  title: string
  code: string
  tableCode: string
  tableTitle: string
}

export type SystemRoleDeptRef = {
  id: string
  name: string
}

export type SystemRoleDataPermItem = {
  menuName: string
  editScope: EditScope
  viewOther: ViewOtherScope
  deptIds: string[]
  selfRelated: SelfRelatedConfig
  viewSelfRelated: SelfRelatedConfig
  filters: RowFilterCondition[]
  viewFilters: RowFilterCondition[]
  columnIds: string[]
}

export type SystemRoleDataPermView = SystemRoleDataPermItem & {
  menuTitle: string
  depts: SystemRoleDeptRef[]
  columns: SystemRoleColumnRef[]
}

export type SystemRoleListItem = {
  id: string
  name: string
  code: string
  sort: number
  enabled: boolean
  remark: string
  builtIn?: boolean
  memberCount: number
  menuCount: number
  functionCount: number
  dataPermCount: number
  updatedAt: string
}

export type SystemRoleDetail = SystemRoleListItem & {
  menuNames: string[]
  menus: SystemRoleMenuRef[]
  functionIds: string[]
  functions: SystemRoleFunctionRef[]
  userIds: string[]
  members: SystemRoleMember[]
  dataPerms: SystemRoleDataPermView[]
}

export type SystemRoleQuery = {
  keyword?: string
  enabled?: string | boolean
  editScope?: EditScope
  page?: number
  pageSize?: number
}

export type SystemRolePageResult = {
  items: SystemRoleListItem[]
  total: number
}

export type SystemRoleCreatePayload = {
  name: string
  code: string
  sort: number
  remark?: string
}

export type SystemRoleUpdatePayload = {
  name: string
  sort: number
  remark?: string
}

export type SystemDeptTreeNode = {
  id: string
  title: string
  children?: SystemDeptTreeNode[]
}

export type RolePermTreeNode = {
  key: string
  title: string
  children?: RolePermTreeNode[]
}
