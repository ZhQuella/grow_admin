import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { SystemMenuNode } from '../../../types/systemMenu'
import type { RolePermTreeNode } from '../../../types/systemRole'

export function buildRolePermTree(
  menus: SystemMenuNode[],
): RolePermTreeNode[] {
  const walk = (nodes: SystemMenuNode[], ancestorDisabled = false): RolePermTreeNode[] =>
    nodes.map((node) => {
      const disabled = ancestorDisabled || node.enabled === false
      const children = node.children?.length ? walk(node.children, disabled) : []
      const directory = node.menuType === MenuTypeEnum.DIRECTORY
      return {
        key: directory ? `dir:${node.name}` : `menu:${node.name}`,
        title: disabled ? `${node.title}（已停用）` : node.title,
        ...(!directory ? { menuName: node.name } : {}),
        directory,
        disabled,
        ...(children.length ? { children } : {}),
      }
    })

  return walk(menus)
}

function findMenuTitleIn(menus: SystemMenuNode[], name: string): string {
  for (const node of menus) {
    if (node.name === name) return node.title
    if (node.children?.length) {
      const found = findMenuTitleIn(node.children, name)
      if (found) return found
    }
  }
  return ''
}

export function findMenuTitle(menus: SystemMenuNode[], name: string): string {
  return findMenuTitleIn(menus, name) || name
}

export type GrantedMenuItem = {
  name: string
  title: string
  group: string
}

export type GrantedMenuTreeNode = {
  key: string
  title: string
  menuName?: string
  group: string
  disabled?: boolean
  children?: GrantedMenuTreeNode[]
}

export function buildGrantedMenuTree(
  menus: SystemMenuNode[],
  grantedNames: string[],
): GrantedMenuTreeNode[] {
  const granted = new Set(grantedNames)

  const walk = (nodes: SystemMenuNode[], parentTitle: string): GrantedMenuTreeNode[] => {
    const result: GrantedMenuTreeNode[] = []
    for (const node of nodes) {
      const nextParent = node.menuType === MenuTypeEnum.DIRECTORY ? node.title : parentTitle
      const children = node.children?.length ? walk(node.children, nextParent) : []

      if (node.menuType === MenuTypeEnum.MENU && granted.has(node.name)) {
        result.push({
          key: `menu:${node.name}`,
          title: node.title,
          menuName: node.name,
          group: parentTitle || '未分组',
          ...(children.length ? { children } : {}),
        })
        continue
      }

      if (!children.length) continue
      if (node.menuType === MenuTypeEnum.DIRECTORY) {
        result.push({
          key: `dir:${node.name}`,
          title: node.title,
          group: parentTitle || node.title,
          disabled: true,
          children,
        })
      } else {
        result.push(...children)
      }
    }
    return result
  }

  const tree = walk(menus, '')
  const named = new Set<string>()
  const collect = (nodes: GrantedMenuTreeNode[]) => {
    for (const node of nodes) {
      if (node.menuName) named.add(node.menuName)
      if (node.children?.length) collect(node.children)
    }
  }
  collect(tree)

  const orphans = grantedNames
    .filter((name) => !named.has(name))
    .map((name) => ({
      key: `menu:${name}`,
      title: findMenuTitle(menus, name),
      menuName: name,
      group: '未分组',
    }))
  if (!orphans.length) return tree
  return [
    ...tree,
    {
      key: 'dir:ungrouped',
      title: '未分组',
      group: '未分组',
      disabled: true,
      children: orphans,
    },
  ]
}

export function filterGrantedMenuTree(
  nodes: GrantedMenuTreeNode[],
  keyword: string,
): GrantedMenuTreeNode[] {
  const q = keyword.trim().toLowerCase()
  if (!q) return nodes
  const walk = (list: GrantedMenuTreeNode[]): GrantedMenuTreeNode[] => {
    const next: GrantedMenuTreeNode[] = []
    for (const node of list) {
      const children = node.children?.length ? walk(node.children) : []
      if (node.title.toLowerCase().includes(q)) next.push(node)
      else if (children.length) next.push({ ...node, children })
    }
    return next
  }
  return walk(nodes)
}

export function flattenGrantedMenuTree(nodes: GrantedMenuTreeNode[]): GrantedMenuItem[] {
  const result: GrantedMenuItem[] = []
  const walk = (list: GrantedMenuTreeNode[]) => {
    for (const node of list) {
      if (node.menuName) {
        result.push({ name: node.menuName, title: node.title, group: node.group })
      }
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return result
}

export function flattenRoleMenuTree(nodes: RolePermTreeNode[]) {
  const result: RolePermTreeNode[] = []
  const walk = (list: RolePermTreeNode[]) => {
    for (const node of list) {
      if (node.menuName) result.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return result
}

export function flattenRolePermTree(nodes: RolePermTreeNode[]) {
  const result: RolePermTreeNode[] = []
  const walk = (list: RolePermTreeNode[]) => {
    for (const node of list) {
      result.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return result
}

export function syncRoleDirectoryKeys(
  nodes: RolePermTreeNode[],
  sourceKeys: string[],
) {
  const keys = new Set(sourceKeys)

  const walk = (node: RolePermTreeNode): string[] => {
    const menuKeys = node.directory || node.disabled ? [] : [node.key]
    for (const child of node.children || []) menuKeys.push(...walk(child))

    if (node.directory) {
      if (menuKeys.length && menuKeys.every((key) => keys.has(key))) keys.add(node.key)
      else keys.delete(node.key)
    }
    return menuKeys
  }

  nodes.forEach(walk)
  return [...keys]
}

export function toggleRolePermNode(
  nodes: RolePermTreeNode[],
  sourceKeys: string[],
  nodeKey: string,
  checked: boolean,
) {
  const keys = new Set(sourceKeys)
  const node = flattenRolePermTree(nodes).find((item) => item.key === nodeKey)
  if (!node || node.disabled) return syncRoleDirectoryKeys(nodes, [...keys])

  if (checked) keys.add(node.key)
  else keys.delete(node.key)

  if (node.directory) {
    const applyChildren = (children: RolePermTreeNode[]) => {
      for (const child of children) {
        if (!child.disabled) {
          if (checked) keys.add(child.key)
          else keys.delete(child.key)
        }
        if (child.children?.length) applyChildren(child.children)
      }
    }
    applyChildren(node.children || [])
  }

  return syncRoleDirectoryKeys(nodes, [...keys])
}
