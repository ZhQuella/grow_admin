import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import { clearTenantAccounts } from './tenantAccountStore'

type TenantStatus = 'not_opened' | 'trial' | 'active' | 'expired' | 'disabled' | 'deleted'
type TenantType = 'company' | 'school' | 'government' | 'organization' | 'other'

type TenantRecord = {
  id: string
  tenantCode: string
  tenantName: string
  shortName: string
  tenantType: TenantType
  status: TenantStatus
  startedAt: string | null
  expiredAt: string | null
  contactName: string
  contactMobile: string
  contactEmail: string
  creditCode: string
  industry: string
  regionCode: string
  address: string
  remark: string
  builtIn: boolean
  lastLoginAt: string | null
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  accountCount: number
  personCount: number
  deptCount: number
  postCount: number
  positionCount: number
  roleCount: number
  selfMenuCount: number
  lowcodePageCount: number
  reportCount: number
  processCount: number
  menuIds: string[]
  functionIds: string[]
  grantedAt: string | null
  grantedBy: string
}

const GRANT_TREE = [
  {
    id: 'SystemCatalog',
    title: '系统管理',
    directory: true,
    functions: [],
    children: [
      { id: 'MenuManage', title: '菜单管理', directory: false, functions: [
        { id: 'mf_query', title: '查询', code: 'query' },
        { id: 'mf_export', title: '导出', code: 'export' },
      ] },
      { id: 'RoleManage', title: '角色管理', directory: false, functions: [
        { id: 'rf_query', title: '查询', code: 'query' },
        { id: 'rf_create', title: '新增', code: 'create' },
      ] },
      { id: 'AccountManage', title: '账号管理', directory: false, functions: [
        { id: 'af_query', title: '查询', code: 'query' },
        { id: 'af_create', title: '新增', code: 'create' },
      ] },
      { id: 'PersonManage', title: '人员管理', directory: false, functions: [
        { id: 'pf_query', title: '查询', code: 'query' },
        { id: 'pf_create', title: '新增', code: 'create' },
      ] },
      { id: 'DeptManage', title: '部门管理', directory: false, functions: [
        { id: 'df_query', title: '查询', code: 'query' },
        { id: 'df_create', title: '新增', code: 'create' },
      ] },
      { id: 'PostManage', title: '岗位管理', directory: false, functions: [
        { id: 'post_query', title: '查询', code: 'query' },
      ] },
      { id: 'PositionManage', title: '职级管理', directory: false, functions: [
        { id: 'pos_query', title: '查询', code: 'query' },
      ] },
      { id: 'OrgChart', title: '组织架构图', directory: false, functions: [
        { id: 'org_query', title: '查询', code: 'query' },
      ] },
    ],
  },
]

const ALL_GRANT_MENU_IDS = [
  'SystemCatalog',
  'MenuManage',
  'RoleManage',
  'AccountManage',
  'PersonManage',
  'DeptManage',
  'PostManage',
  'PositionManage',
  'OrgChart',
]

const ALL_GRANT_FUNCTION_IDS = GRANT_TREE[0].children.flatMap((item) => item.functions.map((fn) => fn.id))

function now() {
  return new Date().toISOString()
}

function text(value: unknown) {
  return String(value ?? '').trim()
}

function endOfDay(dateStr: string) {
  return `${dateStr}T23:59:59.000`
}

function startOfToday() {
  const date = todayDate()
  return `${date}T00:00:00.000`
}

function todayDate() {
  const current = new Date()
  const month = String(current.getMonth() + 1).padStart(2, '0')
  const day = String(current.getDate()).padStart(2, '0')
  return `${current.getFullYear()}-${month}-${day}`
}

function inDateRange(value: string | null, start?: string, end?: string) {
  if (!start && !end) return true
  if (!value) return false
  const day = value.slice(0, 10)
  if (start && day < start) return false
  if (end && day > end) return false
  return true
}

let seq = 10

function nextId() {
  seq += 1
  return String(seq)
}

function createTenantStore(): TenantRecord[] {
  return [
  {
    id: '1',
    tenantCode: 'platform',
    tenantName: '平台管理组织',
    shortName: '平台',
    tenantType: 'organization',
    status: 'active',
    startedAt: null,
    expiredAt: null,
    contactName: '系统管理员',
    contactMobile: '13800000000',
    contactEmail: 'admin@platform.local',
    creditCode: '',
    industry: '',
    regionCode: '',
    address: '',
    remark: '内置平台租户',
    builtIn: true,
    lastLoginAt: '2026-09-07T08:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-07T08:00:00.000Z',
    deletedAt: null,
    accountCount: 1,
    personCount: 0,
    deptCount: 0,
    postCount: 0,
    positionCount: 0,
    roleCount: 1,
    selfMenuCount: 0,
    lowcodePageCount: 0,
    reportCount: 0,
    processCount: 0,
    menuIds: [...ALL_GRANT_MENU_IDS],
    functionIds: [...ALL_GRANT_FUNCTION_IDS],
    grantedAt: '2026-01-01T00:00:00.000Z',
    grantedBy: 'system',
  },
  {
    id: '2',
    tenantCode: 'acme',
    tenantName: '艾可米科技',
    shortName: '艾可米',
    tenantType: 'company',
    status: 'trial',
    startedAt: '2026-09-01T00:00:00.000',
    expiredAt: '2026-09-30T23:59:59.000',
    contactName: '张敏',
    contactMobile: '13900001111',
    contactEmail: 'zhangmin@acme.test',
    creditCode: '91310000MA0000001X',
    industry: '软件',
    regionCode: '310000',
    address: '上海市浦东新区',
    remark: '',
    builtIn: false,
    lastLoginAt: '2026-09-06T10:12:00.000Z',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-08-20T03:00:00.000Z',
    updatedAt: '2026-09-01T02:00:00.000Z',
    deletedAt: null,
    accountCount: 3,
    personCount: 8,
    deptCount: 4,
    postCount: 6,
    positionCount: 5,
    roleCount: 2,
    selfMenuCount: 1,
    lowcodePageCount: 2,
    reportCount: 1,
    processCount: 0,
    menuIds: ['SystemCatalog', 'AccountManage', 'PersonManage', 'DeptManage'],
    functionIds: ['af_query', 'af_create', 'pf_query', 'df_query'],
    grantedAt: '2026-08-21T04:00:00.000Z',
    grantedBy: 'admin',
  },
  {
    id: '3',
    tenantCode: 'west-school',
    tenantName: '西城实验学校',
    shortName: '西城校',
    tenantType: 'school',
    status: 'not_opened',
    startedAt: null,
    expiredAt: null,
    contactName: '李华',
    contactMobile: '13700002222',
    contactEmail: 'lihua@school.test',
    creditCode: '',
    industry: '教育',
    regionCode: '110000',
    address: '',
    remark: '待授权后开通',
    builtIn: false,
    lastLoginAt: null,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-09-05T06:30:00.000Z',
    updatedAt: '2026-09-05T06:30:00.000Z',
    deletedAt: null,
    accountCount: 0,
    personCount: 0,
    deptCount: 0,
    postCount: 0,
    positionCount: 0,
    roleCount: 1,
    selfMenuCount: 0,
    lowcodePageCount: 0,
    reportCount: 0,
    processCount: 0,
    menuIds: [],
    functionIds: [],
    grantedAt: null,
    grantedBy: '',
  },
  {
    id: '4',
    tenantCode: 'city-gov',
    tenantName: '市政服务中心',
    shortName: '市政',
    tenantType: 'government',
    status: 'expired',
    startedAt: '2026-06-01T00:00:00.000',
    expiredAt: '2026-08-31T23:59:59.000',
    contactName: '王强',
    contactMobile: '13600003333',
    contactEmail: '',
    creditCode: '',
    industry: '政务',
    regionCode: '440100',
    address: '',
    remark: '',
    builtIn: false,
    lastLoginAt: '2026-08-30T02:00:00.000Z',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-05-20T08:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    deletedAt: null,
    accountCount: 3,
    personCount: 40,
    deptCount: 9,
    postCount: 15,
    positionCount: 8,
    roleCount: 4,
    selfMenuCount: 3,
    lowcodePageCount: 5,
    reportCount: 2,
    processCount: 1,
    menuIds: [...ALL_GRANT_MENU_IDS],
    functionIds: [...ALL_GRANT_FUNCTION_IDS],
    grantedAt: '2026-05-21T01:00:00.000Z',
    grantedBy: 'admin',
  },
  {
    id: '5',
    tenantCode: 'north-org',
    tenantName: '北区联合会',
    shortName: '北联',
    tenantType: 'organization',
    status: 'disabled',
    startedAt: '2026-07-01T00:00:00.000',
    expiredAt: '2026-12-31T23:59:59.000',
    contactName: '赵倩',
    contactMobile: '13500004444',
    contactEmail: 'zhao@org.test',
    creditCode: '',
    industry: '',
    regionCode: '',
    address: '',
    remark: '主动停用',
    builtIn: false,
    lastLoginAt: '2026-08-01T09:00:00.000Z',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2026-06-18T04:00:00.000Z',
    updatedAt: '2026-08-15T04:00:00.000Z',
    deletedAt: null,
    accountCount: 2,
    personCount: 11,
    deptCount: 3,
    postCount: 4,
    positionCount: 3,
    roleCount: 2,
    selfMenuCount: 0,
    lowcodePageCount: 0,
    reportCount: 0,
    processCount: 0,
    menuIds: ['SystemCatalog', 'AccountManage'],
    functionIds: ['af_query'],
    grantedAt: '2026-06-19T02:00:00.000Z',
    grantedBy: 'admin',
  },
  ]
}

const TENANT_STORE_VERSION = 2

export function getTenantStore() {
  const g = globalThis as typeof globalThis & {
    __GROW_TENANT_STORE__?: TenantRecord[]
    __GROW_TENANT_STORE_VERSION__?: number
  }
  if (!g.__GROW_TENANT_STORE__ || g.__GROW_TENANT_STORE_VERSION__ !== TENANT_STORE_VERSION) {
    g.__GROW_TENANT_STORE__ = createTenantStore()
    g.__GROW_TENANT_STORE_VERSION__ = TENANT_STORE_VERSION
  }
  return g.__GROW_TENANT_STORE__
}

export function findTenant(id: string) {
  return getTenantStore().find((item) => item.id === id)
}

export function listTenants() {
  return getTenantStore()
}

export { GRANT_TREE }

function isActiveCodeTaken(code: string, excludeId?: string) {
  const normalized = code.toLowerCase()
  return getTenantStore().some((item) =>
    item.id !== excludeId
    && item.tenantCode.toLowerCase() === normalized
    && (item.status === 'trial' || item.status === 'active'),
  )
}

function toListItem(item: TenantRecord) {
  return {
    id: item.id,
    tenantCode: item.tenantCode,
    tenantName: item.tenantName,
    shortName: item.shortName,
    tenantType: item.tenantType,
    status: item.status,
    startedAt: item.startedAt,
    expiredAt: item.expiredAt,
    contactName: item.contactName,
    contactMobile: item.contactMobile,
    accountCount: item.accountCount,
    personCount: item.personCount,
    lastLoginAt: item.lastLoginAt,
    createdAt: item.createdAt,
    builtIn: item.builtIn,
  }
}

function toDetail(item: TenantRecord) {
  return {
    ...toListItem(item),
    contactEmail: item.contactEmail,
    creditCode: item.creditCode,
    industry: item.industry,
    regionCode: item.regionCode,
    address: item.address,
    remark: item.remark,
    createdBy: item.createdBy,
    updatedBy: item.updatedBy,
    updatedAt: item.updatedAt,
    deletedAt: item.deletedAt,
  }
}

function applyInfo(item: TenantRecord, payload: Recordable<any>) {
  item.tenantName = text(payload.tenantName)
  item.shortName = text(payload.shortName)
  item.tenantType = (text(payload.tenantType) || 'company') as TenantType
  item.contactName = text(payload.contactName)
  item.contactMobile = text(payload.contactMobile)
  item.contactEmail = text(payload.contactEmail)
  item.creditCode = text(payload.creditCode)
  item.industry = text(payload.industry)
  item.regionCode = text(payload.regionCode)
  item.address = text(payload.address)
  item.remark = text(payload.remark)
  item.updatedBy = 'admin'
  item.updatedAt = now()
}

function validateInfo(payload: Recordable<any>, requireCode: boolean) {
  const tenantName = text(payload.tenantName)
  if (tenantName.length < 2 || tenantName.length > 128) return '租户名称为 2-128 位'
  if (requireCode) {
    const tenantCode = text(payload.tenantCode)
    if (tenantCode.length < 2 || tenantCode.length > 64) return '租户编码为 2-64 位'
    if (!/^[A-Za-z0-9_-]+$/.test(tenantCode)) return '租户编码只能包含字母、数字、下划线和短横线'
  }
  const email = text(payload.contactEmail)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '邮箱格式不正确'
  return ''
}

function applyPeriod(item: TenantRecord, expiredOn: string, status: 'trial' | 'active') {
  item.startedAt = startOfToday()
  item.expiredAt = endOfDay(expiredOn)
  item.status = status
  item.updatedAt = now()
  item.updatedBy = 'admin'
}

function toImpact(item: TenantRecord) {
  return {
    accountCount: item.accountCount,
    deptCount: item.deptCount,
    postCount: item.postCount,
    positionCount: item.positionCount,
    personCount: item.personCount,
    roleCount: Math.max(0, item.roleCount - (item.builtIn ? 0 : 1)),
    selfMenuCount: item.selfMenuCount,
    lowcodePageCount: item.lowcodePageCount,
    reportCount: item.reportCount,
    processCount: item.processCount,
  }
}

function rejectBuiltIn(item: TenantRecord, action: string) {
  if (item.builtIn) return resultError(`内置租户不可${action}`)
  return null
}

export default [
  {
    url: mockUrl('/platform/tenants/page'),
    method: 'post',
    timeout: 60,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const keyword = text(payload.keyword).toLowerCase()
      const status = text(payload.status)
      const page = Math.max(1, Number(payload.page || 1))
      const pageSize = Math.max(1, Number(payload.pageSize || 10))
      const filtered = getTenantStore().filter((item) => {
        if (keyword) {
          const haystack = [item.tenantCode, item.tenantName, item.shortName, item.contactName]
            .join(' ')
            .toLowerCase()
          if (!haystack.includes(keyword)) return false
        }
        if (status && item.status !== status) return false
        if (!inDateRange(item.createdAt, text(payload.createdStartAt), text(payload.createdEndAt))) return false
        if (!inDateRange(item.expiredAt, text(payload.expiredStartAt), text(payload.expiredEndAt))) return false
        return true
      }).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      const start = (page - 1) * pageSize
      return resultSuccess({
        items: filtered.slice(start, start + pageSize).map(toListItem),
        total: filtered.length,
      })
    },
  },
  {
    url: mockUrl('/platform/tenants/options'),
    method: 'post',
    timeout: 40,
    response: () => resultSuccess(
      getTenantStore()
        .filter((item) => item.status !== 'deleted')
        .map((item) => ({
          id: item.id,
          tenantCode: item.tenantCode,
          tenantName: item.tenantName,
          status: item.status,
          builtIn: item.builtIn,
        })),
    ),
  },
  {
    url: mockUrl('/platform/tenant/detail'),
    method: 'post',
    timeout: 40,
    response: ({ body }) => {
      const item = findTenant(text((body as Recordable<any>)?.tenantId))
      if (!item) return resultError('租户不存在')
      return resultSuccess(toDetail(item))
    },
  },
  {
    url: mockUrl('/platform/tenant/create'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const error = validateInfo(payload, true)
      if (error) return resultError(error)
      const tenantCode = text(payload.tenantCode)
      const item: TenantRecord = {
        id: nextId(),
        tenantCode,
        tenantName: text(payload.tenantName),
        shortName: text(payload.shortName),
        tenantType: (text(payload.tenantType) || 'company') as TenantType,
        status: 'not_opened',
        startedAt: null,
        expiredAt: null,
        contactName: text(payload.contactName),
        contactMobile: text(payload.contactMobile),
        contactEmail: text(payload.contactEmail),
        creditCode: text(payload.creditCode),
        industry: text(payload.industry),
        regionCode: text(payload.regionCode),
        address: text(payload.address),
        remark: text(payload.remark),
        builtIn: false,
        lastLoginAt: null,
        createdBy: 'admin',
        updatedBy: 'admin',
        createdAt: now(),
        updatedAt: now(),
        deletedAt: null,
        accountCount: 0,
        personCount: 0,
        deptCount: 0,
        postCount: 0,
        positionCount: 0,
        roleCount: 1,
        selfMenuCount: 0,
        lowcodePageCount: 0,
        reportCount: 0,
        processCount: 0,
        menuIds: [],
        functionIds: [],
        grantedAt: null,
        grantedBy: '',
      }
      getTenantStore().unshift(item)
      return resultSuccess(toListItem(item), { message: '创建成功' })
    },
  },
  {
    url: mockUrl('/platform/tenant'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const item = findTenant(text(payload.tenantId))
      if (!item) return resultError('租户不存在')
      if (item.status === 'deleted') return resultError('已删除租户不可编辑')
      const error = validateInfo(payload, false)
      if (error) return resultError(error)
      applyInfo(item, payload)
      return resultSuccess(toListItem(item), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/platform/tenant/code'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const item = findTenant(text(payload.tenantId))
      if (!item) return resultError('租户不存在')
      const builtInError = rejectBuiltIn(item, '修改编码')
      if (builtInError) return builtInError
      const newCode = text(payload.newTenantCode)
      if (newCode !== text(payload.confirmTenantCode)) return resultError('确认编码必须等于新编码')
      if (newCode.length < 2 || newCode.length > 64) return resultError('租户编码为 2-64 位')
      if (!/^[A-Za-z0-9_-]+$/.test(newCode)) return resultError('租户编码只能包含字母、数字、下划线和短横线')
      if (!text(payload.reason)) return resultError('请填写修改原因')
      if (isActiveCodeTaken(newCode, item.id)) return resultError('新编码与当前试用中或已开通租户重复')
      item.tenantCode = newCode
      item.updatedAt = now()
      item.updatedBy = 'admin'
      return resultSuccess(toListItem(item), { message: '编码已修改' })
    },
  },
  {
    url: mockUrl('/platform/tenant/trial'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const item = findTenant(text(payload.tenantId))
      if (!item) return resultError('租户不存在')
      const builtInError = rejectBuiltIn(item, '试用')
      if (builtInError) return builtInError
      if (!['not_opened', 'expired', 'disabled'].includes(item.status)) {
        return resultError('当前状态不可试用')
      }
      const expiredOn = text(payload.expiredOn)
      if (!expiredOn) return resultError('请选择结束日期')
      if (expiredOn < todayDate()) return resultError('结束日期不能早于今天')
      if (!text(payload.reason)) return resultError('请填写原因')
      if (isActiveCodeTaken(item.tenantCode, item.id)) return resultError('租户编码与当前试用中或已开通租户重复')
      applyPeriod(item, expiredOn, 'trial')
      return resultSuccess(toListItem(item), { message: '已设为试用中' })
    },
  },
  {
    url: mockUrl('/platform/tenant/activate'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const item = findTenant(text(payload.tenantId))
      if (!item) return resultError('租户不存在')
      const builtInError = rejectBuiltIn(item, '开通')
      if (builtInError) return builtInError
      if (!['not_opened', 'trial', 'expired', 'disabled'].includes(item.status)) {
        return resultError('当前状态不可开通')
      }
      const expiredOn = text(payload.expiredOn)
      if (!expiredOn) return resultError('请选择结束日期')
      if (expiredOn < todayDate()) return resultError('结束日期不能早于今天')
      if (!text(payload.reason)) return resultError('请填写原因')
      if (isActiveCodeTaken(item.tenantCode, item.id)) return resultError('租户编码与当前试用中或已开通租户重复')
      applyPeriod(item, expiredOn, 'active')
      return resultSuccess(toListItem(item), { message: '已开通' })
    },
  },
  {
    url: mockUrl('/platform/tenant/disable'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const item = findTenant(text(payload.tenantId))
      if (!item) return resultError('租户不存在')
      const builtInError = rejectBuiltIn(item, '停用')
      if (builtInError) return builtInError
      if (!['trial', 'active'].includes(item.status)) return resultError('当前状态不可停用')
      if (!text(payload.reason)) return resultError('请填写原因')
      item.status = 'disabled'
      item.updatedAt = now()
      item.updatedBy = 'admin'
      return resultSuccess(toListItem(item), { message: '已停用' })
    },
  },
  {
    url: mockUrl('/platform/tenant/delete'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const item = findTenant(text(payload.tenantId))
      if (!item) return resultError('租户不存在')
      const builtInError = rejectBuiltIn(item, '删除')
      if (builtInError) return builtInError
      if (item.status === 'deleted') return resultError('租户已删除')
      if (text(payload.confirmTenantCode) !== item.tenantCode) return resultError('确认编码不正确')
      if (!text(payload.reason)) return resultError('请填写原因')
      item.status = 'deleted'
      item.deletedAt = now()
      item.updatedAt = now()
      item.updatedBy = 'admin'
      return resultSuccess(toListItem(item), { message: '已删除' })
    },
  },
  {
    url: mockUrl('/platform/tenant/clear-impact'),
    method: 'post',
    timeout: 40,
    response: ({ body }) => {
      const item = findTenant(text((body as Recordable<any>)?.tenantId))
      if (!item) return resultError('租户不存在')
      const builtInError = rejectBuiltIn(item, '清空')
      if (builtInError) return builtInError
      return resultSuccess(toImpact(item))
    },
  },
  {
    url: mockUrl('/platform/tenant/clear-data'),
    method: 'post',
    timeout: 120,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const item = findTenant(text(payload.tenantId))
      if (!item) return resultError('租户不存在')
      const builtInError = rejectBuiltIn(item, '清空')
      if (builtInError) return builtInError
      if (text(payload.confirmTenantCode) !== item.tenantCode) return resultError('确认编码不正确')
      if (!text(payload.reason)) return resultError('请填写原因')
      clearTenantAccounts(item.id)
      item.accountCount = 0
      item.personCount = 0
      item.deptCount = 0
      item.postCount = 0
      item.positionCount = 0
      item.roleCount = 1
      item.selfMenuCount = 0
      item.lowcodePageCount = 0
      item.reportCount = 0
      item.processCount = 0
      item.lastLoginAt = null
      item.updatedAt = now()
      item.updatedBy = 'admin'
      return resultSuccess({ tenantId: item.id }, { message: '已清空' })
    },
  },
  {
    url: mockUrl('/platform/tenant/grant/detail'),
    method: 'post',
    timeout: 40,
    response: ({ body }) => {
      const item = findTenant(text((body as Recordable<any>)?.tenantId))
      if (!item) return resultError('租户不存在')
      const builtInError = rejectBuiltIn(item, '授权')
      if (builtInError) return builtInError
      return resultSuccess({
        tenantId: item.id,
        tenantName: item.tenantName,
        tenantCode: item.tenantCode,
        grantedAt: item.grantedAt,
        grantedBy: item.grantedBy,
        tree: GRANT_TREE,
        menuIds: [...item.menuIds],
        functionIds: [...item.functionIds],
      })
    },
  },
  {
    url: mockUrl('/platform/tenant/grant'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const item = findTenant(text(payload.tenantId))
      if (!item) return resultError('租户不存在')
      const builtInError = rejectBuiltIn(item, '授权')
      if (builtInError) return builtInError
      item.menuIds = Array.isArray(payload.menuIds) ? payload.menuIds.map(String) : []
      item.functionIds = Array.isArray(payload.functionIds) ? payload.functionIds.map(String) : []
      item.grantedAt = now()
      item.grantedBy = 'admin'
      item.updatedAt = now()
      return resultSuccess({
        tenantId: item.id,
        tenantName: item.tenantName,
        tenantCode: item.tenantCode,
        grantedAt: item.grantedAt,
        grantedBy: item.grantedBy,
        tree: GRANT_TREE,
        menuIds: [...item.menuIds],
        functionIds: [...item.functionIds],
      }, { message: '授权已保存' })
    },
  },
] as MockMethod[]
