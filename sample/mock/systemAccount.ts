import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import { findPerson, getDeptName, personStore } from './orgStore'
import {
  accountStore,
  cloneAccount,
  findAccount,
  findAccountByPersonId,
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

function isSuperAdmin(account: AccountRecord) {
  const builtInIds = new Set(listRoleOptions().filter((item) => item.builtIn).map((item) => item.id))
  return account.roleIds.some((id) => builtInIds.has(id))
}

function validateRoleIds(account: AccountRecord | undefined, roleIds: string[]) {
  const options = listRoleOptions()
  const validIds = new Set(options.map((item) => item.id))
  if (roleIds.some((id) => !validIds.has(id))) return '存在无效角色'
  const builtInIds = new Set(options.filter((item) => item.builtIn).map((item) => item.id))
  const requested = roleIds.filter((id) => builtInIds.has(id)).sort()
  const existing = (account?.roleIds || []).filter((id) => builtInIds.has(id)).sort()
  if (requested.join(',') !== existing.join(',')) return '内置超级管理员角色不可新增或移除'
  return ''
}

function toListItem(account: AccountRecord) {
  const person = account.personId ? findPerson(account.personId) : undefined
  const personName = person?.name || account.personNameSnapshot
  const personStatus = person?.employeeStatus || account.personStatusSnapshot
  const deptName = person
    ? getDeptName(person.deptId)
    : getDeptName(account.personDeptNameSnapshot) || account.personDeptNameSnapshot
  return {
    accountId: account.accountId,
    username: account.username,
    nickname: account.nickname,
    mobile: account.mobile,
    email: account.email,
    enabled: account.enabled,
    personId: account.personId,
    personName,
    personStatus,
    deptName,
    roleIds: [...account.roleIds],
    roles: toRoles(account.roleIds),
    roleCount: account.roleIds.length,
    superAdmin: isSuperAdmin(account),
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
    personId: account.personId,
    personName: person?.name || account.personNameSnapshot,
    deptName: person
      ? getDeptName(person.deptId)
      : getDeptName(account.personDeptNameSnapshot) || account.personDeptNameSnapshot,
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
      const username = pickText(payload.username).toLowerCase()
      const nickname = pickText(payload.nickname).toLowerCase()
      const personId = pickText(payload.personId)
      const roleId = pickText(payload.roleId)
      const enabled = parseEnabled(payload.enabled)
      const page = Math.max(1, Number(payload.page || 1))
      const pageSize = Math.max(1, Number(payload.pageSize || 10))
      let list = accountStore.map(toListItem)
      if (username) list = list.filter((item) => item.username.toLowerCase().includes(username))
      if (nickname) list = list.filter((item) => item.nickname.toLowerCase().includes(nickname))
      if (personId) list = list.filter((item) => item.personId === personId)
      if (roleId) list = list.filter((item) => item.roleIds.includes(roleId))
      if (enabled !== undefined) list = list.filter((item) => item.enabled === enabled)
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
    url: mockUrl('/system/accounts/person-options'),
    method: 'post',
    timeout: 80,
    response: () => resultSuccess(personStore.map((person) => ({
      personId: person.userId,
      name: person.name,
      deptName: getDeptName(person.deptId),
      employeeStatus: person.employeeStatus,
      accountId: findAccountByPersonId(person.userId)?.accountId || '',
    }))),
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
      const nickname = pickText(payload.nickname)
      const mobile = pickText(payload.mobile)
      const email = pickText(payload.email)
      const password = pickText(payload.password)
      const personId = pickText(payload.personId)
      const remark = pickText(payload.remark)
      const roleIds = pickIds(payload.roleIds)
      if (!username) return resultError('请填写登录名')
      if (!USERNAME_PATTERN.test(username)) return resultError('登录名需以字母开头，3-32 位，可含字母数字 . _ @ -')
      if (!password) return resultError('请填写密码')
      if (findAccountByUsername(username)) return resultError('登录名已存在')
      if (personId && !findPerson(personId)) return resultError('人员不存在')
      if (personId && findAccountByPersonId(personId)) return resultError('该人员已绑定其他账号，不能重复绑定')
      const roleError = validateRoleIds(undefined, roleIds)
      if (roleError) return resultError(roleError)
      const at = now()
      const account: AccountRecord = {
        accountId: nextAccountId(),
        username,
        nickname,
        mobile,
        email,
        password,
        enabled: payload.disableAccount !== true,
        personId,
        personNameSnapshot: personId ? findPerson(personId)?.name || '' : '',
        personDeptNameSnapshot: personId ? findPerson(personId)?.deptId || '' : '',
        personStatusSnapshot: personId ? findPerson(personId)?.employeeStatus || '' : '',
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
      const nickname = pickText(payload.nickname)
      const mobile = pickText(payload.mobile)
      const email = pickText(payload.email)
      const remark = pickText(payload.remark)
      const roleIds = pickIds(payload.roleIds)
      if (!username) return resultError('请填写登录名')
      if (!USERNAME_PATTERN.test(username)) return resultError('登录名需以字母开头，3-32 位，可含字母数字 . _ @ -')
      const duplicated = findAccountByUsername(username)
      if (duplicated && duplicated.accountId !== account.accountId) return resultError('登录名已存在')
      if (isSuperAdmin(account) && account.username !== username) return resultError('超级管理员账号名称不可修改')
      const roleError = validateRoleIds(account, roleIds)
      if (roleError) return resultError(roleError)
      const usernameChanged = account.username !== username
      account.username = username
      account.nickname = nickname
      account.mobile = mobile
      account.email = email
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
      if (isSuperAdmin(account) && !enabled) return resultError('超级管理员不能停用')
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
      if (!personId) return resultError('请选择人员')
      if (!findPerson(personId)) return resultError('人员不存在')
      const occupied = findAccountByPersonId(personId)
      if (occupied && occupied.accountId !== account.accountId) {
        return resultError('该人员已绑定其他账号，不能重复绑定')
      }
      const prev = account.personId
      if (prev === personId) return resultError('新使用人不能与当前使用人相同')
      const prevName = findPerson(prev)?.name || account.personNameSnapshot || prev
      const nextPerson = findPerson(personId)
      account.personId = personId
      account.personNameSnapshot = nextPerson?.name || ''
      account.personDeptNameSnapshot = nextPerson?.deptId || ''
      account.personStatusSnapshot = nextPerson?.employeeStatus || ''
      if (payload.disableAccount === true) account.enabled = false
      account.updatedAt = now()
      pushAccountHistory(account, prev
        ? {
            type: 'reassign',
            title: '换绑人员',
            summary: `${prevName} → ${nextPerson?.name || personId}`,
          }
        : {
            type: 'assign',
            title: '分配人员',
            summary: `绑定人员 ${nextPerson?.name || personId}`,
          })
      return resultSuccess(toDetail(account), { message: prev ? '换绑成功' : '绑定成功' })
    },
  },
  {
    url: mockUrl('/system/account/unassign'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const account = findAccount(pickText(payload.accountId))
      if (!account) return resultError('账号不存在')
      if (!account.personId) return resultError('账号未绑定人员')
      const personName = findPerson(account.personId)?.name || account.personNameSnapshot || account.personId
      account.personId = ''
      account.personNameSnapshot = ''
      account.personDeptNameSnapshot = ''
      account.personStatusSnapshot = ''
      account.updatedAt = now()
      pushAccountHistory(account, {
        type: 'unassign',
        title: '解绑人员',
        summary: `解绑人员 ${personName}`,
      })
      return resultSuccess(toDetail(account), { message: '解绑成功' })
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
      if (!password) return resultError('请填写新密码')
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
  {
    url: mockUrl('/system/account/delete-impact'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const account = findAccount(pickText((body || {}).accountId))
      if (!account) return resultError('账号不存在')
      return resultSuccess({ roleCount: account.roleIds.length, historyCount: account.history.length })
    },
  },
  {
    url: mockUrl('/system/account/delete'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const accountId = pickText((body || {}).accountId)
      const index = accountStore.findIndex((item) => item.accountId === accountId)
      if (index < 0) return resultError('账号不存在')
      const account = accountStore[index]
      if (isSuperAdmin(account)) return resultError('超级管理员账号不可删除')
      if (account.personId) return resultError('已绑定人员的账号不可删除')
      if (account.enabled) return resultError('未停用的账号不可删除')
      applyAccountRoleIds(account.accountId, [])
      accountStore.splice(index, 1)
      return resultSuccess({ accountId }, { message: '删除成功' })
    },
  },
] as MockMethod[]

export default mocks
