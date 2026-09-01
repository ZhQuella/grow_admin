import { findPerson, personStore } from './orgStore'

export type AccountHistoryRecord = {
  id: string
  type: 'create' | 'update' | 'assign' | 'reassign' | 'unassign' | 'enable' | 'disable' | 'reset_password' | 'login' | 'delete'
  title: string
  summary: string
  operator: string
  createdAt: string
}

export type AccountRecord = {
  accountId: string
  username: string
  nickname: string
  mobile: string
  email: string
  password: string
  enabled: boolean
  personId: string
  personNameSnapshot: string
  personDeptNameSnapshot: string
  personStatusSnapshot: string
  roleIds: string[]
  remark: string
  lastLoginAt: string
  createdAt: string
  updatedAt: string
  history: AccountHistoryRecord[]
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function now() {
  return new Date().toISOString()
}

function nextHistoryId() {
  return `ah_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function seedHistory(type: AccountHistoryRecord['type'], title: string, summary: string, at: string): AccountHistoryRecord {
  return {
    id: nextHistoryId(),
    type,
    title,
    summary,
    operator: '系统',
    createdAt: at,
  }
}

const BOUND_ACCOUNTS: Array<{ personId: string; username: string; roleIds: string[] }> = [
  { personId: 'u1', username: 'zhangsan', roleIds: ['role_dev'] },
  { personId: 'u2', username: 'lisi', roleIds: ['role_super'] },
  { personId: 'u3', username: 'wangwu', roleIds: ['role_dev'] },
  { personId: 'u6', username: 'sunba', roleIds: ['role_visitor'] },
  { personId: 'u9', username: 'zheng11', roleIds: ['role_super'] },
  { personId: 'u15', username: 'shen17', roleIds: ['role_dev'] },
]

function createAccountStore(): AccountRecord[] {
  const created = now()
  const accounts: AccountRecord[] = [
    {
      accountId: 'acc_admin',
      username: 'admin',
      nickname: '系统管理员',
      mobile: '',
      email: 'admin@example.com',
      password: '1237894560',
      enabled: true,
      personId: '',
      personNameSnapshot: '',
      personDeptNameSnapshot: '',
      personStatusSnapshot: '',
      roleIds: ['role_super'],
      remark: '系统管理员，可不绑定人员',
      lastLoginAt: created,
      createdAt: created,
      updatedAt: created,
      history: [
        seedHistory('create', '开通账号', '开通登录账号 admin', created),
        seedHistory('login', '登录', '登录成功', created),
      ],
    },
  ]

  BOUND_ACCOUNTS.forEach((item, index) => {
    const person = personStore.find((row) => row.userId === item.personId)
    const at = `2024-0${(index % 8) + 1}-12T08:20:00.000Z`
    accounts.push({
      accountId: `acc_${item.personId}`,
      username: item.username,
      nickname: person?.name || '',
      mobile: person?.mobile || '',
      email: person?.email || '',
      password: '123456',
      enabled: person?.employeeStatus !== 'resigned' && person?.employeeStatus !== 'retired',
      personId: item.personId,
      personNameSnapshot: person?.name || '',
      personDeptNameSnapshot: person?.deptId || '',
      personStatusSnapshot: person?.employeeStatus || '',
      roleIds: [...item.roleIds],
      remark: '',
      lastLoginAt: index % 2 === 0 ? at : '',
      createdAt: at,
      updatedAt: at,
      history: [
        seedHistory('create', '开通账号', `开通登录账号 ${item.username}`, at),
        seedHistory('assign', '分配人员', `绑定人员 ${person?.name || item.personId}`, at),
        ...(index % 2 === 0 ? [seedHistory('login', '登录', '登录成功', at)] : []),
      ],
    })
  })

  return accounts
}

const ACCOUNT_STORE_VERSION = 4

export function getAccountStore() {
  const g = globalThis as typeof globalThis & {
    __GROW_ACCOUNT_STORE__?: AccountRecord[]
    __GROW_ACCOUNT_STORE_VERSION__?: number
  }
  if (!g.__GROW_ACCOUNT_STORE__ || g.__GROW_ACCOUNT_STORE_VERSION__ !== ACCOUNT_STORE_VERSION) {
    g.__GROW_ACCOUNT_STORE__ = createAccountStore()
    g.__GROW_ACCOUNT_STORE_VERSION__ = ACCOUNT_STORE_VERSION
  }
  return g.__GROW_ACCOUNT_STORE__
}

export const accountStore = getAccountStore()

export function findAccountByPersonId(personId: string) {
  return accountStore.find((item) => item.personId === personId)
}

export function findAccount(accountId: string) {
  return accountStore.find((item) => item.accountId === accountId)
}

export function findAccountByUsername(username: string) {
  const key = username.trim().toLowerCase()
  return accountStore.find((item) => item.username.toLowerCase() === key)
}

export function nextAccountId() {
  return `acc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export function cloneAccount(account: AccountRecord) {
  return clone(account)
}

export function pushAccountHistory(
  account: AccountRecord,
  item: Omit<AccountHistoryRecord, 'id' | 'createdAt' | 'operator'> & { operator?: string },
) {
  account.history.push({
    id: nextHistoryId(),
    operator: item.operator || '当前用户',
    createdAt: now(),
    ...item,
  })
}

export function recordAccountLogin(username: string, password: string) {
  const account = findAccountByUsername(username)
  if (!account) return null
  if (account.password !== password) return { error: '账号或密码错误' as const }
  if (!account.enabled) return { error: '账号已停用' as const }
  const at = now()
  account.lastLoginAt = at
  account.updatedAt = at
  pushAccountHistory(account, {
    type: 'login',
    title: '登录',
    summary: '登录成功',
    operator: account.username,
  })
  const person = account.personId ? findPerson(account.personId) : undefined
  return { account, person }
}

export function replaceAccountRolesForRole(roleId: string, accountIds: string[]) {
  const set = new Set(accountIds)
  for (const account of accountStore) {
    const has = account.roleIds.includes(roleId)
    const should = set.has(account.accountId)
    if (should && !has) account.roleIds.push(roleId)
    if (has && !should) account.roleIds = account.roleIds.filter((id) => id !== roleId)
  }
}
