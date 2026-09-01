import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import { MenuTypeEnum } from '@grow-admin-rock/constants'
import { buildBackMenuList } from './buildMenuList'
import {
  countRoleColumnPermissions,
  countRoleDataPermissions,
  countRoleFunctionGrants,
  countRoleMenuGrants,
  countRoleQueryReferences,
  removeRoleColumnReferences,
  removeRoleFunctionReferences,
  removeRoleMenuReferences,
  renameRoleMenuReferences,
} from './systemRole'

type MenuNode = {
  name: string
  title: string
  path: string
  componentKey?: string
  icon?: string
  menuType: string
  enabled: boolean
  description?: string
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
  if (node.enabled == null) node.enabled = true
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

type MenuLocation = {
  node: MenuNode
  parent: MenuNode | null
  index: number
  siblings: MenuNode[]
}

function findNode(name: string): MenuLocation | null {
  const search = (nodes: MenuNode[], parent: MenuNode | null): MenuLocation | null => {
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index]
      if (node.name === name) return { node, parent, index, siblings: nodes }
      if (node.children?.length) {
        const found = search(node.children, node)
        if (found) return found
      }
    }
    return null
  }
  return search(getStore(), null)
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
  group: string
  description: string
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
  const group = String(payload.group || '').trim()
  const description = String(payload.description || '').trim()

  if (!title) return '请填写名称'
  if (!code) return '请填写标识'
  if (!FUNCTION_CODE_PATTERN.test(code)) {
    return '标识仅允许大小写字母、数字、冒号和下划线'
  }
  if (usedCodes.has(code)) {
    return '标识在当前菜单下已存在'
  }

  return { title, code, group, description, sort, enabled }
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

  const previousIds = listFunctionsByMenu(menuName).map((item) => item.id)
  const nextIds = new Set(next.map((item) => item.id))
  removeRoleFunctionReferences(previousIds.filter((id) => !nextIds.has(id)))
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

function functionIdsByMenuNames(menuNames: string[]) {
  const names = new Set(menuNames)
  return [...functionStore.values()]
    .filter((item) => names.has(item.menuName))
    .map((item) => item.id)
}

function listAllFunctions() {
  return [...functionStore.values()].sort(
    (a, b) => a.menuName.localeCompare(b.menuName) || a.sort - b.sort || a.title.localeCompare(b.title, 'zh-CN'),
  )
}

function seedFunctions() {
  const seeds: MenuFunction[] = [
    { id: 'mf_query', menuName: 'MenuManage', title: '查询', code: 'query', group: '基础操作', description: '', sort: 10, enabled: true },
    { id: 'mf_export', menuName: 'MenuManage', title: '导出', code: 'export', group: '数据操作', description: '', sort: 20, enabled: true },
    { id: 'pf_query', menuName: 'PersonManage', title: '查询', code: 'query', group: '基础操作', description: '', sort: 10, enabled: true },
    { id: 'pf_create', menuName: 'PersonManage', title: '新增', code: 'create', group: '基础操作', description: '', sort: 20, enabled: true },
    { id: 'pf_transfer', menuName: 'PersonManage', title: '调岗', code: 'transfer', group: '人员生命周期', description: '', sort: 30, enabled: true },
    { id: 'pf_resign', menuName: 'PersonManage', title: '离职', code: 'resign', group: '人员生命周期', description: '', sort: 40, enabled: true },
    { id: 'af_query', menuName: 'AccountManage', title: '查询', code: 'query', group: '基础操作', description: '', sort: 10, enabled: true },
    { id: 'af_create', menuName: 'AccountManage', title: '新增', code: 'create', group: '基础操作', description: '', sort: 20, enabled: true },
    { id: 'af_reset', menuName: 'AccountManage', title: '重置密码', code: 'reset', group: '安全操作', description: '', sort: 30, enabled: true },
    { id: 'df_query', menuName: 'DeptManage', title: '查询', code: 'query', group: '基础操作', description: '', sort: 10, enabled: true },
    { id: 'df_create', menuName: 'DeptManage', title: '新增', code: 'create', group: '基础操作', description: '', sort: 20, enabled: true },
    { id: 'df_edit', menuName: 'DeptManage', title: '编辑', code: 'edit', group: '基础操作', description: '', sort: 30, enabled: true },
    { id: 'df_stop', menuName: 'DeptManage', title: '停用/启用', code: 'status', group: '组织调整', description: '', sort: 40, enabled: true },
    { id: 'df_migrate', menuName: 'DeptManage', title: '迁移', code: 'migrate', group: '组织调整', description: '', sort: 50, enabled: true },
    { id: 'df_merge', menuName: 'DeptManage', title: '合并', code: 'merge', group: '组织调整', description: '', sort: 60, enabled: true },
    { id: 'df_delete', menuName: 'DeptManage', title: '删除', code: 'delete', group: '高风险操作', description: '', sort: 70, enabled: true },
    { id: 'post_query', menuName: 'PostManage', title: '查询', code: 'query', group: '基础操作', description: '', sort: 10, enabled: true },
    { id: 'post_create', menuName: 'PostManage', title: '新增', code: 'create', group: '基础操作', description: '', sort: 20, enabled: true },
    { id: 'post_edit', menuName: 'PostManage', title: '编辑', code: 'edit', group: '基础操作', description: '', sort: 30, enabled: true },
    { id: 'post_status', menuName: 'PostManage', title: '启用/停用', code: 'status', group: '基础操作', description: '', sort: 40, enabled: true },
    { id: 'pos_query', menuName: 'PositionManage', title: '查询', code: 'query', group: '基础操作', description: '', sort: 10, enabled: true },
    { id: 'pos_create', menuName: 'PositionManage', title: '新增', code: 'create', group: '基础操作', description: '', sort: 20, enabled: true },
    { id: 'pos_edit', menuName: 'PositionManage', title: '编辑', code: 'edit', group: '基础操作', description: '', sort: 30, enabled: true },
    { id: 'pos_status', menuName: 'PositionManage', title: '启用/停用', code: 'status', group: '基础操作', description: '', sort: 40, enabled: true },
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
  description: string
  sort: number
}

type MenuColumn = {
  id: string
  menuName: string
  tableCode: string
  title: string
  code: string
  columnType: string
  enabled: boolean
  columnPermission: boolean
  formFill: boolean
  queryFilter: boolean
  sort: number
  description: string
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
  return [...tableStore.values()]
    .filter((item) => item.menuName === menuName)
    .sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title, 'zh-CN'))
}

function listColumnsByMenu(menuName: string) {
  return [...columnStore.values()]
    .filter((item) => item.menuName === menuName)
    .sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title, 'zh-CN'))
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
  const description = String(payload.description || '').trim()
  const sort = Number(payload.sort ?? 0)

  if (!title) return '请填写表名称'
  if (!code) return '请填写表标识'
  if (!FUNCTION_CODE_PATTERN.test(code)) {
    return '表标识仅允许大小写字母、数字、冒号和下划线'
  }
  if (usedCodes.has(code)) return '表标识在当前菜单下已存在'
  usedCodes.add(code)
  return { menuName: '', code, title, description, sort }
}

function pickColumnItem(
  payload: Recordable<any>,
  tableCode: string,
  usedCodes: Set<string>,
) {
  const title = String(payload.title || '').trim()
  const code = String(payload.code || '').trim()
  const enabled = payload.enabled !== false
  const columnPermission = payload.columnPermission !== false
  const formFill = payload.formFill !== false
  const queryFilter = payload.queryFilter !== false
  const sort = Number(payload.sort ?? 0)
  const description = String(payload.description || '').trim()
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

  return {
    title,
    code,
    columnType,
    enabled,
    columnPermission,
    formFill,
    queryFilter,
    sort,
    description,
    tableCode,
  }
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

  const previousIds = listColumnsByMenu(menuName).map((item) => item.id)
  const nextIds = new Set(columns.map((item) => item.id))
  removeRoleColumnReferences(previousIds.filter((id) => !nextIds.has(id)))
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

function columnsByMenuNames(menuNames: string[]) {
  const names = new Set(menuNames)
  return [...columnStore.values()].filter((item) => names.has(item.menuName))
}

function renameMenuResources(from: string, to: string) {
  if (from === to) return

  for (const item of functionStore.values()) {
    if (item.menuName === from) item.menuName = to
  }
  for (const item of columnStore.values()) {
    if (item.menuName === from) item.menuName = to
  }

  const tables = [...tableStore.values()]
  tableStore.clear()
  for (const item of tables) {
    if (item.menuName === from) item.menuName = to
    tableStore.set(tableKey(item.menuName, item.code), item)
  }
  renameRoleMenuReferences(from, to)
}

function columnReferenceImpact(columnIds: string[]) {
  return {
    columnPermissionCount: countRoleColumnPermissions(columnIds),
    formConfigCount: 0,
    queryConditionCount: countRoleQueryReferences(columnIds),
  }
}

function listAllColumns() {
  return [...columnStore.values()]
    .map(withTableMeta)
    .sort((a, b) => (
      a.menuName.localeCompare(b.menuName)
      || a.tableCode.localeCompare(b.tableCode)
      || a.sort - b.sort
      || a.title.localeCompare(b.title, 'zh-CN')
      || a.code.localeCompare(b.code)
    ))
}

function seedColumns() {
  const tables: MenuTable[] = [
    { menuName: 'MenuManage', code: 'menu_list', title: '菜单列表', description: '', sort: 10 },
    { menuName: 'RoleManage', code: 'role_list', title: '角色列表', description: '', sort: 10 },
    { menuName: 'RoleManage', code: 'member_list', title: '绑定账号', description: '', sort: 20 },
    { menuName: 'PersonManage', code: 'person_list', title: '人员列表', description: '', sort: 10 },
    { menuName: 'AccountManage', code: 'account_list', title: '账号列表', description: '', sort: 10 },
    { menuName: 'DeptManage', code: 'dept_detail', title: '部门详情', description: '', sort: 10 },
    { menuName: 'PostManage', code: 'post_list', title: '岗位列表', description: '', sort: 10 },
    { menuName: 'PositionManage', code: 'position_list', title: '职级列表', description: '', sort: 10 },
  ]
  const legacySeeds: Array<Omit<MenuColumn, 'columnPermission' | 'formFill' | 'queryFilter' | 'sort' | 'description'>> = [
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
    { id: 'dc_name', menuName: 'DeptManage', tableCode: 'dept_detail', title: '部门名称', code: 'name', columnType: 'string', enabled: true },
    { id: 'dc_code', menuName: 'DeptManage', tableCode: 'dept_detail', title: '部门编码', code: 'code', columnType: 'string', enabled: true },
    { id: 'dc_parent', menuName: 'DeptManage', tableCode: 'dept_detail', title: '上级部门', code: 'parentId', columnType: 'dept', enabled: true },
    { id: 'dc_manager', menuName: 'DeptManage', tableCode: 'dept_detail', title: '部门负责人', code: 'managerId', columnType: 'person', enabled: true },
    { id: 'dc_sort', menuName: 'DeptManage', tableCode: 'dept_detail', title: '排序号', code: 'sort', columnType: 'number', enabled: true },
    { id: 'dc_status', menuName: 'DeptManage', tableCode: 'dept_detail', title: '状态', code: 'status', columnType: 'select', enabled: true },
    { id: 'postc_name', menuName: 'PostManage', tableCode: 'post_list', title: '岗位名称', code: 'name', columnType: 'string', enabled: true },
    { id: 'postc_code', menuName: 'PostManage', tableCode: 'post_list', title: '岗位编码', code: 'code', columnType: 'string', enabled: true },
    { id: 'postc_dept', menuName: 'PostManage', tableCode: 'post_list', title: '所属部门', code: 'deptName', columnType: 'dept', enabled: true },
    { id: 'postc_enabled', menuName: 'PostManage', tableCode: 'post_list', title: '状态', code: 'enabled', columnType: 'boolean', enabled: true },
    { id: 'posc_name', menuName: 'PositionManage', tableCode: 'position_list', title: '名称', code: 'name', columnType: 'string', enabled: true },
    { id: 'posc_code', menuName: 'PositionManage', tableCode: 'position_list', title: '编码', code: 'code', columnType: 'string', enabled: true },
    { id: 'posc_level', menuName: 'PositionManage', tableCode: 'position_list', title: '层级', code: 'level', columnType: 'number', enabled: true },
    { id: 'posc_enabled', menuName: 'PositionManage', tableCode: 'position_list', title: '状态', code: 'enabled', columnType: 'boolean', enabled: true },
  ]
  for (const item of tables) {
    tableStore.set(tableKey(item.menuName, item.code), item)
  }
  for (const [index, item] of legacySeeds.entries()) {
    if (!columnStore.has(item.id)) {
      columnStore.set(item.id, {
        ...item,
        columnPermission: true,
        formFill: true,
        queryFilter: true,
        sort: (index + 1) * 10,
        description: '',
      })
    }
  }
}

seedColumns()

function normalizeNode(node: MenuNode): MenuNode {
  const next: MenuNode = { ...node }
  if (next.enabled == null) next.enabled = true
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
  if (menuType === MenuTypeEnum.MENU && !payload.isExternalPage && !componentKey) {
    return '菜单类型请填写组件标识'
  }

  const node: MenuNode = {
    name,
    title,
    path,
    menuType,
    enabled: payload.enabled !== false,
    description: String(payload.description || '').trim(),
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
      const originalName = String(payload.originalName || payload.name || '').trim()
      const name = String(payload.name || '').trim()
      if (!name) return resultError('请填写标识')
      const found = findNode(originalName)
      if (!found) return resultError('菜单不存在')
      if (name !== originalName && nameExists(name)) return resultError('标识已存在')

      const nodeOrError = pickNodeFields(payload, name)
      if (typeof nodeOrError === 'string') return resultError(nodeOrError)

      const parentName = String(payload.parentName || '').trim()
      const currentParentName = found.parent?.name || ''

      function isDescendant(node: MenuNode, targetName: string): boolean {
        return Boolean(node.children?.some(
          (child) => child.name === targetName || isDescendant(child, targetName),
        ))
      }

      if (parentName === originalName || parentName === name || isDescendant(found.node, parentName)) {
        return resultError('不能挂载到自身或子级')
      }

      const nextParent = parentName && parentName !== currentParentName
        ? findNode(parentName)
        : null
      if (parentName && parentName !== currentParentName && !nextParent) {
        return resultError('挂载位置不存在')
      }

      const children = found.node.children
      const next = { ...nodeOrError }
      if (children?.length) {
        next.children = children
      }

      if (parentName === currentParentName) {
        found.siblings[found.index] = next
        renameMenuResources(originalName, name)
        return resultSuccess(normalizeNode(next), { message: '保存成功' })
      }

      found.siblings.splice(found.index, 1)
      if (!parentName) {
        getStore().push(next)
      } else {
        if (!nextParent!.node.children) nextParent!.node.children = []
        nextParent!.node.children.push(next)
      }
      renameMenuResources(originalName, name)
      return resultSuccess(normalizeNode(next), { message: '保存成功' })
    },
  },
  {
    url: mockUrl('/system/menu/enabled'),
    method: 'put',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const name = String(payload.name || '').trim()
      const found = findNode(name)
      if (!found) return resultError('菜单不存在')
      found.node.enabled = payload.enabled !== false
      return resultSuccess(normalizeNode(found.node), { message: '状态更新成功' })
    },
  },
  {
    url: mockUrl('/system/menu/delete-impact'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const name = String((body as Recordable<any>)?.name || '').trim()
      const found = findNode(name)
      if (!found) return resultError('菜单不存在')
      const menuNames = collectMenuNames(found.node)
      const functionIds = functionIdsByMenuNames(menuNames)
      const columns = columnsByMenuNames(menuNames)
      const tableCount = [...tableStore.values()]
        .filter((item) => menuNames.includes(item.menuName)).length
      return resultSuccess({
        childCount: menuNames.length - 1,
        roleMenuGrantCount: countRoleMenuGrants(menuNames),
        functionCount: functionIds.length,
        functionGrantCount: countRoleFunctionGrants(functionIds),
        tableCount,
        columnPermissionCount: countRoleColumnPermissions(columns.map((item) => item.id)),
      })
    },
  },
  {
    url: mockUrl('/system/menu/code-impact'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const name = String((body as Recordable<any>)?.name || '').trim()
      const found = findNode(name)
      if (!found) return resultError('菜单不存在')
      return resultSuccess({
        roleMenuGrantCount: countRoleMenuGrants([name]),
        functionCount: listFunctionsByMenu(name).length,
        tableCount: listTablesByMenu(name).length,
        dataPermissionCount: countRoleDataPermissions([name]),
      })
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
      const functionIds = functionIdsByMenuNames(menuNames)
      removeRoleMenuReferences(menuNames, functionIds)
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
    url: mockUrl('/system/menu/function/delete-impact'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const id = String((body as Recordable<any>)?.id || '').trim()
      if (!functionStore.has(id)) return resultError('功能不存在')
      return resultSuccess({ roleGrantCount: countRoleFunctionGrants([id]) })
    },
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
  {
    url: mockUrl('/system/menu/column-impact'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const id = String((body as Recordable<any>)?.id || '').trim()
      if (!columnStore.has(id)) return resultError('字段不存在')
      return resultSuccess(columnReferenceImpact([id]))
    },
  },
  {
    url: mockUrl('/system/menu/table-delete-impact'),
    method: 'post',
    timeout: 80,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const menuName = String(payload.menuName || '').trim()
      const tableCode = String(payload.tableCode || '').trim()
      if (!tableStore.has(tableKey(menuName, tableCode))) return resultError('数据表不存在')
      const ids = [...columnStore.values()]
        .filter((item) => item.menuName === menuName && item.tableCode === tableCode)
        .map((item) => item.id)
      return resultSuccess({ fieldCount: ids.length, ...columnReferenceImpact(ids) })
    },
  },
]

export default mocks
