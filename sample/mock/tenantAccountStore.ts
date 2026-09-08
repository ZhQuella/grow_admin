export type TenantAccountRecord = {
  accountId: string
  tenantId: string
  username: string
  nickname: string
  mobile: string
  email: string
  enabled: boolean
  tenantAdmin: boolean
  lastLoginAt: string
  remark: string
  createdAt: string
  updatedAt: string
}

const TENANT_ACCOUNT_STORE_VERSION = 2

export function nextTenantAccountId() {
  return `ta_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function createTenantAccountStore(): TenantAccountRecord[] {
  return [
  {
    accountId: 'ta_1',
    tenantId: '1',
    username: 'admin',
    nickname: '平台管理员',
    mobile: '13800000000',
    email: 'admin@platform.local',
    enabled: true,
    tenantAdmin: true,
    lastLoginAt: '2026-09-07T08:00:00.000Z',
    remark: '内置平台账号',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-07T08:00:00.000Z',
  },
  {
    accountId: 'ta_2',
    tenantId: '2',
    username: 'acme_admin',
    nickname: '艾可米管理员',
    mobile: '13900001111',
    email: 'admin@acme.test',
    enabled: true,
    tenantAdmin: true,
    lastLoginAt: '2026-09-06T10:12:00.000Z',
    remark: '',
    createdAt: '2026-08-20T04:00:00.000Z',
    updatedAt: '2026-09-01T02:00:00.000Z',
  },
  {
    accountId: 'ta_3',
    tenantId: '2',
    username: 'acme_ops',
    nickname: '运营',
    mobile: '13900001112',
    email: '',
    enabled: true,
    tenantAdmin: false,
    lastLoginAt: '2026-09-05T03:00:00.000Z',
    remark: '',
    createdAt: '2026-08-22T04:00:00.000Z',
    updatedAt: '2026-08-22T04:00:00.000Z',
  },
  {
    accountId: 'ta_4',
    tenantId: '2',
    username: 'acme_fin',
    nickname: '财务',
    mobile: '',
    email: 'fin@acme.test',
    enabled: false,
    tenantAdmin: false,
    lastLoginAt: '',
    remark: '待启用',
    createdAt: '2026-08-25T04:00:00.000Z',
    updatedAt: '2026-08-25T04:00:00.000Z',
  },
  {
    accountId: 'ta_5',
    tenantId: '4',
    username: 'gov_admin',
    nickname: '市政管理员',
    mobile: '13600003333',
    email: '',
    enabled: true,
    tenantAdmin: true,
    lastLoginAt: '2026-08-30T02:00:00.000Z',
    remark: '',
    createdAt: '2026-05-21T08:00:00.000Z',
    updatedAt: '2026-08-30T02:00:00.000Z',
  },
  {
    accountId: 'ta_6',
    tenantId: '4',
    username: 'gov_clerk',
    nickname: '办事员',
    mobile: '13600003334',
    email: '',
    enabled: true,
    tenantAdmin: false,
    lastLoginAt: '2026-08-28T06:00:00.000Z',
    remark: '',
    createdAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-06-01T08:00:00.000Z',
  },
  {
    accountId: 'ta_7',
    tenantId: '4',
    username: 'gov_audit',
    nickname: '审计',
    mobile: '',
    email: '',
    enabled: true,
    tenantAdmin: false,
    lastLoginAt: '',
    remark: '',
    createdAt: '2026-06-02T08:00:00.000Z',
    updatedAt: '2026-06-02T08:00:00.000Z',
  },
  {
    accountId: 'ta_8',
    tenantId: '5',
    username: 'north_admin',
    nickname: '北联管理员',
    mobile: '13500004444',
    email: 'zhao@org.test',
    enabled: true,
    tenantAdmin: true,
    lastLoginAt: '2026-08-01T09:00:00.000Z',
    remark: '',
    createdAt: '2026-06-18T05:00:00.000Z',
    updatedAt: '2026-08-01T09:00:00.000Z',
  },
  {
    accountId: 'ta_9',
    tenantId: '5',
    username: 'north_staff',
    nickname: '职员',
    mobile: '',
    email: '',
    enabled: false,
    tenantAdmin: false,
    lastLoginAt: '',
    remark: '',
    createdAt: '2026-07-01T05:00:00.000Z',
    updatedAt: '2026-08-15T04:00:00.000Z',
  },
  ]
}

export function getTenantAccountStore() {
  const g = globalThis as typeof globalThis & {
    __GROW_TENANT_ACCOUNT_STORE__?: TenantAccountRecord[]
    __GROW_TENANT_ACCOUNT_STORE_VERSION__?: number
  }
  if (!g.__GROW_TENANT_ACCOUNT_STORE__ || g.__GROW_TENANT_ACCOUNT_STORE_VERSION__ !== TENANT_ACCOUNT_STORE_VERSION) {
    g.__GROW_TENANT_ACCOUNT_STORE__ = createTenantAccountStore()
    g.__GROW_TENANT_ACCOUNT_STORE_VERSION__ = TENANT_ACCOUNT_STORE_VERSION
  }
  return g.__GROW_TENANT_ACCOUNT_STORE__
}

export const tenantAccountStore = getTenantAccountStore()

export function findTenantAccount(accountId: string) {
  return getTenantAccountStore().find((item) => item.accountId === accountId)
}

export function listTenantAccounts(tenantId?: string) {
  const store = getTenantAccountStore()
  if (!tenantId) return store
  return store.filter((item) => item.tenantId === tenantId)
}

export function countTenantAdminMembers(tenantId: string) {
  return getTenantAccountStore().filter((item) => item.tenantId === tenantId && item.tenantAdmin).length
}

export function clearTenantAccounts(tenantId: string) {
  const store = getTenantAccountStore()
  for (let index = store.length - 1; index >= 0; index -= 1) {
    if (store[index].tenantId === tenantId) {
      store.splice(index, 1)
    }
  }
}
