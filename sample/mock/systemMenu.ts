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

function getStore(): MenuNode[] {
  const source = clone(buildBackMenuList() as MenuNode[])
  if (!menuStore) {
    menuStore = source
  } else {
    syncSourceMeta(menuStore, source)
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
      found.siblings.splice(found.index, 1)
      return resultSuccess({ name }, { message: '删除成功' })
    },
  },
]

export default mocks
