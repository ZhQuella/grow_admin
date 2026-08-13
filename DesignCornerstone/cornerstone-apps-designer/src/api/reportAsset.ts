import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type { ReportSchema } from '@grow-admin-rock/report-designer'
import type {
  ReportAsset,
  ReportAssetCreatePayload,
  ReportAssetListItem,
  ReportAssetPageResult,
  ReportAssetQuery,
  ReportAssetUpdatePayload,
} from '../types/reportAsset'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

/** 分页查询：与登录接口一样走 POST + body，避免生产 Mock.js 对带 query 的 GET 匹配失败 */
export function fetchReportAssetPage(params: ReportAssetQuery) {
  return useRequest().post<ReportAssetPageResult>({
    url: '/report-assets/page',
    data: params,
  })
}

export function createReportAsset(data: ReportAssetCreatePayload) {
  return useRequest().post<ReportAssetListItem>({
    url: '/report-assets',
    data,
  })
}

export function updateReportAsset(id: string, data: ReportAssetUpdatePayload) {
  return useRequest().put<ReportAssetListItem>({
    url: '/report-asset',
    data: { id, ...data },
  })
}

export function deleteReportAsset(id: string) {
  return useRequest().post<{ id: string }>({
    url: '/report-asset/delete',
    data: { id },
  })
}

export function getReportAssetDetail(id: string) {
  return useRequest().post<ReportAsset>({
    url: '/report-asset/detail',
    data: { id },
  })
}

export function setReportAssetEnabled(id: string, enabled: boolean) {
  return useRequest().put<ReportAssetListItem>({
    url: '/report-asset/enabled',
    data: { id, enabled },
  })
}

export function saveReportAssetSchema(id: string, schema: ReportSchema) {
  return useRequest().put<{ id: string; updatedAt: string }>({
    url: '/report-asset/schema',
    data: { id, schema },
  })
}

export function publishReportAsset(id: string, remark?: string) {
  return useRequest().post<ReportAssetListItem>({
    url: '/report-asset/publish',
    data: { id, remark },
  })
}

export type ReportAssetVersionListItem = {
  version: string
  publishedAt: string
  publishedBy: string
  remark: string
  isCurrent: boolean
}

export function fetchReportAssetVersions(id: string) {
  return useRequest().post<{
    id: string
    currentVersion: string | null
    items: ReportAssetVersionListItem[]
  }>({
    url: '/report-asset/versions',
    data: { id },
  })
}

export function rollbackReportAsset(id: string, version: string) {
  return useRequest().post({
    url: '/report-asset/rollback',
    data: { id, version },
  })
}
