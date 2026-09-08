import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import { findTenant } from './systemTenant'
import {
  findTenantAccount,
  getTenantAccountStore,
  nextTenantAccountId,
  type TenantAccountRecord,
} from './tenantAccountStore'

const USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9._@-]{2,31}$/
const MOBILE_PATTERN = /^1[3-9]\d{9}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

function toListItem(account: TenantAccountRecord) {
  const tenant = findTenant(account.tenantId)
  return {
    accountId: account.accountId,
    tenantId: account.tenantId,
    tenantCode: tenant?.tenantCode || '',
    tenantName: tenant?.tenantName || '',
    username: account.username,
    nickname: account.nickname,
    mobile: account.mobile,
    email: account.email,
    enabled: account.enabled,
    tenantAdmin: account.tenantAdmin,
    lastLoginAt: account.lastLoginAt,
    remark: account.remark,
    updatedAt: account.updatedAt,
  }
}

function toDetail(account: TenantAccountRecord) {
  return {
    ...toListItem(account),
    createdAt: account.createdAt,
  }
}

function syncAccountCount(tenantId: string) {
  const tenant = findTenant(tenantId)
  if (!tenant) return
  tenant.accountCount = getTenantAccountStore().filter((item) => item.tenantId === tenantId).length
}

export default [
  {
    url: mockUrl('/platform/tenant-accounts/page'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const tenantId = text(payload.tenantId)
      const username = text(payload.username).toLowerCase()
      const nickname = text(payload.nickname).toLowerCase()
      const enabled = parseBoolean(payload.enabled)
      const tenantAdmin = parseBoolean(payload.tenantAdmin)
      const page = Math.max(1, Number(payload.page || 1))
      const pageSize = Math.max(1, Number(payload.pageSize || 10))
      const filtered = getTenantAccountStore().filter((item) => {
        if (tenantId && item.tenantId !== tenantId) return false
        if (username && !item.username.toLowerCase().includes(username)) return false
        if (nickname && !item.nickname.toLowerCase().includes(nickname)) return false
        if (enabled != null && item.enabled !== enabled) return false
        if (tenantAdmin != null && item.tenantAdmin !== tenantAdmin) return false
        return true
      }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      const start = (page - 1) * pageSize
      return resultSuccess({
        items: filtered.slice(start, start + pageSize).map(toListItem),
        total: filtered.length,
      })
    },
  },
  {
    url: mockUrl('/platform/tenant-account/detail'),
    method: 'post',
    timeout: 40,
    response: ({ body }) => {
      const account = findTenantAccount(text((body as Recordable<any>)?.accountId))
      if (!account) return resultError('账号不存在')
      return resultSuccess(toDetail(account))
    },
  },
  {
    url: mockUrl('/platform/tenant-account/create'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const tenantId = text(payload.tenantId)
      const tenant = findTenant(tenantId)
      if (!tenant) return resultError('租户不存在')
      if (tenant.status === 'deleted') return resultError('已删除租户不可创建账号')
      const username = text(payload.username)
      if (!USERNAME_PATTERN.test(username)) return resultError('登录名需以字母开头，3-32 位，可含字母数字 . _ @ -')
      if (!text(payload.password)) return resultError('请填写密码')
      const mobile = text(payload.mobile)
      if (mobile && !MOBILE_PATTERN.test(mobile)) return resultError('手机号格式不正确')
      const email = text(payload.email)
      if (email && !EMAIL_PATTERN.test(email)) return resultError('邮箱格式不正确')
      const duplicated = getTenantAccountStore().some(
        (item) => item.tenantId === tenantId && item.username.toLowerCase() === username.toLowerCase(),
      )
      if (duplicated) return resultError('该租户下登录名已存在')
      const created = {
        accountId: nextTenantAccountId(),
        tenantId,
        username,
        nickname: text(payload.nickname) || username,
        mobile,
        email,
        enabled: true,
        tenantAdmin: Boolean(payload.tenantAdmin),
        lastLoginAt: '',
        remark: text(payload.remark),
        createdAt: now(),
        updatedAt: now(),
      }
      getTenantAccountStore().unshift(created)
      syncAccountCount(tenantId)
      return resultSuccess(toDetail(created), { message: '创建成功' })
    },
  },
  {
    url: mockUrl('/platform/tenant-account'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const account = findTenantAccount(text(payload.accountId))
      if (!account) return resultError('账号不存在')
      const tenant = findTenant(account.tenantId)
      if (tenant?.status === 'deleted') return resultError('已删除租户不可编辑账号')
      const mobile = text(payload.mobile)
      if (mobile && !MOBILE_PATTERN.test(mobile)) return resultError('手机号格式不正确')
      const email = text(payload.email)
      if (email && !EMAIL_PATTERN.test(email)) return resultError('邮箱格式不正确')
      account.nickname = text(payload.nickname)
      account.mobile = mobile
      account.email = email
      account.remark = text(payload.remark)
      if (payload.enabled === true || payload.enabled === false) account.enabled = payload.enabled
      account.updatedAt = now()
      return resultSuccess(toDetail(account), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/platform/tenant-account/assign-tenant-admin'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const account = findTenantAccount(text(payload.accountId))
      if (!account) return resultError('账号不存在')
      const tenant = findTenant(account.tenantId)
      if (!tenant) return resultError('租户不存在')
      if (tenant.status === 'deleted') return resultError('已删除租户不可分配租户管理员')
      account.tenantAdmin = payload.assigned !== false
      account.updatedAt = now()
      return resultSuccess(toDetail(account), {
        message: account.tenantAdmin ? '已分配租户管理员' : '已取消租户管理员',
      })
    },
  },
] as MockMethod[]
