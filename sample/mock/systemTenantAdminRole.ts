import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import { GRANT_TREE, findTenant, listTenants } from './systemTenant'
import { countTenantAdminMembers, listTenantAccounts } from './tenantAccountStore'

const ROLE_NAME = '租户管理员'
const ROLE_CODE = 'TENANT_ADMIN'
const CODE_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/
const STORE_VERSION = 3

type CustomRole = {
  id: string
  tenantId: string
  name: string
  code: string
  sort: number
  remark: string
  enabled: boolean
  createdAt: string
}

function now() {
  return new Date().toISOString()
}

function text(value: unknown) {
  return String(value ?? '').trim()
}

function parseBoolean(value: unknown) {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return undefined
}

function countGrantedMenus(menuIds: string[]) {
  const ids = new Set(menuIds)
  let count = 0
  const walk = (nodes: typeof GRANT_TREE) => {
    nodes.forEach((node) => {
      if (!node.directory && ids.has(node.id)) count += 1
      if (node.children?.length) walk(node.children)
    })
  }
  walk(GRANT_TREE)
  return count
}

function createCustomRoleStore(): CustomRole[] {
  return [
    {
      id: 'tr_acme_ops',
      tenantId: '2',
      name: '运营',
      code: 'OPS',
      sort: 20,
      remark: '日常运营',
      enabled: true,
      createdAt: '2026-08-22T04:00:00.000Z',
    },
    {
      id: 'tr_gov_clerk',
      tenantId: '4',
      name: '办事员',
      code: 'CLERK',
      sort: 20,
      remark: '',
      enabled: true,
      createdAt: '2026-06-02T08:00:00.000Z',
    },
    {
      id: 'tr_gov_auditor',
      tenantId: '4',
      name: '审计',
      code: 'AUDITOR',
      sort: 30,
      remark: '',
      enabled: true,
      createdAt: '2026-06-03T08:00:00.000Z',
    },
    {
      id: 'tr_gov_lead',
      tenantId: '4',
      name: '科室负责人',
      code: 'LEAD',
      sort: 15,
      remark: '',
      enabled: true,
      createdAt: '2026-06-04T08:00:00.000Z',
    },
    {
      id: 'tr_north_member',
      tenantId: '5',
      name: '会员管理',
      code: 'MEMBER',
      sort: 20,
      remark: '',
      enabled: true,
      createdAt: '2026-07-02T04:00:00.000Z',
    },
  ]
}

function getCustomRoleStore() {
  const g = globalThis as typeof globalThis & {
    __GROW_TENANT_CUSTOM_ROLES__?: CustomRole[]
    __GROW_TENANT_CUSTOM_ROLES_VERSION__?: number
  }
  if (!g.__GROW_TENANT_CUSTOM_ROLES__ || g.__GROW_TENANT_CUSTOM_ROLES_VERSION__ !== STORE_VERSION) {
    g.__GROW_TENANT_CUSTOM_ROLES__ = createCustomRoleStore()
    g.__GROW_TENANT_CUSTOM_ROLES_VERSION__ = STORE_VERSION
  }
  return g.__GROW_TENANT_CUSTOM_ROLES__
}

function builtInRoleId(tenantId: string) {
  return `tenant_admin_${tenantId}`
}

function toBuiltInItem(tenant: NonNullable<ReturnType<typeof findTenant>>) {
  return {
    id: builtInRoleId(tenant.id),
    tenantId: tenant.id,
    tenantCode: tenant.tenantCode,
    tenantName: tenant.tenantName,
    tenantStatus: tenant.status,
    name: ROLE_NAME,
    code: ROLE_CODE,
    builtIn: true,
    enabled: true,
    memberCount: countTenantAdminMembers(tenant.id),
    menuCount: countGrantedMenus(tenant.menuIds),
    functionCount: tenant.functionIds.length,
    grantedAt: tenant.grantedAt,
    createdAt: tenant.createdAt,
    remark: '内置角色，权限与租户授权同步',
    sort: 0,
  }
}

function toCustomItem(role: CustomRole, tenant: NonNullable<ReturnType<typeof findTenant>>) {
  return {
    id: role.id,
    tenantId: role.tenantId,
    tenantCode: tenant.tenantCode,
    tenantName: tenant.tenantName,
    tenantStatus: tenant.status,
    name: role.name,
    code: role.code,
    builtIn: false,
    enabled: role.enabled,
    memberCount: 0,
    menuCount: 0,
    functionCount: 0,
    grantedAt: null,
    createdAt: role.createdAt,
    remark: role.remark,
    sort: role.sort,
  }
}

function listAllRoles() {
  const items = listTenants()
    .filter((item) => item.status !== 'deleted')
    .flatMap((tenant) => {
      const customs = getCustomRoleStore()
        .filter((role) => role.tenantId === tenant.id)
        .map((role) => toCustomItem(role, tenant))
      return [toBuiltInItem(tenant), ...customs]
    })
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function readonlyTree() {
  return GRANT_TREE.map((node) => ({
    ...node,
    disabled: true,
    children: node.children?.map((child) => ({ ...child, disabled: true })),
  }))
}

export default [
  {
    url: mockUrl('/platform/tenant-admin-roles/page'),
    method: 'post',
    timeout: 60,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const keyword = text(payload.keyword).toLowerCase()
      const tenantId = text(payload.tenantId)
      const tenantStatus = text(payload.tenantStatus)
      const builtIn = parseBoolean(payload.builtIn)
      const page = Math.max(1, Number(payload.page || 1))
      const pageSize = Math.max(1, Number(payload.pageSize || 10))
      const filtered = listAllRoles().filter((item) => {
        if (tenantId && item.tenantId !== tenantId) return false
        if (tenantStatus && item.tenantStatus !== tenantStatus) return false
        if (builtIn != null && item.builtIn !== builtIn) return false
        if (!keyword) return true
        const haystack = [item.tenantCode, item.tenantName, item.name, item.code]
          .join(' ')
          .toLowerCase()
        return haystack.includes(keyword)
      })
      const start = (page - 1) * pageSize
      return resultSuccess({
        items: filtered.slice(start, start + pageSize),
        total: filtered.length,
      })
    },
  },
  {
    url: mockUrl('/platform/tenant-admin-role/detail'),
    method: 'post',
    timeout: 40,
    response: ({ body }) => {
      const roleId = text((body as Recordable<any>)?.roleId)
      const all = listAllRoles()
      const item = all.find((role) => role.id === roleId)
      if (!item) return resultError('角色不存在')
      const tenant = findTenant(item.tenantId)
      if (!tenant) return resultError('租户不存在')
      if (item.builtIn) {
        return resultSuccess({
          ...item,
          members: listTenantAccounts(tenant.id)
            .filter((account) => account.tenantAdmin)
            .map((account) => ({
              accountId: account.accountId,
              username: account.username,
              nickname: account.nickname,
              enabled: account.enabled,
            })),
          tree: readonlyTree(),
          menuIds: [...tenant.menuIds],
          functionIds: [...tenant.functionIds],
        })
      }
      return resultSuccess({
        ...item,
        members: [],
        tree: readonlyTree(),
        menuIds: [],
        functionIds: [],
      })
    },
  },
  {
    url: mockUrl('/platform/tenant-admin-role/create'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const tenantId = text(payload.tenantId)
      const tenant = findTenant(tenantId)
      if (!tenant) return resultError('租户不存在')
      if (tenant.status === 'deleted') return resultError('已删除租户不可新增角色')
      const name = text(payload.name)
      const code = text(payload.code)
      if (!name) return resultError('请填写角色名称')
      if (!CODE_PATTERN.test(code)) return resultError('编码需以字母开头，仅含字母数字下划线')
      if (code.toUpperCase() === ROLE_CODE) return resultError('TENANT_ADMIN 为内置编码，不可新增')
      const store = getCustomRoleStore()
      const duplicated = store.some(
        (item) => item.tenantId === tenantId && item.code.toLowerCase() === code.toLowerCase(),
      )
      if (duplicated) return resultError('该租户下角色编码已存在')
      const created: CustomRole = {
        id: `tr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        tenantId,
        name,
        code,
        sort: Number(payload.sort || 10),
        remark: text(payload.remark),
        enabled: true,
        createdAt: now(),
      }
      store.unshift(created)
      tenant.roleCount += 1
      return resultSuccess({
        ...toCustomItem(created, tenant),
        members: [],
        tree: readonlyTree(),
        menuIds: [],
        functionIds: [],
      }, { message: '创建成功' })
    },
  },
] as MockMethod[]
