import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  TenantMenuAssemblyPayload,
  TenantMenuAssemblyResult,
  TenantMenuTreeResult,
} from '../types/systemTenantMenu'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchTenantMenuTree(tenantId: string) {
  return useRequest().post<TenantMenuTreeResult>({
    url: '/platform/tenant-menus/tree',
    data: { tenantId },
  })
}

export function fetchTenantMenuAssembly(tenantId: string) {
  return useRequest().post<TenantMenuAssemblyResult>({
    url: '/platform/tenant-menus/assembly/detail',
    data: { tenantId },
  })
}

export function saveTenantMenuAssembly(data: TenantMenuAssemblyPayload) {
  return useRequest().put<TenantMenuAssemblyResult>({
    url: '/platform/tenant-menus/assembly',
    data,
  })
}
