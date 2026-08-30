import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  SystemMenuCodeImpact,
  SystemMenuCreatePayload,
  SystemMenuDeleteImpact,
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
    data: { originalName: name, ...data },
  })
}

export function setSystemMenuEnabled(name: string, enabled: boolean) {
  return useRequest().put<SystemMenuNode>({
    url: '/system/menu/enabled',
    data: { name, enabled },
  })
}

export function fetchSystemMenuDeleteImpact(name: string) {
  return useRequest().post<SystemMenuDeleteImpact>({
    url: '/system/menu/delete-impact',
    data: { name },
  })
}

export function fetchSystemMenuCodeImpact(name: string) {
  return useRequest().post<SystemMenuCodeImpact>({
    url: '/system/menu/code-impact',
    data: { name },
  })
}

export function deleteSystemMenu(name: string) {
  return useRequest().post<{ name: string }>({
    url: '/system/menu/delete',
    data: { name },
  })
}
