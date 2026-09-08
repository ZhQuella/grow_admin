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
