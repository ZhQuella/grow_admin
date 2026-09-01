import { MenuTypeEnum } from '@grow-admin-rock/constants'
import type { SystemMenuNode } from '../../../types/systemMenu'

export function menuTypeLabel(menuType?: string) {
  if (menuType === MenuTypeEnum.DIRECTORY) return '目录'
  if (menuType === MenuTypeEnum.MENU) return '菜单'
  return menuType || '-'
}

export function menuTypeTagType(menuType?: string) {
  if (menuType === MenuTypeEnum.DIRECTORY) return 'warning'
  if (menuType === MenuTypeEnum.MENU) return 'primary'
  return 'info'
}

export function countDescendants(node: SystemMenuNode): number {
  if (!node.children?.length) return 0
  return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0)
}

export type ParentTreeNode = {
  name: string
  title: string
  disabled?: boolean
  children?: ParentTreeNode[]
}

export function collectNodeNames(node: SystemMenuNode): string[] {
  return [node.name, ...(node.children?.flatMap(collectNodeNames) ?? [])]
}

export function findNodeByName(nodes: SystemMenuNode[], name: string): SystemMenuNode | undefined {
  for (const node of nodes) {
    if (node.name === name) return node
    if (node.children?.length) {
      const found = findNodeByName(node.children, name)
      if (found) return found
    }
  }
  return undefined
}

export function findParentName(nodes: SystemMenuNode[], childName: string): string | undefined {
  for (const node of nodes) {
    if (node.children?.some((child) => child.name === childName)) {
      return node.name
    }
    if (node.children?.length) {
      const found = findParentName(node.children, childName)
      if (found) return found
    }
  }
  return undefined
}

export function toParentTreeData(
  nodes: SystemMenuNode[],
  disabledNames?: Set<string>,
): ParentTreeNode[] {
  return nodes.map((node) => ({
    name: node.name,
    title: `${node.title}（${node.name}）`,
    disabled: disabledNames?.has(node.name),
    children: node.children?.length ? toParentTreeData(node.children, disabledNames) : undefined,
  }))
}

function matchesKeyword(node: SystemMenuNode, keyword: string) {
  const text = keyword.trim().toLowerCase()
  if (!text) return true
  return [node.title, node.name, node.path, node.componentKey]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(text))
}

export function sortMenuTree(nodes: SystemMenuNode[]): SystemMenuNode[] {
  return [...nodes]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((node) => ({
      ...node,
      children: node.children?.length ? sortMenuTree(node.children) : node.children,
    }))
}

export function filterMenuTree(
  nodes: SystemMenuNode[],
  query: Recordable<any>,
): SystemMenuNode[] {
  const keyword = String(query.keyword || '').trim()
  const menuType = query.menuType
  const visible = query.isVisible
  const enabled = query.enabled

  const result = nodes.reduce<SystemMenuNode[]>((list, node) => {
    const children = node.children?.length
      ? filterMenuTree(node.children, query)
      : undefined

    const typeMatched = !menuType || node.menuType === menuType
    const visibleMatched = visible === '' || visible == null
      ? true
      : String(node.isVisible) === String(visible)
    const enabledMatched = enabled === '' || enabled == null
      ? true
      : String(node.enabled) === String(enabled)
    const keywordMatched = matchesKeyword(node, keyword)
    const selfMatched = typeMatched && visibleMatched && enabledMatched && keywordMatched

    if (selfMatched || children?.length) {
      list.push({
        ...node,
        children: children?.length ? children : undefined,
      })
    }

    return list
  }, [])

  return sortMenuTree(result)
}
