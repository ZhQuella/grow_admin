import type { MockMethod } from '@grow-admin-rock/mock/types'
import { mockUrl } from '@grow-admin-rock/mock/constants'
import { resultError, resultSuccess } from '@grow-admin-rock/mock/util'
import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import { GRANT_TREE, findTenant } from './systemTenant'

type GrantNode = {
  id: string
  title: string
  directory: boolean
  children?: GrantNode[]
}

type MenuNode = {
  name: string
  title: string
  originTitle?: string
  path: string
  componentKey?: string
  icon?: string
  source: 'platform' | 'tenant'
  menuType: string
  enabled: boolean
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

const assemblyStore = new Map<string, MenuNode[]>()

const ICON_MAP: Record<string, string> = {
  SystemCatalog: 'ant-design:setting-outlined',
  MenuManage: 'ant-design:menu-outlined',
  RoleManage: 'ant-design:team-outlined',
  AccountManage: 'ant-design:lock-outlined',
  PersonManage: 'ant-design:user-outlined',
  DeptManage: 'ant-design:apartment-outlined',
  PostManage: 'ant-design:idcard-outlined',
  PositionManage: 'ant-design:solution-outlined',
  OrgChart: 'ant-design:cluster-outlined',
  TenantCatalog: 'ant-design:bank-outlined',
  TenantManage: 'ant-design:bank-outlined',
  TenantAdminRole: 'ant-design:crown-outlined',
  TenantAccount: 'ant-design:usergroup-add-outlined',
  TenantMenu: 'ant-design:menu-outlined',
}

const SORT_MAP: Record<string, number> = {
  SystemCatalog: 37,
  MenuManage: 10,
  RoleManage: 20,
  AccountManage: 25,
  PersonManage: 30,
  DeptManage: 35,
  PostManage: 36,
  PositionManage: 37,
  OrgChart: 38,
  TenantCatalog: 38,
  TenantManage: 10,
  TenantMenu: 15,
  TenantAdminRole: 20,
  TenantAccount: 30,
}

const PLATFORM_CATALOG: GrantNode = {
  id: 'TenantCatalog',
  title: '租户管理',
  directory: true,
  children: [
    { id: 'TenantManage', title: '租户管理', directory: false },
    { id: 'TenantAdminRole', title: '租户角色', directory: false },
    { id: 'TenantAccount', title: '租户账号', directory: false },
    { id: 'TenantMenu', title: '租户菜单', directory: false },
  ],
}

const ALIAS_MAP: Record<string, Record<string, string>> = {
  '2': {
    AccountManage: '账号中心',
    PersonManage: '员工档案',
  },
  '4': {
    MenuManage: '功能导航',
  },
}

const SELF_MENUS: Record<string, MenuNode[]> = {
  '2': [
    {
      name: 'acme_sales_report',
      title: '销售报表',
      path: 'sales-report',
      componentKey: 'AcmeSalesReport',
      icon: 'ant-design:bar-chart-outlined',
      source: 'tenant',
      menuType: MenuTypeEnum.MENU,
      enabled: true,
      isVisible: true,
      isKeepAlive: true,
      affix: false,
      defaultShow: false,
      sort: 90,
      isExternalPage: false,
      openMode: PageOpenModeEnum.ROUTE,
    },
  ],
  '4': [
    {
      name: 'gov_portal',
      title: '办事门户',
      path: 'https://gov.example.test',
      icon: 'ant-design:link-outlined',
      source: 'tenant',
      menuType: MenuTypeEnum.MENU,
      enabled: true,
      isVisible: true,
      isKeepAlive: false,
      affix: false,
      defaultShow: false,
      sort: 90,
      isExternalPage: true,
      openMode: PageOpenModeEnum.BROWSER,
      link: 'https://gov.example.test',
    },
    {
      name: 'gov_form',
      title: '材料申报',
      path: 'material-form',
      componentKey: 'GovMaterialForm',
      icon: 'ant-design:form-outlined',
      source: 'tenant',
      menuType: MenuTypeEnum.MENU,
      enabled: true,
      isVisible: true,
      isKeepAlive: true,
      affix: false,
      defaultShow: false,
      sort: 91,
      isExternalPage: false,
      openMode: PageOpenModeEnum.ROUTE,
    },
    {
      name: 'gov_board',
      title: '公示看板',
      path: 'notice-board',
      componentKey: 'GovNoticeBoard',
      icon: 'ant-design:appstore-outlined',
      source: 'tenant',
      menuType: MenuTypeEnum.MENU,
      enabled: false,
      isVisible: true,
      isKeepAlive: false,
      affix: false,
      defaultShow: false,
      sort: 92,
      isExternalPage: false,
      openMode: PageOpenModeEnum.ROUTE,
    },
  ],
}

function text(value: unknown) {
  return String(value ?? '').trim()
}

function toPath(name: string) {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function toMenuNode(node: GrantNode, aliases: Record<string, string>, sort = 0): MenuNode {
  const originTitle = node.title
  const title = aliases[node.id] || originTitle
  const isDirectory = node.directory
  return {
    name: node.id,
    title,
    originTitle: title !== originTitle ? originTitle : undefined,
    path: toPath(node.id),
    componentKey: isDirectory ? undefined : node.id,
    icon: ICON_MAP[node.id],
    source: 'platform',
    menuType: isDirectory ? MenuTypeEnum.DIRECTORY : MenuTypeEnum.MENU,
    enabled: true,
    isVisible: true,
    isKeepAlive: !isDirectory,
    affix: false,
    defaultShow: false,
    sort: SORT_MAP[node.id] ?? sort,
    isExternalPage: false,
    openMode: PageOpenModeEnum.ROUTE,
    children: node.children?.length
      ? node.children.map((child, index) => toMenuNode(child, aliases, (index + 1) * 10))
      : undefined,
  }
}

function filterGranted(nodes: MenuNode[], granted: Set<string>, keepAll: boolean): MenuNode[] {
  return nodes.reduce<MenuNode[]>((list, node) => {
    const children = node.children?.length
      ? filterGranted(node.children, granted, keepAll)
      : undefined
    const selfGranted = keepAll || granted.has(node.name)
    if (selfGranted || children?.length) {
      list.push({
        ...node,
        children: children?.length ? children : undefined,
      })
    }
    return list
  }, [])
}

function attachSelfMenus(tree: MenuNode[], tenantId: string) {
  const extras = SELF_MENUS[tenantId]
  if (!extras?.length) return tree
  const catalog = tree.find((item) => item.name === 'SystemCatalog')
  if (!catalog) {
    return [
      ...tree,
      {
        name: 'SystemCatalog',
        title: '系统管理',
        path: 'system-catalog',
        icon: ICON_MAP.SystemCatalog,
        source: 'platform' as const,
        menuType: MenuTypeEnum.DIRECTORY,
        enabled: true,
        isVisible: true,
        isKeepAlive: false,
        sort: 37,
        children: extras,
      },
    ]
  }
  catalog.children = [...(catalog.children || []), ...extras]
  return tree
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function buildDefaultTree(tenant: ReturnType<typeof findTenant>) {
  if (!tenant) return []
  const aliases = ALIAS_MAP[tenant.id] || {}
  const platformTree = (GRANT_TREE as GrantNode[]).map((node) => toMenuNode(node, aliases))
  const keepAll = tenant.builtIn
  const granted = new Set(tenant.menuIds)
  let tree = filterGranted(platformTree, granted, keepAll)
  if (keepAll) {
    tree = [...tree, toMenuNode(PLATFORM_CATALOG, aliases)]
  }
  return attachSelfMenus(tree, tenant.id)
}

function collectAvailableFunctions(nodes: MenuNode[]): MenuNode[] {
  return nodes.flatMap((node) => {
    if (node.children?.length) return collectAvailableFunctions(node.children)
    if (node.menuType !== MenuTypeEnum.MENU || node.enabled === false) return []
    const item = clone(node)
    delete item.children
    return [item]
  })
}

function sanitizeAssembly(nodes: MenuNode[], availableMap: Map<string, MenuNode>): MenuNode[] {
  return nodes.reduce<MenuNode[]>((list, node) => {
    if (node.menuType === MenuTypeEnum.DIRECTORY) {
      list.push({
        ...clone(node),
        children: sanitizeAssembly(node.children || [], availableMap),
      })
      return list
    }
    const available = availableMap.get(node.name)
    if (!available) return list
    list.push({
      ...clone(available),
      title: node.title,
      originTitle: node.title === available.title
        ? available.originTitle
        : (available.originTitle || available.title),
      sort: Number(node.sort ?? available.sort ?? 0),
    })
    return list
  }, [])
}

function getAssembly(tenant: NonNullable<ReturnType<typeof findTenant>>) {
  const defaultTree = buildDefaultTree(tenant)
  const availableFunctions = collectAvailableFunctions(defaultTree)
  const availableMap = new Map(availableFunctions.map((item) => [item.name, item]))
  const stored = assemblyStore.get(tenant.id)
  const tree = sanitizeAssembly(stored || defaultTree, availableMap)
  if (stored) assemblyStore.set(tenant.id, clone(tree))
  return { tree, availableFunctions }
}

function validateAssembly(nodes: MenuNode[], availableNames: Set<string>) {
  const names = new Set<string>()
  const visit = (items: MenuNode[]): string => {
    for (const node of items) {
      if (!text(node.name)) return '菜单标识不能为空'
      if (!text(node.title)) return '菜单名称不能为空'
      if (names.has(node.name)) return `菜单「${node.title}」重复添加`
      names.add(node.name)
      if (node.menuType === MenuTypeEnum.DIRECTORY) {
        const error = visit(node.children || [])
        if (error) return error
      } else {
        if (!availableNames.has(node.name)) return `应用功能「${node.title}」未授权或已停用`
        if (node.children?.length) return '应用功能下不能挂载子菜单'
      }
    }
    return ''
  }
  return visit(nodes)
}

function toAssemblyResult(tenant: NonNullable<ReturnType<typeof findTenant>>) {
  const { tree, availableFunctions } = getAssembly(tenant)
  return {
    tenantId: tenant.id,
    tenantCode: tenant.tenantCode,
    tenantName: tenant.tenantName,
    tree,
    availableFunctions,
  }
}

export default [
  {
    url: mockUrl('/platform/tenant-menus/tree'),
    method: 'post',
    timeout: 60,
    response: ({ body }) => {
      const tenantId = text((body as Recordable<any>)?.tenantId)
      const tenant = findTenant(tenantId)
      if (!tenant) return resultError('租户不存在')
      if (tenant.status === 'deleted') return resultError('已删除租户不展示菜单')
      const { tree } = getAssembly(tenant)
      return resultSuccess({
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        tenantName: tenant.tenantName,
        tree,
      })
    },
  },
  {
    url: mockUrl('/platform/tenant-menus/assembly/detail'),
    method: 'post',
    timeout: 60,
    response: ({ body }) => {
      const tenant = findTenant(text((body as Recordable<any>)?.tenantId))
      if (!tenant) return resultError('租户不存在')
      if (tenant.status === 'deleted') return resultError('已删除租户不可配置菜单')
      return resultSuccess(toAssemblyResult(tenant))
    },
  },
  {
    url: mockUrl('/platform/tenant-menus/assembly'),
    method: 'put',
    timeout: 100,
    response: ({ body }) => {
      const payload = (body || {}) as Recordable<any>
      const tenant = findTenant(text(payload.tenantId))
      if (!tenant) return resultError('租户不存在')
      if (tenant.status === 'deleted') return resultError('已删除租户不可配置菜单')
      const tree = Array.isArray(payload.tree) ? payload.tree as MenuNode[] : []
      const availableNames = new Set(getAssembly(tenant).availableFunctions.map((item) => item.name))
      const error = validateAssembly(tree, availableNames)
      if (error) return resultError(error)
      assemblyStore.set(tenant.id, clone(tree))
      return resultSuccess(toAssemblyResult(tenant), { message: '菜单配置已保存' })
    },
  },
] as MockMethod[]
