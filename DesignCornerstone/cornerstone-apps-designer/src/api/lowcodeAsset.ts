import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type { DesignerSchema } from '@grow-admin-rock/designer'
import type {
  LowcodeAsset,
  LowcodeAssetCreatePayload,
  LowcodeAssetListItem,
  LowcodeAssetPageResult,
  LowcodeAssetQuery,
  LowcodeAssetUpdatePayload,
} from '../types/lowcodeAsset'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

/** 分页查询：与登录接口一样走 POST + body，避免生产 Mock.js 对带 query 的 GET 匹配失败 */
export function fetchLowcodeAssetPage(params: LowcodeAssetQuery) {
  return useRequest().post<LowcodeAssetPageResult>({
    url: '/lowcode-assets/page',
    data: params,
  })
}

export function createLowcodeAsset(data: LowcodeAssetCreatePayload) {
  return useRequest().post<LowcodeAssetListItem>({
    url: '/lowcode-assets',
    data,
  })
}

export function updateLowcodeAsset(id: string, data: LowcodeAssetUpdatePayload) {
  return useRequest().put<LowcodeAssetListItem>({
    url: '/lowcode-asset',
    data: { id, ...data },
  })
}

export function deleteLowcodeAsset(id: string) {
  return useRequest().post<{ id: string }>({
    url: '/lowcode-asset/delete',
    data: { id },
  })
}

export function getLowcodeAssetDetail(id: string) {
  return useRequest().post<LowcodeAsset>({
    url: '/lowcode-asset/detail',
    data: { id },
  })
}

export function setLowcodeAssetEnabled(id: string, enabled: boolean) {
  return useRequest().put<LowcodeAssetListItem>({
    url: '/lowcode-asset/enabled',
    data: { id, enabled },
  })
}

export function saveLowcodeAssetSchema(id: string, schema: DesignerSchema) {
  return useRequest().put<{ id: string; updatedAt: string }>({
    url: '/lowcode-asset/schema',
    data: { id, schema },
  })
}

export function publishLowcodeAsset(id: string, remark?: string) {
  return useRequest().post<LowcodeAssetListItem>({
    url: '/lowcode-asset/publish',
    data: { id, remark },
  })
}

export type LowcodeAssetVersionListItem = {
  version: string
  publishedAt: string
  publishedBy: string
  remark: string
  isCurrent: boolean
}

export function fetchLowcodeAssetVersions(id: string) {
  return useRequest().post<{
    id: string
    currentVersion: string | null
    items: LowcodeAssetVersionListItem[]
  }>({
    url: '/lowcode-asset/versions',
    data: { id },
  })
}

export function rollbackLowcodeAsset(id: string, version: string) {
  return useRequest().post({
    url: '/lowcode-asset/rollback',
    data: { id, version },
  })
}
