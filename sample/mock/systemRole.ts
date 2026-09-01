import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import {
  buildDeptTree,
  findDept,
  getDeptName,
  personStore,
  toBriefPerson,
} from './orgStore'
import {
  accountStore,
  findAccount,
  replaceAccountRolesForRole,
} from './accountStore'

const EDIT_SCOPES = new Set(['all', 'dept', 'dept_and_sub', 'custom', 'self', 'specified'])
const VIEW_OTHERS = new Set(['all', 'self', 'specified', 'none'])
const FILTER_OPS = new Set(['eq', 'neq', 'contains', 'not_contains', 'gt', 'gte', 'lt', 'lte'])
const ROLE_CODE_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/

type SelfRelatedRecord = {
  createdBySelf: boolean
  fieldContainsSelf: boolean
  columnIds: string[]
}

type FilterRecord = {
  id: string
  columnId: string
  operator: string
  value: string[]
}

type DataPermRecord = {
  menuName: string
  editScope: string
  viewOther: string
  deptIds: string[]
  selfRelated: SelfRelatedRecord
  viewSelfRelated: SelfRelatedRecord
  filters: FilterRecord[]
  viewFilters: FilterRecord[]
  columnIds: string[]
  editableColumnIds: string[]
}

type RoleRecord = {
  id: string
  name: string
  code: string
  sort: number
  enabled: boolean
  remark: string
  builtIn?: boolean
  menuNames: string[]
  functionIds: string[]
  userIds: string[]
  memberBoundAt: Record<string, string>
  dataPerms: DataPermRecord[]
  updatedAt: string
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function now() {
  return new Date().toISOString()
}

function nextId() {
  return `role_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function emptySelfRelated(): SelfRelatedRecord {
  return {
    createdBySelf: true,
    fieldContainsSelf: false,
    columnIds: [],
  }
}

function emptyDataPerm(menuName: string, extra: Partial<DataPermRecord> = {}): DataPermRecord {
  return {
    menuName,
    editScope: 'self',
    viewOther: 'none',
    deptIds: [],
    selfRelated: emptySelfRelated(),
    viewSelfRelated: emptySelfRelated(),
    filters: [],
    viewFilters: [],
    columnIds: [],
    editableColumnIds: [],
    ...extra,
  }
}

function toAccountMember(accountId: string, boundAt: string) {
  const account = findAccount(accountId)
  const person = account?.personId
    ? personStore.find((item) => item.userId === account.personId)
    : undefined
  return {
    userId: accountId,
    accountId,
    username: account?.username || accountId,
    name: person?.name || '',
    post: person?.post || '-',
    deptName: person ? getDeptName(person.deptId) : '未绑定人员',
    enabled: account?.enabled !== false,
    boundAt,
  }
}

function createRoleStore(): RoleRecord[] {
  return [
  {
    id: 'role_super',
    name: '超级管理员',
    code: 'super_admin',
    sort: 10,
    enabled: true,
    remark: '内置角色，不能停用',
    builtIn: true,
    menuNames: ['MenuManage', 'RoleManage', 'PersonManage', 'AccountManage', 'DeptManage', 'PostManage', 'PositionManage'],
    functionIds: ['mf_query', 'mf_export', 'pf_query', 'pf_create', 'pf_transfer', 'pf_resign', 'af_query', 'af_create', 'af_reset', 'df_query', 'df_create', 'df_edit', 'df_stop', 'df_migrate', 'df_merge', 'df_delete', 'post_query', 'post_create', 'post_edit', 'post_status', 'pos_query', 'pos_create', 'pos_edit', 'pos_status'],
    userIds: ['acc_admin', 'acc_u2', 'acc_u9'],
    memberBoundAt: {},
    dataPerms: [
      emptyDataPerm('MenuManage', {
        editScope: 'all',
        columnIds: ['mc_title', 'mc_name', 'mc_path', 'mc_type', 'mc_sort'],
      }),
      emptyDataPerm('RoleManage', {
        editScope: 'all',
        columnIds: ['rc_name', 'rc_code', 'rc_scope', 'rc_member', 'rc_enabled'],
      }),
      emptyDataPerm('PersonManage', {
        editScope: 'all',
        columnIds: ['pc_name', 'pc_no', 'pc_dept', 'pc_post', 'pc_status', 'pc_mobile'],
      }),
      emptyDataPerm('AccountManage', {
        editScope: 'all',
        columnIds: ['ac_username', 'ac_person', 'ac_dept', 'ac_enabled', 'ac_login'],
      }),
      emptyDataPerm('DeptManage', {
        editScope: 'all',
        columnIds: ['dc_name', 'dc_code', 'dc_parent', 'dc_manager', 'dc_sort', 'dc_status'],
      }),
      emptyDataPerm('PostManage', {
        editScope: 'all',
        columnIds: ['postc_name', 'postc_code', 'postc_dept', 'postc_enabled'],
      }),
      emptyDataPerm('PositionManage', {
        editScope: 'all',
        columnIds: ['posc_name', 'posc_code', 'posc_level', 'posc_enabled'],
      }),
    ],
    updatedAt: now(),
  },
  {
    id: 'role_dev',
    name: '开发人员',
    code: 'developer',
    sort: 20,
    enabled: true,
    remark: '本部门及下级可编辑，其它记录不可查看',
    menuNames: ['MenuManage'],
    functionIds: ['mf_query'],
    userIds: ['acc_u1', 'acc_u3', 'acc_u15'],
    memberBoundAt: {},
    dataPerms: [
      emptyDataPerm('MenuManage', {
        editScope: 'dept_and_sub',
        columnIds: ['mc_title', 'mc_name', 'mc_path'],
      }),
    ],
    updatedAt: now(),
  },
  {
    id: 'role_visitor',
    name: '访客',
    code: 'visitor',
    sort: 30,
    enabled: true,
    remark: '仅本人数据，默认不开放菜单',
    menuNames: [],
    functionIds: [],
    userIds: ['acc_u6'],
    memberBoundAt: {},
    dataPerms: [],
    updatedAt: now(),
  },
  ]
}

const ROLE_STORE_VERSION = 6

function getRoleStore() {
  const g = globalThis as typeof globalThis & {
    __GROW_ROLE_STORE__?: RoleRecord[]
    __GROW_ROLE_STORE_VERSION__?: number
  }
  if (!g.__GROW_ROLE_STORE__ || g.__GROW_ROLE_STORE_VERSION__ !== ROLE_STORE_VERSION) {
    g.__GROW_ROLE_STORE__ = createRoleStore()
    g.__GROW_ROLE_STORE_VERSION__ = ROLE_STORE_VERSION
    for (const role of g.__GROW_ROLE_STORE__) {
      const initialBoundAt = role.updatedAt
      for (const accountId of role.userIds) role.memberBoundAt[accountId] = initialBoundAt
      replaceAccountRolesForRole(role.id, role.userIds)
    }
  }
  return g.__GROW_ROLE_STORE__
}

const roleStore = getRoleStore()

function findRole(id: string) {
  return roleStore.find((item) => item.id === id)
}

function toListItem(role: RoleRecord) {
  return {
    id: role.id,
    name: role.name,
    code: role.code,
    sort: role.sort,
    enabled: role.enabled,
    remark: role.remark,
    builtIn: Boolean(role.builtIn),
    memberCount: role.userIds.length,
    menuCount: role.menuNames.length,
    functionCount: role.functionIds.length,
    dataPermCount: role.dataPerms.length,
    updatedAt: role.updatedAt,
  }
}

function toDetail(role: RoleRecord) {
  return {
    ...toListItem(role),
    menuNames: [...role.menuNames],
    menus: role.menuNames.map((name) => ({ name, title: name })),
    functionIds: [...role.functionIds],
    functions: role.functionIds.map((id) => ({
      id,
      title: id,
      code: id,
      menuName: '',
      menuTitle: '',
    })),
    userIds: [...role.userIds],
    members: role.userIds.map((userId) => toAccountMember(userId, role.memberBoundAt[userId] || role.updatedAt)),
    dataPerms: role.dataPerms.map((item) => ({
      ...item,
      menuTitle: item.menuName,
      depts: item.deptIds.map((id) => ({
        id,
        name: getDeptName(id) || id,
        invalid: Boolean(findDept(id)?.deleted),
      })),
      columns: item.columnIds.map((id) => ({ id, title: id, code: id })),
    })),
  }
}

function parseEnabled(value: unknown) {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return undefined
}

function pickIds(value: unknown) {
  if (!Array.isArray(value)) return [] as string[]
  return [...new Set(value.map((item) => String(item || '').trim()).filter(Boolean))]
}

export function listRoleOptions() {
  return roleStore.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    enabled: item.enabled,
    builtIn: Boolean(item.builtIn),
  }))
}

export function applyAccountRoleIds(accountId: string, roleIds: string[]) {
  const set = new Set(roleIds)
  for (const role of roleStore) {
    const has = role.userIds.includes(accountId)
    const should = set.has(role.id)
    if (should && !has) {
      role.userIds.push(accountId)
      role.memberBoundAt[accountId] = now()
    }
    if (has && !should) {
      role.userIds = role.userIds.filter((id) => id !== accountId)
      delete role.memberBoundAt[accountId]
    }
    if (has !== should) role.updatedAt = now()
  }
  const account = findAccount(accountId)
  if (account) account.roleIds = [...set]
}

export function countRoleMenuGrants(menuNames: string[]) {
  const names = new Set(menuNames)
  return roleStore.reduce(
    (count, role) => count + role.menuNames.filter((name) => names.has(name)).length,
    0,
  )
}

export function countRoleFunctionGrants(functionIds: string[]) {
  const ids = new Set(functionIds)
  return roleStore.reduce(
    (count, role) => count + role.functionIds.filter((id) => ids.has(id)).length,
    0,
  )
}

export function countRoleDataPermissions(menuNames: string[]) {
  const names = new Set(menuNames)
  return roleStore.reduce(
    (count, role) => count + role.dataPerms.filter((item) => names.has(item.menuName)).length,
    0,
  )
}

export function countRoleColumnPermissions(columnIds: string[]) {
  const ids = new Set(columnIds)
  return roleStore.reduce((count, role) => count + role.dataPerms.reduce(
    (subtotal, item) => subtotal + item.columnIds.filter((id) => ids.has(id)).length,
    0,
  ), 0)
}

export function countRoleQueryReferences(columnIds: string[]) {
  const ids = new Set(columnIds)
  return roleStore.reduce((count, role) => count + role.dataPerms.reduce((subtotal, item) => (
    subtotal
    + item.selfRelated.columnIds.filter((id) => ids.has(id)).length
    + item.viewSelfRelated.columnIds.filter((id) => ids.has(id)).length
    + item.filters.filter((filter) => ids.has(filter.columnId)).length
    + item.viewFilters.filter((filter) => ids.has(filter.columnId)).length
  ), 0), 0)
}

export function renameRoleMenuReferences(from: string, to: string) {
  if (!from || !to || from === to) return
  for (const role of roleStore) {
    role.menuNames = [...new Set(role.menuNames.map((name) => (name === from ? to : name)))]
    role.dataPerms.forEach((item) => {
      if (item.menuName === from) item.menuName = to
    })
  }
}

export function removeRoleMenuReferences(
  menuNames: string[],
  functionIds: string[],
) {
  const names = new Set(menuNames)
  const functions = new Set(functionIds)
  for (const role of roleStore) {
    role.menuNames = role.menuNames.filter((name) => !names.has(name))
    role.functionIds = role.functionIds.filter((id) => !functions.has(id))
    role.dataPerms = role.dataPerms.filter((item) => !names.has(item.menuName))
  }
}

export function removeRoleFunctionReferences(functionIds: string[]) {
  const ids = new Set(functionIds)
  for (const role of roleStore) {
    role.functionIds = role.functionIds.filter((id) => !ids.has(id))
  }
}

export function removeRoleColumnReferences(columnIds: string[]) {
  const ids = new Set(columnIds)
  for (const role of roleStore) {
    for (const item of role.dataPerms) {
      item.columnIds = item.columnIds.filter((id) => !ids.has(id))
      item.editableColumnIds = item.editableColumnIds.filter((id) => !ids.has(id))
      item.selfRelated.columnIds = item.selfRelated.columnIds.filter((id) => !ids.has(id))
      item.viewSelfRelated.columnIds = item.viewSelfRelated.columnIds.filter((id) => !ids.has(id))
      item.filters = item.filters.filter((filter) => !ids.has(filter.columnId))
      item.viewFilters = item.viewFilters.filter((filter) => !ids.has(filter.columnId))
    }
  }
}

function pickBaseFields(payload: Recordable<any>, requireCode: boolean) {
  const name = String(payload.name || '').trim()
  const code = String(payload.code || '').trim()
  const sort = Number(payload.sort ?? 0)
  const remark = String(payload.remark || '').trim()

  if (!name) return '请填写名称'
  if (requireCode && !code) return '请填写编码'
  if (requireCode && !ROLE_CODE_PATTERN.test(code)) {
    return '编码需以字母开头，仅含字母数字下划线'
  }
  if (Number.isNaN(sort)) return '请填写排序'

  return { name, code, sort, remark }
}

function pruneDataPerms(role: RoleRecord) {
  const granted = new Set(role.menuNames)
  role.dataPerms = role.dataPerms.filter((item) => granted.has(item.menuName))
}

function pickSelfRelated(raw: Recordable<any> | undefined): SelfRelatedRecord {
  return {
    createdBySelf: raw?.createdBySelf !== false,
    fieldContainsSelf: Boolean(raw?.fieldContainsSelf),
    columnIds: pickIds(raw?.columnIds),
  }
}

function pickFilters(raw: unknown): FilterRecord[] | string {
  if (!Array.isArray(raw)) return []
  const next: FilterRecord[] = []
  for (const item of raw) {
    const columnId = String(item?.columnId || '').trim()
    const operator = String(item?.operator || '').trim()
    const value = pickIds(item?.value)
    if (!columnId || !operator || !value.length) return '筛选条件需填写字段、运算符和值'
    if (!FILTER_OPS.has(operator)) return '筛选运算符不合法'
    next.push({
      id: String(item?.id || '').trim() || `rf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      columnId,
      operator,
      value,
    })
  }
  return next
}

function pickDataPerms(payload: Recordable<any>, grantedMenus: string[]) {
  const granted = new Set(grantedMenus)
  const items = Array.isArray(payload.items) ? payload.items : []
  const next: DataPermRecord[] = []

  for (const raw of items) {
    const menuName = String(raw?.menuName || '').trim()
    if (!menuName) continue
    if (!granted.has(menuName)) return `菜单「${menuName}」未授予，不能配置数据权限`
    const editScope = String(raw?.editScope || '').trim()
    if (!EDIT_SCOPES.has(editScope)) return `菜单「${menuName}」请选择可编辑删除范围`
    const viewOther = editScope === 'all' ? 'none' : String(raw?.viewOther || '').trim()
    if (editScope !== 'all' && !VIEW_OTHERS.has(viewOther)) {
      return `菜单「${menuName}」请选择其它记录权限`
    }
    const deptIds = editScope === 'custom' ? pickIds(raw?.deptIds) : []
    if (editScope === 'custom' && !deptIds.length) return `菜单「${menuName}」请勾选自定义部门`

    const selfRelated = editScope === 'self' ? pickSelfRelated(raw?.selfRelated) : emptySelfRelated()
    if (editScope === 'self' && !selfRelated.createdBySelf && !selfRelated.fieldContainsSelf) {
      return `菜单「${menuName}」请至少选择一种与成员相关的记录`
    }
    if (editScope === 'self' && selfRelated.fieldContainsSelf && !selfRelated.columnIds.length) {
      return `菜单「${menuName}」请勾选包含成员本人的字段`
    }

    const filters = editScope === 'specified' ? pickFilters(raw?.filters) : []
    if (typeof filters === 'string') return `菜单「${menuName}」${filters}`
    if (editScope === 'specified' && !filters.length) return `菜单「${menuName}」请添加筛选条件`

    const viewSelfRelated = editScope !== 'all' && viewOther === 'self'
      ? pickSelfRelated(raw?.viewSelfRelated)
      : emptySelfRelated()
    if (editScope !== 'all' && viewOther === 'self' && !viewSelfRelated.createdBySelf && !viewSelfRelated.fieldContainsSelf) {
      return `菜单「${menuName}」请至少选择一种其它记录的成员相关条件`
    }
    if (editScope !== 'all' && viewOther === 'self' && viewSelfRelated.fieldContainsSelf && !viewSelfRelated.columnIds.length) {
      return `菜单「${menuName}」请勾选其它记录中包含成员本人的字段`
    }

    const viewFilters = editScope !== 'all' && viewOther === 'specified' ? pickFilters(raw?.viewFilters) : []
    if (typeof viewFilters === 'string') return `菜单「${menuName}」${viewFilters}`
    if (editScope !== 'all' && viewOther === 'specified' && !viewFilters.length) {
      return `菜单「${menuName}」请添加其它记录的筛选条件`
    }

    const columnIds = pickIds(raw?.columnIds)
    const visibleIds = new Set(columnIds)
    const editableColumnIds = pickIds(raw?.editableColumnIds)
    if (editableColumnIds.some((id) => !visibleIds.has(id))) {
      return `菜单「${menuName}」存在可编辑但不可见的字段`
    }

    next.push({
      menuName,
      editScope,
      viewOther,
      deptIds,
      selfRelated,
      viewSelfRelated,
      filters,
      viewFilters,
      columnIds,
      editableColumnIds,
    })
  }

  return next
}

const mocks: MockMethod[] = [
  {
    url: mockUrl('/system/roles/page'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const keyword = String(payload.keyword || '').trim().toLowerCase()
      const enabled = parseEnabled(payload.enabled)
      const editScope = String(payload.editScope || '').trim()
      const page = Math.max(1, Number(payload.page || 1))
      const pageSize = Math.max(1, Number(payload.pageSize || 10))

      const filtered = roleStore
        .filter((item) => {
          if (keyword && !item.name.toLowerCase().includes(keyword) && !item.code.toLowerCase().includes(keyword)) {
            return false
          }
          if (enabled !== undefined && item.enabled !== enabled) return false
          if (editScope && !item.dataPerms.some((perm) => perm.editScope === editScope)) return false
          return true
        })
        .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'zh-CN'))

      const start = (page - 1) * pageSize
      return resultSuccess({
        items: filtered.slice(start, start + pageSize).map(toListItem),
        total: filtered.length,
      })
    },
  },
  {
    url: mockUrl('/system/roles'),
    method: 'post',
    timeout: 100,
    response: ({ body }) => {
      const fields = pickBaseFields((body || {}) as Recordable<any>, true)
      if (typeof fields === 'string') return resultError(fields)
      if (roleStore.some((item) => item.code === fields.code)) return resultError('编码已存在')

      const role: RoleRecord = {
        id: nextId(),
        name: fields.name,
        code: fields.code,
        sort: fields.sort,
        enabled: true,
        remark: fields.remark,
        menuNames: [],
        functionIds: [],
        userIds: [],
        memberBoundAt: {},
        dataPerms: [],
        updatedAt: now(),
      }
      roleStore.push(role)
      return resultSuccess(toListItem(role), { message: '创建成功' })
    },
  },
  {
    url: mockUrl('/system/role'),
    method: 'put',
    timeout: 100,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const role = findRole(String(payload.id || '').trim())
      if (!role) return resultError('角色不存在')

      const fields = pickBaseFields(payload, true)
      if (typeof fields === 'string') return resultError(fields)
      if (roleStore.some((item) => item.id !== role.id && item.code === fields.code)) {
        return resultError('编码已存在')
      }

      role.name = fields.name
      role.code = fields.code
      role.sort = fields.sort
      role.remark = fields.remark
      role.updatedAt = now()
      return resultSuccess(toListItem(role), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/system/role/delete-impact'),
    method: 'post',
    timeout: 60,
    response: ({ body }) => {
      const role = findRole(String((body as Recordable<any>)?.id || '').trim())
      if (!role) return resultError('角色不存在')
      return resultSuccess({
        memberCount: role.userIds.length,
        menuCount: role.menuNames.length,
        functionCount: role.functionIds.length,
        dataPermCount: role.dataPerms.length,
      })
    },
  },
  {
    url: mockUrl('/system/role/delete'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const id = String((body as Recordable<any>)?.id || '').trim()
      const index = roleStore.findIndex((item) => item.id === id)
      if (index < 0) return resultError('角色不存在')
      const role = roleStore[index]
      if (role.builtIn) return resultError('内置角色不能删除')
      if (role.enabled) return resultError('启用中的角色不能删除，请先停用')
      replaceAccountRolesForRole(role.id, [])
      roleStore.splice(index, 1)
      return resultSuccess({ id }, { message: '删除成功' })
    },
  },
  {
    url: mockUrl('/system/role/detail'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const role = findRole(String((body as Recordable<any>)?.id || '').trim())
      if (!role) return resultError('角色不存在')
      return resultSuccess(toDetail(role))
    },
  },
  {
    url: mockUrl('/system/role/enabled'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const role = findRole(String(payload.id || '').trim())
      if (!role) return resultError('角色不存在')
      if (role.builtIn && payload.enabled === false) return resultError('超级管理员不能停用')
      role.enabled = payload.enabled !== false
      role.updatedAt = now()
      return resultSuccess(toListItem(role), { message: role.enabled ? '已启用' : '已停用' })
    },
  },
  {
    url: mockUrl('/system/role/members'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const role = findRole(String(payload.id || '').trim())
      if (!role) return resultError('角色不存在')
      if (role.builtIn) return resultError('内置超级管理员角色的账号绑定不可修改')
      const accountIds = new Set(accountStore.map((item) => item.accountId))
      const userIds = pickIds(payload.userIds)
      if (userIds.some((id) => !accountIds.has(id))) return resultError('存在无效账号')
      const savedAt = now()
      role.memberBoundAt = Object.fromEntries(userIds.map((accountId) => [
        accountId,
        role.memberBoundAt[accountId] || savedAt,
      ]))
      role.userIds = userIds
      replaceAccountRolesForRole(role.id, userIds)
      role.updatedAt = savedAt
      return resultSuccess(toDetail(role), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/system/role/data-perm'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const role = findRole(String(payload.id || '').trim())
      if (!role) return resultError('角色不存在')
      const items = pickDataPerms(payload, role.menuNames)
      if (typeof items === 'string') return resultError(items)
      role.dataPerms = items
      role.updatedAt = now()
      return resultSuccess(toDetail(role), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/system/role/menu-perm'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const role = findRole(String(payload.id || '').trim())
      if (!role) return resultError('角色不存在')
      role.menuNames = pickIds(payload.menuNames)
      role.functionIds = pickIds(payload.functionIds)
      pruneDataPerms(role)
      role.updatedAt = now()
      return resultSuccess(toDetail(role), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/system/depts/tree'),
    method: 'post',
    timeout: 60,
    response: () => resultSuccess(clone(buildDeptTree())),
  },
  {
    url: mockUrl('/system/persons'),
    method: 'post',
    timeout: 60,
    response: () => resultSuccess(personStore.map(toBriefPerson)),
  },
  {
    url: mockUrl('/system/roles/options'),
    method: 'post',
    timeout: 40,
    response: () => resultSuccess(listRoleOptions().filter((item) => item.enabled)),
  },
]

export default mocks
