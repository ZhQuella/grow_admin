import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type { SystemPostOption } from '../types/systemPerson'
import type {
  SystemPostDetail,
  SystemPostListItem,
  SystemPostPageResult,
  SystemPostQuery,
  SystemPostSavePayload,
} from '../types/systemPost'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

function unwrapPosts(data: unknown): SystemPostOption[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const rec = data as Record<string, unknown>
    const list = rec.list ?? rec.items ?? rec.data
    if (Array.isArray(list)) return list
  }
  return []
}

export async function fetchSystemPosts(deptId?: string) {
  const data = await useRequest().post<SystemPostOption[]>({
    url: '/system/posts',
    data: deptId ? { deptId } : {},
  })
  return unwrapPosts(data)
}

export function fetchSystemPostPage(params: SystemPostQuery) {
  return useRequest().post<SystemPostPageResult>({
    url: '/system/posts/page',
    data: params,
  })
}

export function createSystemPost(data: SystemPostSavePayload) {
  return useRequest().post<SystemPostListItem>({
    url: '/system/posts/create',
    data,
  })
}

export function updateSystemPost(id: string, data: SystemPostSavePayload) {
  return useRequest().put<SystemPostListItem>({
    url: '/system/post',
    data: { id, ...data },
  })
}

export function getSystemPostDetail(id: string) {
  return useRequest().post<SystemPostDetail>({
    url: '/system/post/detail',
    data: { id },
  })
}

export function setSystemPostEnabled(id: string, enabled: boolean) {
  return useRequest().put<SystemPostListItem>({
    url: '/system/post/enabled',
    data: { id, enabled },
  })
}
