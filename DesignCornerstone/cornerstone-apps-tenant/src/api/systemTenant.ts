import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  SystemTenantClearImpact,
  SystemTenantApplicationFunction,
  SystemTenantCodePayload,
  SystemTenantCreatePayload,
  SystemTenantDeletePayload,
  SystemTenantDetail,
  SystemTenantGrantDetail,
  SystemTenantGrantColumn,
  SystemTenantGrantPayload,
  SystemTenantHistoryPageResult,
  SystemTenantListItem,
  SystemTenantOption,
  SystemTenantPageResult,
  SystemTenantPeriodPayload,
  SystemTenantQuery,
  SystemTenantRemarkPayload,
  SystemTenantUpdatePayload,
} from '../types/systemTenant'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)
const platformApiUrl = import.meta.env.VITE_ACCOUNT_API_URL

export async function fetchSystemTenantHistory(tenantId: string, page: number, pageSize: number) {
  if (!platformApiUrl) {
    return useRequest().post<SystemTenantHistoryPageResult>(
      {
        url: '/platform/tenant/history/page',
        data: { tenantId, page, pageSize },
      },
      { errorMessageMode: 'none' },
    )
  }

  return useRequest().post<SystemTenantHistoryPageResult>(
    {
      url: `/platform/tenant/change-history/${page}/${pageSize}`,
      baseURL: platformApiUrl,
      data: { tenantId: Number(tenantId) },
    },
    { errorMessageMode: 'none' },
  )
}

export function fetchSystemTenantPage(params: SystemTenantQuery) {
  if (!platformApiUrl) {
    return useRequest().post<SystemTenantPageResult>({
      url: '/platform/tenants/page',
      data: params,
    })
  }

  const { page = 1, pageSize = 10, ...filters } = params
  return useRequest().post<SystemTenantPageResult>(
    {
      url: `/platform/tenants/${page}/${pageSize}`,
      baseURL: platformApiUrl,
      data: filters,
    },
    { errorMessageMode: 'message' },
  )
}

export function fetchSystemTenantOptions() {
  return useRequest().post<SystemTenantOption[]>({
    url: '/platform/tenants/options',
  })
}

export function getSystemTenantDetail(tenantId: string) {
  if (!platformApiUrl) {
    return useRequest().post<SystemTenantDetail>(
      {
        url: '/platform/tenant/detail',
        data: { tenantId },
      },
      { errorMessageMode: 'message' },
    )
  }

  return useRequest().get<SystemTenantDetail>(
    {
      url: `/platform/tenant/detail/${tenantId}`,
      baseURL: platformApiUrl,
    },
    { errorMessageMode: 'message' },
  )
}

export function createSystemTenant(data: SystemTenantCreatePayload) {
  return useRequest().post<SystemTenantListItem>(
    {
      url: '/platform/tenant/create',
      baseURL: platformApiUrl || undefined,
      data,
    },
    { errorMessageMode: 'message' },
  )
}

export function updateSystemTenant(tenantId: string, data: SystemTenantUpdatePayload) {
  return useRequest().put<SystemTenantListItem>(
    {
      url: '/platform/tenant',
      baseURL: platformApiUrl || undefined,
      data: { tenantId: Number(tenantId), ...data },
    },
    { errorMessageMode: 'message' },
  )
}

export function updateSystemTenantCode(data: SystemTenantCodePayload) {
  return useRequest().put<SystemTenantListItem>(
    {
      url: '/platform/tenant/code',
      baseURL: platformApiUrl || undefined,
      data: { ...data, tenantId: platformApiUrl ? Number(data.tenantId) : data.tenantId },
    },
    { errorMessageMode: 'message' },
  )
}

export function trialSystemTenant(data: SystemTenantPeriodPayload) {
  return useRequest().post<SystemTenantListItem>(
    {
      url: '/platform/tenant/trial',
      baseURL: platformApiUrl || undefined,
      data,
    },
    { errorMessageMode: 'message' },
  )
}

export function activateSystemTenant(data: SystemTenantPeriodPayload) {
  return useRequest().post<SystemTenantListItem>(
    {
      url: '/platform/tenant/activate',
      baseURL: platformApiUrl || undefined,
      data,
    },
    { errorMessageMode: 'message' },
  )
}

export function disableSystemTenant(data: SystemTenantRemarkPayload) {
  return useRequest().post<SystemTenantListItem>(
    {
      url: '/platform/tenant/disable',
      baseURL: platformApiUrl || undefined,
      data: { ...data, tenantId: platformApiUrl ? Number(data.tenantId) : data.tenantId },
    },
    { errorMessageMode: 'message' },
  )
}

export function deleteSystemTenant(data: SystemTenantDeletePayload) {
  return useRequest().post<SystemTenantListItem>(
    {
      url: '/platform/tenant/delete',
      baseURL: platformApiUrl || undefined,
      data: { ...data, tenantId: platformApiUrl ? Number(data.tenantId) : data.tenantId },
    },
    { errorMessageMode: 'message' },
  )
}

export function fetchSystemTenantClearImpact(tenantId: string) {
  return useRequest().post<SystemTenantClearImpact>({
    url: '/platform/tenant/clear-impact',
    data: { tenantId },
  })
}

export function clearSystemTenantData(data: SystemTenantDeletePayload) {
  return useRequest().post<{ tenantId: string }>({
    url: '/platform/tenant/clear-data',
    data,
  })
}

export function fetchSystemTenantGrantDetail(tenantId: string) {
  return useRequest().post<SystemTenantGrantDetail>({
    url: '/platform/tenant/grant/detail',
    data: { tenantId },
  })
}

export function fetchSystemTenantApplicationFunctions() {
  return useRequest().post<SystemTenantApplicationFunction[]>({
    url: '/platform/application-functions/list',
  })
}

export function fetchSystemTenantGrantColumns() {
  return useRequest().post<SystemTenantGrantColumn[]>({
    url: '/system/menu-columns/all',
  })
}

export function saveSystemTenantGrant(data: SystemTenantGrantPayload) {
  return useRequest().put<SystemTenantGrantDetail>({
    url: '/platform/tenant/grant',
    data,
  })
}
