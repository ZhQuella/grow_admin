/**
 * FRONT 模式路由角色白名单：route name → 允许访问的角色 value。
 */
export const SYSTEM_ROUTE_AUTHORITY: Record<string, string[]> = {
  SystemCatalog: ['super'],
  MenuManage: ['super'],
}
