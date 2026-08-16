import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  OnlinePage,
  OnlinePageCreatePayload,
  OnlinePageDraft,
  OnlinePageListItem,
  OnlinePagePageResult,
  OnlinePageQuery,
  OnlinePageUpdatePayload,
} from '../types/onlinePage'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchOnlinePagePage(params: OnlinePageQuery) {
  return useRequest().post<OnlinePagePageResult>({
    url: '/online-pages/page',
    data: params,
  })
}

export function createOnlinePage(data: OnlinePageCreatePayload) {
  return useRequest().post<OnlinePageListItem>({
    url: '/online-pages',
    data,
  })
}

export function updateOnlinePage(id: string, data: OnlinePageUpdatePayload) {
  return useRequest().put<OnlinePageListItem>({
    url: '/online-page',
    data: { id, ...data },
  })
}

export function deleteOnlinePage(id: string) {
  return useRequest().post<{ id: string }>({
    url: '/online-page/delete',
    data: { id },
  })
}

export function getOnlinePageDetail(id: string) {
  return useRequest().post<OnlinePage>({
    url: '/online-page/detail',
    data: { id },
  })
}

export function setOnlinePageEnabled(id: string, enabled: boolean) {
  return useRequest().put<OnlinePageListItem>({
    url: '/online-page/enabled',
    data: { id, enabled },
  })
}

export function saveOnlinePageDraft(id: string, draft: OnlinePageDraft) {
  return useRequest().put<{ id: string; updatedAt: string }>({
    url: '/online-page/schema',
    data: { id, draft },
  })
}

export function publishOnlinePage(id: string, remark?: string) {
  return useRequest().post<OnlinePageListItem>({
    url: '/online-page/publish',
    data: { id, remark },
  })
}

export type OnlinePageVersionListItem = {
  version: string
  publishedAt: string
  publishedBy: string
  remark: string
  isCurrent: boolean
}

export function fetchOnlinePageVersions(id: string) {
  return useRequest().post<{
    id: string
    currentVersion: string | null
    items: OnlinePageVersionListItem[]
  }>({
    url: '/online-page/versions',
    data: { id },
  })
}

export function rollbackOnlinePage(id: string, version: string) {
  return useRequest().post({
    url: '/online-page/rollback',
    data: { id, version },
  })
}
