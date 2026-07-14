/**
 * FRONT 模式路由角色白名单：route name → 允许访问的角色 value。
 * 未配置的 name 视为无权限（与参考项目 authority.ts 行为一致）。
 */
export const FEAT_ROUTE_AUTHORITY: Record<string, string[]> = {
  FeatCatalog: ['super', 'minor'],
  OpenSubpage: ['super'],
  MenuChildTest: ['super', 'minor'],
  MenuChildTestSub: ['minor'],
  SharedDemo: ['super', 'minor'],
  SharedDemoA: ['super'],
  SharedDemoB: ['super', 'minor'],
  SplitPane: ['super'],
  DownExcel: ['super'],
  SearchBar: ['super'],
  ColumnBar: ['super'],
  MixtureDemoCatalog: ['super', 'minor'],
  MixtureFrontDemo: ['super', 'minor'],
  /** 隐藏子路由，跟随 OpenSubpage */
  Child: ['super'],
}

export function hasCommonElement(a: string[], b: string[]): boolean {
  return a.some((item) => b.includes(item))
}

/** 当前角色是否可访问指定路由 name */
export function canAccessRouteByRoles(
  routeName: string,
  roleValues: string[],
  authorityMap: Record<string, string[]> = FEAT_ROUTE_AUTHORITY,
): boolean {
  const allowedRoles = authorityMap[routeName]
  if (!allowedRoles?.length) {
    return false
  }
  return hasCommonElement(roleValues, allowedRoles)
}

/**
 * 按登录人角色过滤前端路由/菜单树。
 * 有子节点时：先过滤子级，子级非空则保留父级；无子节点时看自身权限。
 */
export function filterConfigsByRoles<T extends { name: string, children?: T[] }>(
  configs: T[],
  roleValues: string[],
  authorityMap: Record<string, string[]> = FEAT_ROUTE_AUTHORITY,
): T[] {
  const result: T[] = []

  for (const config of configs) {
    const children = config.children?.length
      ? filterConfigsByRoles(config.children, roleValues, authorityMap)
      : undefined

    if (children?.length) {
      result.push({ ...config, children })
      continue
    }

    if (canAccessRouteByRoles(String(config.name), roleValues, authorityMap)) {
      result.push(children ? { ...config, children } : { ...config })
    }
  }

  return result
}
