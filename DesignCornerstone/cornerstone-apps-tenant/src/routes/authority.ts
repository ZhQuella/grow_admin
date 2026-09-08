/**
 * FRONT 模式路由角色白名单：route name → 允许访问的角色 value。
 */
export const TENANT_ROUTE_AUTHORITY: Record<string, string[]> = {
  TenantCatalog: ['super'],
  TenantManage: ['super'],
  TenantMenu: ['super'],
  TenantAdminRole: ['super'],
  TenantAccount: ['super'],
}
