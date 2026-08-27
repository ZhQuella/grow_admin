import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import { MenuTypeEnum } from '@grow-admin-rock/constants'
import { buildBackMenuList } from './buildMenuList'

type MenuNode = {
  name: string
  title: string
  path: string
  componentKey?: string
  icon?: string
  menuType: string
  isVisible: boolean
  isKeepAlive?: boolean
  affix?: boolean
  defaultShow?: boolean
  sort?: number
  isExternalPage?: boolean
  openMode?: string
  link?: string
  children?: MenuNode[]
}

let menuStore: MenuNode[] | null = null

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function ensureMenuComponentKey(node: MenuNode): MenuNode {
  if (node.menuType === MenuTypeEnum.MENU && !node.componentKey) {
    node.componentKey = node.name
  }
  node.children?.forEach(ensureMenuComponentKey)
  return node
}

function indexByName(nodes: MenuNode[], map = new Map<string, MenuNode>()) {
  for (const node of nodes) {
    map.set(node.name, node)
    if (node.children?.length) {
      indexByName(node.children, map)
    }
  }
  return map
}

function syncSourceMeta(store: MenuNode[], source: MenuNode[]) {
  const sourceMap = indexByName(source)
  const apply = (nodes: MenuNode[]) => {
    for (const node of nodes) {
      const src = sourceMap.get(node.name)
      if (src) {
        node.title = src.title
        node.sort = src.sort
        node.icon = src.icon
      }
      if (node.children?.length) {
        apply(node.children)
      }
    }
  }
  apply(store)
}

function syncMissingChildren(store: MenuNode[], source: MenuNode[]) {
  const storeMap = indexByName(store)
  const insertMissing = (sourceNodes: MenuNode[], storeSiblings: MenuNode[]) => {
    for (const src of sourceNodes) {
      if (!storeMap.has(src.name)) {
        const cloned = clone(src)
        storeSiblings.push(cloned)
        indexByName([cloned], storeMap)
        continue
      }
      const current = storeMap.get(src.name)
      if (src.children?.length && current) {
        current.children = current.children || []
        insertMissing(src.children, current.children)
      }
    }
  }
  insertMissing(source, store)
}

function getStore(): MenuNode[] {
  const source = clone(buildBackMenuList() as MenuNode[])
  if (!menuStore) {
    menuStore = source
  } else {
    syncSourceMeta(menuStore, source)
    syncMissingChildren(menuStore, source)
  }
  menuStore.forEach(ensureMenuComponentKey)
  return menuStore
}

function walk(
  nodes: MenuNode[],
  visitor: (node: MenuNode, parent: MenuNode | null, index: number, siblings: MenuNode[]) => boolean,
  parent: MenuNode | null = null,
): boolean {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]
    if (visitor(node, parent, index, nodes)) {
      return true
    }
    if (node.children?.length && walk(node.children, visitor, node)) {
      return true
    }
  }
  return false
}

function findNode(name: string) {
  let found: { node: MenuNode, parent: MenuNode | null, index: number, siblings: MenuNode[] } | null = null
  walk(getStore(), (node, parent, index, siblings) => {
    if (node.name === name) {
      found = { node, parent, index, siblings }
      return true
    }
    return false
  })
  return found
}

function nameExists(name: string) {
  return Boolean(findNode(name))
}

function collectMenuNames(node: MenuNode): string[] {
  return [node.name, ...(node.children?.flatMap(collectMenuNames) ?? [])]
}

const FUNCTION_CODE_PATTERN = /^[A-Za-z0-9:_]+$/
const COLUMN_TYPES = new Set(['string', 'number', 'person', 'dept', 'select', 'date', 'boolean', 'cascade'])

type MenuFunction = {
  id: string
  menuName: string
  title: string
  code: string
  sort: number
  enabled: boolean
}

const functionStore = new Map<string, MenuFunction>()

function nextFunctionId() {
  return `mf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function listFunctionsByMenu(menuName: string) {
  return [...functionStore.values()]
    .filter((item) => item.menuName === menuName)
    .sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title, 'zh-CN'))
}

function pickFunctionItem(payload: Recordable<any>, usedCodes: Set<string>) {
  const title = String(payload.title || '').trim()
  const code = String(payload.code || '').trim()
  const sort = Number(payload.sort ?? 0)
  const enabled = payload.enabled !== false

  if (!title) return '请填写名称'
  if (!code) return '请填写标识'
  if (!FUNCTION_CODE_PATTERN.test(code)) {
    return '标识仅允许大小写字母、数字、冒号和下划线'
  }
  if (usedCodes.has(code)) {
    return '标识在当前菜单下已存在'
  }

  return { title, code, sort, enabled }
}

function replaceFunctions(menuName: string, items: Recordable<any>[]) {
  const usedCodes = new Set<string>()
  const next: MenuFunction[] = []

  for (const payload of items) {
    const fields = pickFunctionItem(payload, usedCodes)
    if (typeof fields === 'string') return fields
    usedCodes.add(fields.code)
    const id = String(payload.id || '').trim() || nextFunctionId()
    next.push({ id, menuName, ...fields })
  }

  removeFunctionsByMenuNames([menuName])
  next.forEach((item) => functionStore.set(item.id, item))
  return listFunctionsByMenu(menuName)
}

function removeFunctionsByMenuNames(menuNames: string[]) {
  const names = new Set(menuNames)
  for (const [id, item] of functionStore) {
    if (names.has(item.menuName)) {
      functionStore.delete(id)
    }
  }
}

function listAllFunctions() {
  return [...functionStore.values()].sort(
    (a, b) => a.menuName.localeCompare(b.menuName) || a.sort - b.sort || a.title.localeCompare(b.title, 'zh-CN'),
  )
}

function seedFunctions() {
  const seeds: MenuFunction[] = [
    { id: 'mf_query', menuName: 'MenuManage', title: '查询', code: 'query', sort: 10, enabled: true },
    { id: 'mf_export', menuName: 'MenuManage', title: '导出', code: 'export', sort: 20, enabled: true },
    { id: 'pf_query', menuName: 'PersonManage', title: '查询', code: 'query', sort: 10, enabled: true },
    { id: 'pf_create', menuName: 'PersonManage', title: '新增', code: 'create', sort: 20, enabled: true },
    { id: 'pf_transfer', menuName: 'PersonManage', title: '调岗', code: 'transfer', sort: 30, enabled: true },
    { id: 'pf_resign', menuName: 'PersonManage', title: '离职', code: 'resign', sort: 40, enabled: true },
    { id: 'af_query', menuName: 'AccountManage', title: '查询', code: 'query', sort: 10, enabled: true },
    { id: 'af_create', menuName: 'AccountManage', title: '新增', code: 'create', sort: 20, enabled: true },
    { id: 'af_reset', menuName: 'AccountManage', title: '重置密码', code: 'reset', sort: 30, enabled: true },
  ]
  for (const item of seeds) {
    if (!functionStore.has(item.id)) {
      functionStore.set(item.id, item)
    }
  }
}

seedFunctions()

type MenuTable = {
  menuName: string
  code: string
  title: string
}

type MenuColumn = {
  id: string
  menuName: string
  tableCode: string
  title: string
  code: string
  columnType: string
  enabled: boolean
}

const tableStore = new Map<string, MenuTable>()
const columnStore = new Map<string, MenuColumn>()

function tableKey(menuName: string, code: string) {
  return `${menuName}::${code}`
}

function nextColumnId() {
  return `mc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function withTableMeta(item: MenuColumn) {
  const table = tableStore.get(tableKey(item.menuName, item.tableCode))
  return {
    ...item,
    tableTitle: table?.title || item.tableCode,
  }
}

function listTablesByMenu(menuName: string) {
  return [...tableStore.values()].filter((item) => item.menuName === menuName)
}

function listColumnsByMenu(menuName: string) {
  return [...columnStore.values()]
    .filter((item) => item.menuName === menuName)
    .map(withTableMeta)
}

function listColumnBundle(menuName: string) {
  return {
    tables: listTablesByMenu(menuName),
    items: listColumnsByMenu(menuName),
  }
}

function pickTableItem(
  payload: Recordable<any>,
  usedCodes: Set<string>,
): MenuTable | string {
  const title = String(payload.title || '').trim()
  const code = String(payload.code || '').trim()

  if (!title) return '请填写表名称'
  if (!code) return '请填写表标识'
  if (!FUNCTION_CODE_PATTERN.test(code)) {
    return '表标识仅允许大小写字母、数字、冒号和下划线'
  }
  if (usedCodes.has(code)) return '表标识在当前菜单下已存在'
  usedCodes.add(code)
  return { menuName: '', code, title }
}

function pickColumnItem(
  payload: Recordable<any>,
  tableCode: string,
  usedCodes: Set<string>,
) {
  const title = String(payload.title || '').trim()
  const code = String(payload.code || '').trim()
  const enabled = payload.enabled !== false
  const columnType = COLUMN_TYPES.has(String(payload.columnType || '').trim())
    ? String(payload.columnType).trim()
    : 'string'
  const key = `${tableCode}::${code}`

  if (!title) return '请填写列名称'
  if (!code) return '请填写列标识'
  if (!FUNCTION_CODE_PATTERN.test(code)) {
    return '列标识仅允许大小写字母、数字、冒号和下划线'
  }
  if (usedCodes.has(key)) {
    return `标识「${code}」在表「${tableCode}」下已存在`
  }
  usedCodes.add(key)

  return { title, code, columnType, enabled, tableCode }
}

function replaceColumnBundle(menuName: string, payload: Recordable<any>) {
  const rawTables = Array.isArray(payload.tables) ? payload.tables : []
  const rawItems = Array.isArray(payload.items) ? payload.items : []
  const usedTableCodes = new Set<string>()
  const tables: MenuTable[] = []

  for (const raw of rawTables) {
    const fields = pickTableItem(raw, usedTableCodes)
    if (typeof fields === 'string') return fields
    tables.push({ ...fields, menuName })
  }

  const usedColumnCodes = new Set<string>()
  const columns: MenuColumn[] = []
  for (const raw of rawItems) {
    const tableCode = String(raw.tableCode || '').trim()
    if (!tableCode || !usedTableCodes.has(tableCode)) {
      return '列必须属于已保存的数据表'
    }
    const fields = pickColumnItem(raw, tableCode, usedColumnCodes)
    if (typeof fields === 'string') return fields
    const id = String(raw.id || '').trim() || nextColumnId()
    columns.push({ id, menuName, ...fields })
  }

  removeColumnsByMenuNames([menuName])
  tables.forEach((item) => tableStore.set(tableKey(item.menuName, item.code), item))
  columns.forEach((item) => columnStore.set(item.id, item))
  return listColumnBundle(menuName)
}

function removeColumnsByMenuNames(menuNames: string[]) {
  const names = new Set(menuNames)
  for (const [id, item] of columnStore) {
    if (names.has(item.menuName)) columnStore.delete(id)
  }
  for (const [id, item] of tableStore) {
    if (names.has(item.menuName)) tableStore.delete(id)
  }
}

function listAllColumns() {
  return [...columnStore.values()]
    .map(withTableMeta)
    .sort((a, b) => (
      a.menuName.localeCompare(b.menuName)
      || a.tableCode.localeCompare(b.tableCode)
      || a.title.localeCompare(b.title, 'zh-CN')
      || a.code.localeCompare(b.code)
    ))
}

function seedColumns() {
  const tables: MenuTable[] = [
    { menuName: 'MenuManage', code: 'menu_list', title: '菜单列表' },
    { menuName: 'RoleManage', code: 'role_list', title: '角色列表' },
    { menuName: 'RoleManage', code: 'member_list', title: '绑定账号' },
    { menuName: 'PersonManage', code: 'person_list', title: '人员列表' },
    { menuName: 'AccountManage', code: 'account_list', title: '账号列表' },
  ]
  const seeds: MenuColumn[] = [
    { id: 'mc_title', menuName: 'MenuManage', tableCode: 'menu_list', title: '标题', code: 'title', columnType: 'string', enabled: true },
    { id: 'mc_name', menuName: 'MenuManage', tableCode: 'menu_list', title: '标识', code: 'name', columnType: 'string', enabled: true },
    { id: 'mc_path', menuName: 'MenuManage', tableCode: 'menu_list', title: '路径', code: 'path', columnType: 'string', enabled: true },
    { id: 'mc_type', menuName: 'MenuManage', tableCode: 'menu_list', title: '类型', code: 'menuType', columnType: 'select', enabled: true },
    { id: 'mc_sort', menuName: 'MenuManage', tableCode: 'menu_list', title: '排序', code: 'sort', columnType: 'number', enabled: true },
    { id: 'rc_name', menuName: 'RoleManage', tableCode: 'role_list', title: '名称', code: 'name', columnType: 'string', enabled: true },
    { id: 'rc_code', menuName: 'RoleManage', tableCode: 'role_list', title: '编码', code: 'code', columnType: 'string', enabled: true },
    { id: 'rc_scope', menuName: 'RoleManage', tableCode: 'role_list', title: '数据权限', code: 'dataScope', columnType: 'select', enabled: true },
    { id: 'rc_member', menuName: 'RoleManage', tableCode: 'role_list', title: '账号', code: 'memberCount', columnType: 'number', enabled: true },
    { id: 'rc_enabled', menuName: 'RoleManage', tableCode: 'role_list', title: '启用', code: 'enabled', columnType: 'boolean', enabled: true },
    { id: 'rm_name', menuName: 'RoleManage', tableCode: 'member_list', title: '登录名', code: 'username', columnType: 'string', enabled: true },
    { id: 'rm_person', menuName: 'RoleManage', tableCode: 'member_list', title: '绑定人员', code: 'name', columnType: 'person', enabled: true },
    { id: 'rm_post', menuName: 'RoleManage', tableCode: 'member_list', title: '岗位', code: 'post', columnType: 'string', enabled: true },
    { id: 'rm_dept', menuName: 'RoleManage', tableCode: 'member_list', title: '部门', code: 'deptName', columnType: 'dept', enabled: true },
    { id: 'pc_name', menuName: 'PersonManage', tableCode: 'person_list', title: '姓名', code: 'name', columnType: 'person', enabled: true },
    { id: 'pc_no', menuName: 'PersonManage', tableCode: 'person_list', title: '工号', code: 'employeeNo', columnType: 'string', enabled: true },
    { id: 'pc_dept', menuName: 'PersonManage', tableCode: 'person_list', title: '部门', code: 'deptName', columnType: 'dept', enabled: true },
    { id: 'pc_post', menuName: 'PersonManage', tableCode: 'person_list', title: '岗位', code: 'post', columnType: 'string', enabled: true },
    { id: 'pc_status', menuName: 'PersonManage', tableCode: 'person_list', title: '员工状态', code: 'employeeStatus', columnType: 'select', enabled: true },
    { id: 'pc_mobile', menuName: 'PersonManage', tableCode: 'person_list', title: '手机号', code: 'mobile', columnType: 'string', enabled: true },
    { id: 'ac_username', menuName: 'AccountManage', tableCode: 'account_list', title: '登录名', code: 'username', columnType: 'string', enabled: true },
    { id: 'ac_person', menuName: 'AccountManage', tableCode: 'account_list', title: '绑定人员', code: 'personName', columnType: 'person', enabled: true },
    { id: 'ac_dept', menuName: 'AccountManage', tableCode: 'account_list', title: '部门', code: 'deptName', columnType: 'dept', enabled: true },
    { id: 'ac_enabled', menuName: 'AccountManage', tableCode: 'account_list', title: '启用', code: 'enabled', columnType: 'boolean', enabled: true },
    { id: 'ac_login', menuName: 'AccountManage', tableCode: 'account_list', title: '最近登录', code: 'lastLoginAt', columnType: 'date', enabled: true },
  ]
  for (const item of tables) {
    tableStore.set(tableKey(item.menuName, item.code), item)
  }
  for (const item of seeds) {
    if (!columnStore.has(item.id)) columnStore.set(item.id, item)
  }
}

seedColumns()

function normalizeNode(node: MenuNode): MenuNode {
  const next: MenuNode = { ...node }
  if (next.menuType === MenuTypeEnum.MENU && !next.componentKey) {
    next.componentKey = next.name
  }
  if (next.children?.length) {
    next.children = next.children.map(normalizeNode)
  } else {
    delete next.children
  }
  return next
}

function pickNodeFields(payload: Recordable<any>, name: string): MenuNode | string {
  const title = String(payload.title || '').trim()
  const path = String(payload.path || '').trim()
  const menuType = String(payload.menuType || '').trim()
  const componentKey = String(payload.componentKey || '').trim()

  if (!title) return '请填写标题'
  if (!path) return '请填写路径'
  if (menuType !== MenuTypeEnum.DIRECTORY && menuType !== MenuTypeEnum.MENU) {
    return '请选择类型'
  }
  if (menuType === MenuTypeEnum.MENU && !componentKey) {
    return '菜单类型请填写组件标识'
  }

  const node: MenuNode = {
    name,
    title,
    path,
    menuType,
    isVisible: payload.isVisible !== false,
    isKeepAlive: Boolean(payload.isKeepAlive),
    affix: Boolean(payload.affix),
    defaultShow: Boolean(payload.defaultShow),
    sort: Number(payload.sort ?? 0),
    isExternalPage: Boolean(payload.isExternalPage),
  }

  if (componentKey) node.componentKey = componentKey
  if (payload.icon) node.icon = String(payload.icon).trim()
  if (payload.openMode) node.openMode = String(payload.openMode)
  if (payload.link) node.link = String(payload.link).trim()

  return node
}

const mocks: MockMethod[] = [
  {
    url: mockUrl('/system/menus/tree'),
    method: 'post',
    timeout: 80,
    response: () => resultSuccess(clone(getStore()).map(normalizeNode)),
  },
  {
    url: mockUrl('/system/menus'),
    method: 'post',
    timeout: 100,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const name = String(payload.name || '').trim()
      if (!name) return resultError('请填写标识')
      if (nameExists(name)) return resultError('标识已存在')

      const nodeOrError = pickNodeFields(payload, name)
      if (typeof nodeOrError === 'string') return resultError(nodeOrError)

      const parentName = String(payload.parentName || '').trim()
      if (!parentName) {
        getStore().push(nodeOrError)
        return resultSuccess(normalizeNode(nodeOrError), { message: '创建成功' })
      }

      const parent = findNode(parentName)
      if (!parent) return resultError('挂载位置不存在')
      if (!parent.node.children) parent.node.children = []
      parent.node.children.push(nodeOrError)
      return resultSuccess(normalizeNode(nodeOrError), { message: '创建成功' })
    },
  },
  {
    url: mockUrl('/system/menu'),
    method: 'put',
    timeout: 100,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const name = String(payload.name || '').trim()
      const found = findNode(name)
      if (!found) return resultError('菜单不存在')

      const nodeOrError = pickNodeFields(payload, name)
      if (typeof nodeOrError === 'string') return resultError(nodeOrError)

      const parentName = String(payload.parentName || '').trim()
      const currentParentName = found.parent?.name || ''

      function isDescendant(node: MenuNode, targetName: string): boolean {
        return Boolean(node.children?.some(
          (child) => child.name === targetName || isDescendant(child, targetName),
        ))
      }

      if (parentName === name || isDescendant(found.node, parentName)) {
        return resultError('不能挂载到自身或子级')
      }

      const children = found.node.children
      const next = { ...nodeOrError }
      if (children?.length) {
        next.children = children
      }

      if (parentName === currentParentName) {
        found.siblings[found.index] = next
        return resultSuccess(normalizeNode(next), { message: '保存成功' })
      }

      found.siblings.splice(found.index, 1)
      if (!parentName) {
        getStore().push(next)
      } else {
        const parent = findNode(parentName)
        if (!parent) return resultError('挂载位置不存在')
        if (!parent.node.children) parent.node.children = []
        parent.node.children.push(next)
      }
      return resultSuccess(normalizeNode(next), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/system/menu/delete'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const name = String((body as Recordable<any>)?.name || '').trim()
      const found = findNode(name)
      if (!found) return resultError('菜单不存在')
      const menuNames = collectMenuNames(found.node)
      found.siblings.splice(found.index, 1)
      removeFunctionsByMenuNames(menuNames)
      removeColumnsByMenuNames(menuNames)
      return resultSuccess({ name }, { message: '删除成功' })
    },
  },
  {
    url: mockUrl('/system/menu/functions'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const menuName = String((body as Recordable<any>)?.menuName || '').trim()
      if (!menuName) return resultError('缺少菜单标识')
      return resultSuccess(listFunctionsByMenu(menuName))
    },
  },
  {
    url: mockUrl('/system/menu/functions'),
    method: 'put',
    timeout: 100,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const menuName = String(payload.menuName || '').trim()
      if (!menuName) return resultError('缺少菜单标识')

      const items = Array.isArray(payload.items) ? payload.items : []
      const result = replaceFunctions(menuName, items)
      if (typeof result === 'string') return resultError(result)
      return resultSuccess(result, { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/system/menu-functions/all'),
    method: 'post',
    timeout: 80,
    response: () => resultSuccess(listAllFunctions()),
  },
  {
    url: mockUrl('/system/menu/columns'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const menuName = String((body as Recordable<any>)?.menuName || '').trim()
      if (!menuName) return resultError('缺少菜单标识')
      return resultSuccess(listColumnBundle(menuName))
    },
  },
  {
    url: mockUrl('/system/menu/columns'),
    method: 'put',
    timeout: 100,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const menuName = String(payload.menuName || '').trim()
      if (!menuName) return resultError('缺少菜单标识')

      const result = replaceColumnBundle(menuName, payload)
      if (typeof result === 'string') return resultError(result)
      return resultSuccess(result, { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/system/menu-columns/all'),
    method: 'post',
    timeout: 80,
    response: () => resultSuccess(listAllColumns()),
  },
]

export default mocks
