import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  TenantAdminRoleCreatePayload,
  TenantAdminRoleDetail,
  TenantAdminRolePageResult,
  TenantAdminRoleQuery,
} from '../types/systemTenantAdminRole'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchTenantAdminRolePage(params: TenantAdminRoleQuery) {
  return useRequest().post<TenantAdminRolePageResult>({
    url: '/platform/tenant-admin-roles/page',
    data: params,
  })
}

export function getTenantAdminRoleDetail(roleId: string) {
  return useRequest().post<TenantAdminRoleDetail>({
    url: '/platform/tenant-admin-role/detail',
    data: { roleId },
  })
}

export function createTenantAdminRole(data: TenantAdminRoleCreatePayload) {
  return useRequest().post<TenantAdminRoleDetail>({
    url: '/platform/tenant-admin-role/create',
    data,
  })
}
