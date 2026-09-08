import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  SystemTenantClearImpact,
  SystemTenantCodePayload,
  SystemTenantDeletePayload,
  SystemTenantDetail,
  SystemTenantGrantDetail,
  SystemTenantGrantPayload,
  SystemTenantListItem,
  SystemTenantOption,
  SystemTenantPageResult,
  SystemTenantPeriodPayload,
  SystemTenantQuery,
  SystemTenantReasonPayload,
  SystemTenantSavePayload,
} from '../types/systemTenant'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchSystemTenantPage(params: SystemTenantQuery) {
  return useRequest().post<SystemTenantPageResult>({
    url: '/platform/tenants/page',
    data: params,
  })
}

export function fetchSystemTenantOptions() {
  return useRequest().post<SystemTenantOption[]>({
    url: '/platform/tenants/options',
  })
}

export function getSystemTenantDetail(tenantId: string) {
  return useRequest().post<SystemTenantDetail>({
    url: '/platform/tenant/detail',
    data: { tenantId },
  })
}

export function createSystemTenant(data: SystemTenantSavePayload) {
  return useRequest().post<SystemTenantListItem>({
    url: '/platform/tenant/create',
    data,
  })
}

export function updateSystemTenant(tenantId: string, data: SystemTenantSavePayload) {
  return useRequest().put<SystemTenantListItem>({
    url: '/platform/tenant',
    data: { tenantId, ...data },
  })
}

export function updateSystemTenantCode(data: SystemTenantCodePayload) {
  return useRequest().put<SystemTenantListItem>({
    url: '/platform/tenant/code',
    data,
  })
}

export function trialSystemTenant(data: SystemTenantPeriodPayload) {
  return useRequest().post<SystemTenantListItem>({
    url: '/platform/tenant/trial',
    data,
  })
}

export function activateSystemTenant(data: SystemTenantPeriodPayload) {
  return useRequest().post<SystemTenantListItem>({
    url: '/platform/tenant/activate',
    data,
  })
}

export function disableSystemTenant(data: SystemTenantReasonPayload) {
  return useRequest().post<SystemTenantListItem>({
    url: '/platform/tenant/disable',
    data,
  })
}

export function deleteSystemTenant(data: SystemTenantDeletePayload) {
  return useRequest().post<SystemTenantListItem>({
    url: '/platform/tenant/delete',
    data,
  })
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

export function saveSystemTenantGrant(data: SystemTenantGrantPayload) {
  return useRequest().put<SystemTenantGrantDetail>({
    url: '/platform/tenant/grant',
    data,
  })
}
