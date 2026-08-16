import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type { CleanFlow } from '@grow-admin-rock/data-clean'
import type {
  DataCleanAsset,
  DataCleanAssetCreatePayload,
  DataCleanAssetListItem,
  DataCleanAssetPageResult,
  DataCleanAssetQuery,
  DataCleanAssetUpdatePayload,
} from '../types/dataCleanAsset'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

/** 分页查询：与登录接口一样走 POST + body，避免生产 Mock.js 对带 query 的 GET 匹配失败 */
export function fetchDataCleanAssetPage(params: DataCleanAssetQuery) {
  return useRequest().post<DataCleanAssetPageResult>({
    url: '/data-clean-assets/page',
    data: params,
  })
}

export function createDataCleanAsset(data: DataCleanAssetCreatePayload) {
  return useRequest().post<DataCleanAssetListItem>({
    url: '/data-clean-assets',
    data,
  })
}

export function updateDataCleanAsset(id: string, data: DataCleanAssetUpdatePayload) {
  return useRequest().put<DataCleanAssetListItem>({
    url: '/data-clean-asset',
    data: { id, ...data },
  })
}

export function deleteDataCleanAsset(id: string) {
  return useRequest().post<{ id: string }>({
    url: '/data-clean-asset/delete',
    data: { id },
  })
}

export function getDataCleanAssetDetail(id: string) {
  return useRequest().post<DataCleanAsset>({
    url: '/data-clean-asset/detail',
    data: { id },
  })
}

export function setDataCleanAssetEnabled(id: string, enabled: boolean) {
  return useRequest().put<DataCleanAssetListItem>({
    url: '/data-clean-asset/enabled',
    data: { id, enabled },
  })
}

export function saveDataCleanAssetSchema(id: string, schema: CleanFlow) {
  return useRequest().put<{ id: string; updatedAt: string }>({
    url: '/data-clean-asset/schema',
    data: { id, schema },
  })
}

export function publishDataCleanAsset(id: string, remark?: string) {
  return useRequest().post<DataCleanAssetListItem>({
    url: '/data-clean-asset/publish',
    data: { id, remark },
  })
}

export type DataCleanAssetVersionListItem = {
  version: string
  publishedAt: string
  publishedBy: string
  remark: string
  isCurrent: boolean
}

export function fetchDataCleanAssetVersions(id: string) {
  return useRequest().post<{
    id: string
    currentVersion: string | null
    items: DataCleanAssetVersionListItem[]
  }>({
    url: '/data-clean-asset/versions',
    data: { id },
  })
}

export function rollbackDataCleanAsset(id: string, version: string) {
  return useRequest().post({
    url: '/data-clean-asset/rollback',
    data: { id, version },
  })
}
