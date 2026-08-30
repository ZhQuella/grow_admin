import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type { SystemPostOption } from '../types/systemPerson'

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
