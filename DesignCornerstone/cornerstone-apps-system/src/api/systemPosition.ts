import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  SystemPositionDetail,
  SystemPositionImpact,
  SystemPositionListItem,
  SystemPositionOption,
  SystemPositionPageResult,
  SystemPositionQuery,
  SystemPositionSavePayload,
} from '../types/systemPosition'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchSystemPositionPage(params: SystemPositionQuery) {
  return useRequest().post<SystemPositionPageResult>({
    url: '/system/positions/page',
    data: params,
  })
}

export function fetchSystemPositionOptions(params?: { enabled?: boolean; includeId?: string }) {
  return useRequest().post<SystemPositionOption[]>({
    url: '/system/positions/options',
    data: params || {},
  })
}

export function createSystemPosition(data: SystemPositionSavePayload) {
  return useRequest().post<SystemPositionListItem>({
    url: '/system/positions',
    data,
  })
}

export function updateSystemPosition(id: string, data: SystemPositionSavePayload) {
  return useRequest().put<SystemPositionListItem>({
    url: '/system/position',
    data: { id, ...data },
  })
}

export function deleteSystemPosition(id: string) {
  return useRequest().post<{ id: string }>({
    url: '/system/position/delete',
    data: { id },
  })
}

export function fetchSystemPositionImpact(id: string) {
  return useRequest().post<SystemPositionImpact>({
    url: '/system/position/impact',
    data: { id },
  })
}

export function getSystemPositionDetail(id: string) {
  return useRequest().post<SystemPositionDetail>({
    url: '/system/position/detail',
    data: { id },
  })
}

export function setSystemPositionEnabled(id: string, enabled: boolean) {
  return useRequest().put<SystemPositionListItem>({
    url: '/system/position/enabled',
    data: { id, enabled },
  })
}
