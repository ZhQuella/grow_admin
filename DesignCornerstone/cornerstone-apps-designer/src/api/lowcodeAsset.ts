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

export function fetchLowcodeAssetPage(params: LowcodeAssetQuery) {
  return useRequest().get<LowcodeAssetPageResult>({
    url: '/lowcode-assets',
    params,
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
  return useRequest().delete<{ id: string }>({
    url: '/lowcode-asset',
    params: { id },
  })
}

export function getLowcodeAssetDetail(id: string) {
  return useRequest().get<LowcodeAsset>({
    url: '/lowcode-asset',
    params: { id },
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
  return useRequest().get<{
    id: string
    currentVersion: string | null
    items: LowcodeAssetVersionListItem[]
  }>({
    url: '/lowcode-asset/versions',
    params: { id },
  })
}

export function rollbackLowcodeAsset(id: string, version: string) {
  return useRequest().post({
    url: '/lowcode-asset/rollback',
    data: { id, version },
  })
}
