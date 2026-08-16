import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type { DatabaseSchema } from '@grow-admin-rock/schema-designer'
import type {
  SchemaAsset,
  SchemaAssetCreatePayload,
  SchemaAssetListItem,
  SchemaAssetPageResult,
  SchemaAssetQuery,
  SchemaAssetUpdatePayload,
} from '../types/schemaAsset'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

/** 分页查询：与登录接口一样走 POST + body，避免生产 Mock.js 对带 query 的 GET 匹配失败 */
export function fetchSchemaAssetPage(params: SchemaAssetQuery) {
  return useRequest().post<SchemaAssetPageResult>({
    url: '/schema-assets/page',
    data: params,
  })
}

export function createSchemaAsset(data: SchemaAssetCreatePayload) {
  return useRequest().post<SchemaAssetListItem>({
    url: '/schema-assets',
    data,
  })
}

export function updateSchemaAsset(id: string, data: SchemaAssetUpdatePayload) {
  return useRequest().put<SchemaAssetListItem>({
    url: '/schema-asset',
    data: { id, ...data },
  })
}

export function deleteSchemaAsset(id: string) {
  return useRequest().post<{ id: string }>({
    url: '/schema-asset/delete',
    data: { id },
  })
}

export function getSchemaAssetDetail(id: string) {
  return useRequest().post<SchemaAsset>({
    url: '/schema-asset/detail',
    data: { id },
  })
}

export function setSchemaAssetEnabled(id: string, enabled: boolean) {
  return useRequest().put<SchemaAssetListItem>({
    url: '/schema-asset/enabled',
    data: { id, enabled },
  })
}

export function saveSchemaAssetSchema(id: string, schema: DatabaseSchema) {
  return useRequest().put<{ id: string; updatedAt: string }>({
    url: '/schema-asset/schema',
    data: { id, schema },
  })
}

export function publishSchemaAsset(id: string, remark?: string) {
  return useRequest().post<SchemaAssetListItem>({
    url: '/schema-asset/publish',
    data: { id, remark },
  })
}

export type SchemaAssetVersionListItem = {
  version: string
  publishedAt: string
  publishedBy: string
  remark: string
  isCurrent: boolean
}

export function fetchSchemaAssetVersions(id: string) {
  return useRequest().post<{
    id: string
    currentVersion: string | null
    items: SchemaAssetVersionListItem[]
  }>({
    url: '/schema-asset/versions',
    data: { id },
  })
}

export function rollbackSchemaAsset(id: string, version: string) {
  return useRequest().post({
    url: '/schema-asset/rollback',
    data: { id, version },
  })
}
