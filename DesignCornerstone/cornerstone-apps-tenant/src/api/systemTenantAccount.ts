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
const platformApiUrl = import.meta.env.VITE_ACCOUNT_API_URL || '/api'

export function fetchTenantAccountPage(params: TenantAccountQuery) {
  return useRequest().post<TenantAccountPageResult>({
    url: '/system/platform/tenant-accounts/page',
    baseURL: platformApiUrl,
    data: params,
  })
}

export function getTenantAccountDetail(accountId: string) {
  return useRequest().post<TenantAccountDetail>({
    url: '/system/platform/tenant-account/detail',
    baseURL: platformApiUrl,
    data: { accountId },
  })
}

export function createTenantAccount(data: TenantAccountCreatePayload) {
  return useRequest().post<TenantAccountDetail>({
    url: '/system/platform/tenant-account/create',
    baseURL: platformApiUrl,
    data,
  })
}

export function updateTenantAccount(accountId: string, data: TenantAccountUpdatePayload) {
  return useRequest().put<TenantAccountDetail>({
    url: '/system/platform/tenant-account',
    baseURL: platformApiUrl,
    data: { accountId, ...data },
  })
}

export function assignTenantAdmin(data: TenantAccountAssignPayload) {
  return useRequest().post<TenantAccountDetail>({
    url: '/system/platform/tenant-account/assign-tenant-admin',
    baseURL: platformApiUrl,
    data,
  })
}
