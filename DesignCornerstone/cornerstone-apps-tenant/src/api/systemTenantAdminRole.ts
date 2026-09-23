import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  TenantAdminRoleCreatePayload,
  TenantAdminRoleDetail,
  TenantAdminRolePageResult,
  TenantAdminRoleQuery,
} from '../types/systemTenantAdminRole'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)
const platformApiUrl = import.meta.env.VITE_ACCOUNT_API_URL || '/api'

export function fetchTenantAdminRolePage(params: TenantAdminRoleQuery) {
  return useRequest().post<TenantAdminRolePageResult>({
    url: '/system/platform/tenant-admin-roles/page',
    baseURL: platformApiUrl,
    data: params,
  })
}

export function getTenantAdminRoleDetail(roleId: string) {
  return useRequest().post<TenantAdminRoleDetail>({
    url: '/system/platform/tenant-admin-role/detail',
    baseURL: platformApiUrl,
    data: { roleId },
  })
}

export function createTenantAdminRole(data: TenantAdminRoleCreatePayload) {
  return useRequest().post<TenantAdminRoleDetail>({
    url: '/system/platform/tenant-admin-role/create',
    baseURL: platformApiUrl,
    data,
  })
}
