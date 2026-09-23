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
const platformApiUrl = import.meta.env.VITE_ACCOUNT_API_URL || '/api'

export function fetchSystemTenantHistory(tenantId: string, page: number, pageSize: number) {
  return useRequest().post<SystemTenantHistoryPageResult>(
    {
      url: `/system/platform/tenant/change-history/${page}/${pageSize}`,
      baseURL: platformApiUrl,
      data: { tenantId: Number(tenantId) },
    },
    { errorMessageMode: 'none' },
  )
}

export function fetchSystemTenantPage(params: SystemTenantQuery) {
  const { page = 1, pageSize = 10, ...filters } = params
  return useRequest().post<SystemTenantPageResult>(
    {
      url: `/system/platform/tenant/${page}/${pageSize}`,
      baseURL: platformApiUrl,
      data: filters,
    },
    { errorMessageMode: 'message' },
  )
}

export function fetchSystemTenantOptions() {
  return useRequest().post<SystemTenantOption[]>({
    url: '/system/platform/tenant/options',
    baseURL: platformApiUrl,
  })
}

export function getSystemTenantDetail(tenantId: string) {
  return useRequest().get<SystemTenantDetail>(
    {
      url: `/system/platform/tenant/detail/${tenantId}`,
      baseURL: platformApiUrl,
    },
    { errorMessageMode: 'message' },
  )
}

export function createSystemTenant(data: SystemTenantCreatePayload) {
  return useRequest().post<SystemTenantListItem>(
    {
      url: '/system/platform/tenant/create',
      baseURL: platformApiUrl,
      data,
    },
    { errorMessageMode: 'message' },
  )
}

export function updateSystemTenant(tenantId: string, data: SystemTenantUpdatePayload) {
  return useRequest().put<SystemTenantListItem>(
    {
      url: '/system/platform/tenant',
      baseURL: platformApiUrl,
      data: { tenantId: Number(tenantId), ...data },
    },
    { errorMessageMode: 'message' },
  )
}

export function updateSystemTenantCode(data: SystemTenantCodePayload) {
  return useRequest().put<SystemTenantListItem>(
    {
      url: '/system/platform/tenant/code',
      baseURL: platformApiUrl,
      data: { ...data, tenantId: Number(data.tenantId) },
    },
    { errorMessageMode: 'message' },
  )
}

export function trialSystemTenant(data: SystemTenantPeriodPayload) {
  return useRequest().post<SystemTenantListItem>(
    {
      url: '/system/platform/tenant/trial',
      baseURL: platformApiUrl,
      data,
    },
    { errorMessageMode: 'message' },
  )
}

export function activateSystemTenant(data: SystemTenantPeriodPayload) {
  return useRequest().post<SystemTenantListItem>(
    {
      url: '/system/platform/tenant/activate',
      baseURL: platformApiUrl,
      data,
    },
    { errorMessageMode: 'message' },
  )
}

export function disableSystemTenant(data: SystemTenantRemarkPayload) {
  return useRequest().post<SystemTenantListItem>(
    {
      url: '/system/platform/tenant/disable',
      baseURL: platformApiUrl,
      data: { ...data, tenantId: Number(data.tenantId) },
    },
    { errorMessageMode: 'message' },
  )
}

export function deleteSystemTenant(data: SystemTenantDeletePayload) {
  return useRequest().post<SystemTenantListItem>(
    {
      url: '/system/platform/tenant/delete',
      baseURL: platformApiUrl,
      data: { ...data, tenantId: Number(data.tenantId) },
    },
    { errorMessageMode: 'message' },
  )
}

export function fetchSystemTenantClearImpact(tenantId: string) {
  return useRequest().post<SystemTenantClearImpact>({
    url: '/system/platform/tenant/clear-impact',
    baseURL: platformApiUrl,
    data: { tenantId: Number(tenantId) },
  })
}

export function clearSystemTenantData(data: SystemTenantDeletePayload) {
  return useRequest().post<{ tenantId: string }>({
    url: '/system/platform/tenant/clear-data',
    baseURL: platformApiUrl,
    data: { ...data, tenantId: Number(data.tenantId) },
  })
}

export function fetchSystemTenantGrantDetail(tenantId: string) {
  return useRequest().post<SystemTenantGrantDetail>({
    url: '/system/platform/tenant/grant/detail',
    baseURL: platformApiUrl,
    data: { tenantId: Number(tenantId) },
  })
}

export function fetchSystemTenantApplicationFunctions() {
  return useRequest().post<SystemTenantApplicationFunction[]>({
    url: '/system/platform/application/functions/list',
    baseURL: platformApiUrl,
  })
}

export function fetchSystemTenantGrantColumns() {
  return useRequest().post<SystemTenantGrantColumn[]>({
    url: '/system/platform/application/menu-columns/all',
    baseURL: platformApiUrl,
  })
}

export function saveSystemTenantGrant(data: SystemTenantGrantPayload) {
  return useRequest().put<SystemTenantGrantDetail>({
    url: '/system/platform/tenant/grant',
    baseURL: platformApiUrl,
    data: { ...data, tenantId: Number(data.tenantId) },
  })
}
