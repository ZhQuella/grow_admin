import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type { DataPrepDataset } from '@grow-admin-rock/data-prep'
import type {
  DataPrepAsset,
  DataPrepAssetCreatePayload,
  DataPrepAssetListItem,
  DataPrepAssetPageResult,
  DataPrepAssetQuery,
  DataPrepAssetUpdatePayload,
} from '../types/dataPrepAsset'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

/** 分页查询：与登录接口一样走 POST + body，避免生产 Mock.js 对带 query 的 GET 匹配失败 */
export function fetchDataPrepAssetPage(params: DataPrepAssetQuery) {
  return useRequest().post<DataPrepAssetPageResult>({
    url: '/data-prep-assets/page',
    data: params,
  })
}

export function createDataPrepAsset(data: DataPrepAssetCreatePayload) {
  return useRequest().post<DataPrepAssetListItem>({
    url: '/data-prep-assets',
    data,
  })
}

export function updateDataPrepAsset(id: string, data: DataPrepAssetUpdatePayload) {
  return useRequest().put<DataPrepAssetListItem>({
    url: '/data-prep-asset',
    data: { id, ...data },
  })
}

export function deleteDataPrepAsset(id: string) {
  return useRequest().post<{ id: string }>({
    url: '/data-prep-asset/delete',
    data: { id },
  })
}

export function getDataPrepAssetDetail(id: string) {
  return useRequest().post<DataPrepAsset>({
    url: '/data-prep-asset/detail',
    data: { id },
  })
}

export function setDataPrepAssetEnabled(id: string, enabled: boolean) {
  return useRequest().put<DataPrepAssetListItem>({
    url: '/data-prep-asset/enabled',
    data: { id, enabled },
  })
}

export function saveDataPrepAssetSchema(id: string, schema: DataPrepDataset) {
  return useRequest().put<{ id: string; updatedAt: string }>({
    url: '/data-prep-asset/schema',
    data: { id, schema },
  })
}

export function publishDataPrepAsset(id: string, remark?: string) {
  return useRequest().post<DataPrepAssetListItem>({
    url: '/data-prep-asset/publish',
    data: { id, remark },
  })
}

export type DataPrepAssetVersionListItem = {
  version: string
  publishedAt: string
  publishedBy: string
  remark: string
  isCurrent: boolean
}

export function fetchDataPrepAssetVersions(id: string) {
  return useRequest().post<{
    id: string
    currentVersion: string | null
    items: DataPrepAssetVersionListItem[]
  }>({
    url: '/data-prep-asset/versions',
    data: { id },
  })
}

export function rollbackDataPrepAsset(id: string, version: string) {
  return useRequest().post({
    url: '/data-prep-asset/rollback',
    data: { id, version },
  })
}
