import { MenuTypeEnum, PageOpenModeEnum } from '@grow-admin-rock/constants'
import type { TenantMenuNode, TenantMenuSource } from '../../../types/systemTenantMenu'
import { TENANT_MENU_SOURCE_LABELS } from '../../../types/systemTenantMenu'
import type { TenantStatus } from '../../../types/systemTenant'
import { TENANT_STATUS_LABELS } from '../../../types/systemTenant'

export function tenantStatusLabel(status: TenantStatus) {
  return TENANT_STATUS_LABELS[status] || status
}

export function tenantStatusTagType(status: TenantStatus) {
  if (status === 'active') return 'success'
  if (status === 'trial') return 'warning'
  if (status === 'expired' || status === 'disabled') return 'danger'
  return 'info'
}

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

export function menuSourceLabel(source?: TenantMenuSource) {
  return source ? TENANT_MENU_SOURCE_LABELS[source] : '-'
}

export function openModeLabel(openMode?: string) {
  if (openMode === PageOpenModeEnum.IFRAME) return '内嵌 iframe'
  if (openMode === PageOpenModeEnum.BROWSER) return '浏览器新标签'
  if (openMode === PageOpenModeEnum.ROUTE) return '路由'
  return openMode || '-'
}

export function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function matchesKeyword(node: TenantMenuNode, keyword: string) {
  const text = keyword.trim().toLowerCase()
  if (!text) return true
  return [node.title, node.originTitle, node.name, node.path, node.componentKey]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(text))
}

export function filterMenuTree(nodes: TenantMenuNode[], query: Recordable<any>): TenantMenuNode[] {
  const keyword = String(query.keyword || '').trim()
  const menuType = query.menuType
  const visible = query.isVisible
  const enabled = query.enabled
  const source = query.source

  return nodes.reduce<TenantMenuNode[]>((list, node) => {
    const children = node.children?.length
      ? filterMenuTree(node.children, query)
      : undefined
    const typeMatched = !menuType || node.menuType === menuType
    const visibleMatched = visible === '' || visible == null ? true : String(node.isVisible) === String(visible)
    const enabledMatched = enabled === '' || enabled == null ? true : String(node.enabled) === String(enabled)
    const sourceMatched = !source || node.source === source
    const selfMatched = typeMatched && visibleMatched && enabledMatched && sourceMatched && matchesKeyword(node, keyword)
    if (selfMatched || children?.length) {
      list.push({
        ...node,
        children: children?.length ? children : undefined,
      })
    }
    return list
  }, [])
}

export function cloneMenuTree(nodes: TenantMenuNode[]): TenantMenuNode[] {
  return nodes.map((node) => ({
    ...node,
    children: node.children ? cloneMenuTree(node.children) : undefined,
  }))
}

export function sortMenuTree(nodes: TenantMenuNode[]): TenantMenuNode[] {
  return [...nodes]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.title.localeCompare(b.title, 'zh-CN'))
    .map((node) => ({
      ...node,
      children: node.children?.length ? sortMenuTree(node.children) : node.children,
    }))
}

export function findMenuNode(nodes: TenantMenuNode[], name: string): TenantMenuNode | undefined {
  for (const node of nodes) {
    if (node.name === name) return node
    const found = node.children?.length ? findMenuNode(node.children, name) : undefined
    if (found) return found
  }
  return undefined
}

export function findMenuParentName(nodes: TenantMenuNode[], name: string): string {
  for (const node of nodes) {
    if (node.children?.some((child) => child.name === name)) return node.name
    const found = node.children?.length ? findMenuParentName(node.children, name) : ''
    if (found) return found
  }
  return ''
}

export function collectMenuNames(node: TenantMenuNode): string[] {
  return [node.name, ...(node.children?.flatMap(collectMenuNames) || [])]
}

export function countMenuDescendants(node: TenantMenuNode): number {
  return node.children?.reduce((sum, child) => sum + 1 + countMenuDescendants(child), 0) || 0
}

export function detachMenuNode(nodes: TenantMenuNode[], name: string): TenantMenuNode | undefined {
  for (let index = 0; index < nodes.length; index += 1) {
    if (nodes[index].name === name) return nodes.splice(index, 1)[0]
    const found = nodes[index].children?.length
      ? detachMenuNode(nodes[index].children!, name)
      : undefined
    if (found) return found
  }
  return undefined
}

export function insertMenuNode(
  nodes: TenantMenuNode[],
  node: TenantMenuNode,
  parentName: string,
): boolean {
  if (!parentName) {
    nodes.push(node)
    return true
  }
  const parent = findMenuNode(nodes, parentName)
  if (!parent || parent.menuType !== MenuTypeEnum.DIRECTORY) return false
  parent.children = parent.children || []
  parent.children.push(node)
  return true
}

export type TenantMenuParentOption = {
  name: string
  title: string
  children?: TenantMenuParentOption[]
}

export function toDirectoryOptions(
  nodes: TenantMenuNode[],
  excludedNames = new Set<string>(),
): TenantMenuParentOption[] {
  return nodes.reduce<TenantMenuParentOption[]>((list, node) => {
    if (node.menuType !== MenuTypeEnum.DIRECTORY || excludedNames.has(node.name)) return list
    const children = toDirectoryOptions(node.children || [], excludedNames)
    list.push({
      name: node.name,
      title: node.title,
      children: children.length ? children : undefined,
    })
    return list
  }, [])
}
