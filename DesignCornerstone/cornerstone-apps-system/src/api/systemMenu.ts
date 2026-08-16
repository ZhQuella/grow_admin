import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  SystemMenuCreatePayload,
  SystemMenuNode,
  SystemMenuUpdatePayload,
} from '../types/systemMenu'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchSystemMenuTree() {
  return useRequest().post<SystemMenuNode[]>({
    url: '/system/menus/tree',
  })
}

export function createSystemMenu(data: SystemMenuCreatePayload) {
  return useRequest().post<SystemMenuNode>({
    url: '/system/menus',
    data,
  })
}

export function updateSystemMenu(name: string, data: SystemMenuUpdatePayload) {
  return useRequest().put<SystemMenuNode>({
    url: '/system/menu',
    data: { name, ...data },
  })
}

export function deleteSystemMenu(name: string) {
  return useRequest().post<{ name: string }>({
    url: '/system/menu/delete',
    data: { name },
  })
}
