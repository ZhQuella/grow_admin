import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type { ProcessFlow } from '@grow-admin-rock/process-engine'
import type {
  ProcessAsset,
  ProcessAssetCreatePayload,
  ProcessAssetListItem,
  ProcessAssetPageResult,
  ProcessAssetQuery,
  ProcessAssetUpdatePayload,
} from '../types/processAsset'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

/** 分页查询：与登录接口一样走 POST + body，避免生产 Mock.js 对带 query 的 GET 匹配失败 */
export function fetchProcessAssetPage(params: ProcessAssetQuery) {
  return useRequest().post<ProcessAssetPageResult>({
    url: '/process-assets/page',
    data: params,
  })
}

export function createProcessAsset(data: ProcessAssetCreatePayload) {
  return useRequest().post<ProcessAssetListItem>({
    url: '/process-assets',
    data,
  })
}

export function updateProcessAsset(id: string, data: ProcessAssetUpdatePayload) {
  return useRequest().put<ProcessAssetListItem>({
    url: '/process-asset',
    data: { id, ...data },
  })
}

export function deleteProcessAsset(id: string) {
  return useRequest().post<{ id: string }>({
    url: '/process-asset/delete',
    data: { id },
  })
}

export function getProcessAssetDetail(id: string) {
  return useRequest().post<ProcessAsset>({
    url: '/process-asset/detail',
    data: { id },
  })
}

export function setProcessAssetEnabled(id: string, enabled: boolean) {
  return useRequest().put<ProcessAssetListItem>({
    url: '/process-asset/enabled',
    data: { id, enabled },
  })
}

export function saveProcessAssetSchema(id: string, schema: ProcessFlow) {
  return useRequest().put<{ id: string; updatedAt: string }>({
    url: '/process-asset/schema',
    data: { id, schema },
  })
}

export function publishProcessAsset(id: string, remark?: string) {
  return useRequest().post<ProcessAssetListItem>({
    url: '/process-asset/publish',
    data: { id, remark },
  })
}

export type ProcessAssetVersionListItem = {
  version: string
  publishedAt: string
  publishedBy: string
  remark: string
  isCurrent: boolean
}

export function fetchProcessAssetVersions(id: string) {
  return useRequest().post<{
    id: string
    currentVersion: string | null
    items: ProcessAssetVersionListItem[]
  }>({
    url: '/process-asset/versions',
    data: { id },
  })
}

export function rollbackProcessAsset(id: string, version: string) {
  return useRequest().post({
    url: '/process-asset/rollback',
    data: { id, version },
  })
}
