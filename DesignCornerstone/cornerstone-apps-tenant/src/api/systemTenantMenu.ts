import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  TenantMenuAssemblyPayload,
  TenantMenuAssemblyResult,
  TenantMenuTreeResult,
} from '../types/systemTenantMenu'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)
const platformApiUrl = import.meta.env.VITE_ACCOUNT_API_URL || '/api'

export function fetchTenantMenuTree(tenantId: string) {
  return useRequest().post<TenantMenuTreeResult>({
    url: '/system/platform/tenant-menus/tree',
    baseURL: platformApiUrl,
    data: { tenantId },
  })
}

export function fetchTenantMenuAssembly(tenantId: string) {
  return useRequest().post<TenantMenuAssemblyResult>({
    url: '/system/platform/tenant-menus/assembly/detail',
    baseURL: platformApiUrl,
    data: { tenantId },
  })
}

export function saveTenantMenuAssembly(data: TenantMenuAssemblyPayload) {
  return useRequest().put<TenantMenuAssemblyResult>({
    url: '/system/platform/tenant-menus/assembly',
    baseURL: platformApiUrl,
    data,
  })
}
