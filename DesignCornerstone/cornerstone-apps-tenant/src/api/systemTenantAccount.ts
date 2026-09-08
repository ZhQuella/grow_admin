import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  TenantAccountAssignPayload,
  TenantAccountCreatePayload,
  TenantAccountDetail,
  TenantAccountPageResult,
  TenantAccountQuery,
  TenantAccountUpdatePayload,
} from '../types/systemTenantAccount'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchTenantAccountPage(params: TenantAccountQuery) {
  return useRequest().post<TenantAccountPageResult>({
    url: '/platform/tenant-accounts/page',
    data: params,
  })
}

export function getTenantAccountDetail(accountId: string) {
  return useRequest().post<TenantAccountDetail>({
    url: '/platform/tenant-account/detail',
    data: { accountId },
  })
}

export function createTenantAccount(data: TenantAccountCreatePayload) {
  return useRequest().post<TenantAccountDetail>({
    url: '/platform/tenant-account/create',
    data,
  })
}

export function updateTenantAccount(accountId: string, data: TenantAccountUpdatePayload) {
  return useRequest().put<TenantAccountDetail>({
    url: '/platform/tenant-account',
    data: { accountId, ...data },
  })
}

export function assignTenantAdmin(data: TenantAccountAssignPayload) {
  return useRequest().post<TenantAccountDetail>({
    url: '/platform/tenant-account/assign-tenant-admin',
    data,
  })
}
