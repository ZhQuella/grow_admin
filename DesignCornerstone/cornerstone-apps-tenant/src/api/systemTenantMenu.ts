import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type { TenantMenuTreeResult } from '../types/systemTenantMenu'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchTenantMenuTree(tenantId: string) {
  return useRequest().post<TenantMenuTreeResult>({
    url: '/platform/tenant-menus/tree',
    data: { tenantId },
  })
}
