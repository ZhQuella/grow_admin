import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import { findPerson, getDeptName } from './orgStore'
import {
  accountStore,
  cloneAccount,
  findAccount,
  findAccountByUsername,
  nextAccountId,
  pushAccountHistory,
  type AccountRecord,
} from './accountStore'
import { applyAccountRoleIds, listRoleOptions } from './systemRole'

const USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9._@-]{2,31}$/

function now() {
  return new Date().toISOString()
}

function pickText(value: unknown) {
  return String(value ?? '').trim()
}

function pickIds(value: unknown) {
  if (!Array.isArray(value)) return [] as string[]
  return [...new Set(value.map((item) => String(item || '').trim()).filter(Boolean))]
}

function parseEnabled(value: unknown) {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return undefined
}

function toRoles(roleIds: string[]) {
  const options = listRoleOptions()
  const map = new Map(options.map((item) => [item.id, item]))
  return roleIds.map((id) => map.get(id) || { id, name: id, code: id })
}

function toListItem(account: AccountRecord) {
  const person = account.personId ? findPerson(account.personId) : undefined
  return {
    accountId: account.accountId,
    username: account.username,
    enabled: account.enabled,
    personId: account.personId,
    personName: person?.name || '',
    deptName: person ? getDeptName(person.deptId) : '',
    roleIds: [...account.roleIds],
    roles: toRoles(account.roleIds),
    lastLoginAt: account.lastLoginAt,
    remark: account.remark,
    updatedAt: account.updatedAt,
  }
}

function toDetail(account: AccountRecord) {
  return {
    ...toListItem(account),
    createdAt: account.createdAt,
    history: cloneAccount(account).history.slice().reverse(),
  }
}

function toBrief(account: AccountRecord) {
  const person = account.personId ? findPerson(account.personId) : undefined
  return {
    accountId: account.accountId,
    username: account.username,
    personName: person?.name || '',
    enabled: account.enabled,
  }
}

const mocks = [
  {
    url: mockUrl('/system/accounts/page'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const keyword = pickText(payload.keyword).toLowerCase()
      const enabled = parseEnabled(payload.enabled)
      const unbound = parseEnabled(payload.unbound)
      const page = Math.max(1, Number(payload.page || 1))
      const pageSize = Math.max(1, Number(payload.pageSize || 10))
      let list = accountStore.map(toListItem)
      if (keyword) {
        list = list.filter((item) =>
          [item.username, item.personName, item.deptName].some((text) => text.toLowerCase().includes(keyword)),
        )
      }
      if (enabled !== undefined) list = list.filter((item) => item.enabled === enabled)
      if (unbound === true) list = list.filter((item) => !item.personId)
      if (unbound === false) list = list.filter((item) => Boolean(item.personId))
      const total = list.length
      const start = (page - 1) * pageSize
      return resultSuccess({ items: list.slice(start, start + pageSize), total })
    },
  },
  {
    url: mockUrl('/system/accounts'),
    method: 'post',
    timeout: 80,
    response: () => resultSuccess(accountStore.map(toBrief)),
  },
  {
    url: mockUrl('/system/account/detail'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const account = findAccount(pickText((body || {}).accountId))
      if (!account) return resultError('账号不存在')
      return resultSuccess(toDetail(account))
    },
  },
  {
    url: mockUrl('/system/account/history'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const account = findAccount(pickText((body || {}).accountId))
      if (!account) return resultError('账号不存在')
      return resultSuccess(cloneAccount(account).history.slice().reverse())
    },
  },
  {
    url: mockUrl('/system/account/create'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const username = pickText(payload.username)
      const password = pickText(payload.password)
      const remark = pickText(payload.remark)
      const roleIds = pickIds(payload.roleIds)
      if (!username) return resultError('请填写登录名')
      if (!USERNAME_PATTERN.test(username)) return resultError('登录名需以字母开头，3-32 位，可含字母数字 . _ @ -')
      if (password.length < 6) return resultError('密码至少 6 位')
      if (findAccountByUsername(username)) return resultError('登录名已存在')
      const at = now()
      const account: AccountRecord = {
        accountId: nextAccountId(),
        username,
        password,
        enabled: true,
        personId: '',
        roleIds: [],
        remark,
        lastLoginAt: '',
        createdAt: at,
        updatedAt: at,
        history: [],
      }
      accountStore.unshift(account)
      applyAccountRoleIds(account.accountId, roleIds)
      pushAccountHistory(account, {
        type: 'create',
        title: '开通账号',
        summary: `开通登录账号 ${username}`,
      })
      return resultSuccess(toDetail(account), { message: '新增成功' })
    },
  },
  {
    url: mockUrl('/system/account'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const account = findAccount(pickText(payload.accountId))
      if (!account) return resultError('账号不存在')
      const username = pickText(payload.username)
      const remark = pickText(payload.remark)
      const roleIds = pickIds(payload.roleIds)
      if (!username) return resultError('请填写登录名')
      if (!USERNAME_PATTERN.test(username)) return resultError('登录名需以字母开头，3-32 位，可含字母数字 . _ @ -')
      const duplicated = findAccountByUsername(username)
      if (duplicated && duplicated.accountId !== account.accountId) return resultError('登录名已存在')
      const usernameChanged = account.username !== username
      account.username = username
      account.remark = remark
      account.updatedAt = now()
      applyAccountRoleIds(account.accountId, roleIds)
      pushAccountHistory(account, {
        type: 'update',
        title: '修改账号',
        summary: usernameChanged ? `登录名变更为 ${username}` : '更新账号资料',
      })
      return resultSuccess(toDetail(account), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/system/account/enabled'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const account = findAccount(pickText(payload.accountId))
      if (!account) return resultError('账号不存在')
      const enabled = payload.enabled !== false
      if (account.accountId === 'acc_admin' && !enabled) return resultError('系统管理员不能停用')
      account.enabled = enabled
      account.updatedAt = now()
      pushAccountHistory(account, {
        type: enabled ? 'enable' : 'disable',
        title: enabled ? '启用' : '停用',
        summary: enabled ? '启用账号' : '停用账号',
      })
      return resultSuccess(toDetail(account), { message: enabled ? '已启用' : '已停用' })
    },
  },
  {
    url: mockUrl('/system/account/assign'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const account = findAccount(pickText(payload.accountId))
      if (!account) return resultError('账号不存在')
      const personId = pickText(payload.personId)
      if (personId && !findPerson(personId)) return resultError('人员不存在')
      const prev = account.personId
      account.personId = personId
      account.updatedAt = now()
      if (!personId) {
        pushAccountHistory(account, {
          type: 'unassign',
          title: '解绑人员',
          summary: prev ? `解绑人员 ${findPerson(prev)?.name || prev}` : '未绑定人员',
        })
      } else {
        pushAccountHistory(account, {
          type: 'assign',
          title: '分配人员',
          summary: `绑定人员 ${findPerson(personId)?.name || personId}`,
        })
      }
      return resultSuccess(toDetail(account), { message: personId ? '分配成功' : '已解绑' })
    },
  },
  {
    url: mockUrl('/system/account/reset-password'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const account = findAccount(pickText(payload.accountId))
      if (!account) return resultError('账号不存在')
      const password = pickText(payload.password)
      if (password.length < 6) return resultError('密码至少 6 位')
      account.password = password
      account.updatedAt = now()
      pushAccountHistory(account, {
        type: 'reset_password',
        title: '重置密码',
        summary: '已重置登录密码',
      })
      return resultSuccess({ accountId: account.accountId }, { message: '密码已重置' })
    },
  },
] as MockMethod[]

export default mocks
