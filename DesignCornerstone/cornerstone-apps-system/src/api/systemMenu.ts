import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  SystemMenuCodeImpact,
  SystemMenuCreatePayload,
  SystemMenuDeleteImpact,
  SystemMenuNode,
  SystemMenuUpdatePayload,
} from '../types/systemMenu'
import { resolveSystemMenuRequest, type SystemMenuApiScope } from './systemMenuApiScope'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchSystemMenuTree(scope: SystemMenuApiScope = 'system') {
  return useRequest().post<SystemMenuNode[]>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menus/tree',
      '/system/platform/application/menus/tree',
    ),
  })
}

export function fetchApplicationFunctionList(scope: SystemMenuApiScope = 'platform') {
  return useRequest().post<SystemMenuNode[]>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/platform/application/functions/list',
      '/system/platform/application/functions/list',
    ),
  })
}

export function fetchTenantAuthorizedApplicationList(scope: SystemMenuApiScope = 'system') {
  return useRequest().post<SystemMenuNode[]>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/tenant-authorized-applications/list',
      '/system/platform/application/tenant-authorized/list',
    ),
  })
}

export function createSystemMenu(data: SystemMenuCreatePayload, scope: SystemMenuApiScope = 'system') {
  return useRequest().post<SystemMenuNode>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menus',
      '/system/platform/application/menus',
    ),
    data,
  })
}

export function updateSystemMenu(
  name: string,
  data: SystemMenuUpdatePayload,
  scope: SystemMenuApiScope = 'system',
) {
  return useRequest().put<SystemMenuNode>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu',
      '/system/platform/application/menu',
    ),
    data: { originalName: name, ...data },
  })
}

export function setSystemMenuEnabled(
  name: string,
  enabled: boolean,
  scope: SystemMenuApiScope = 'system',
) {
  return useRequest().put<SystemMenuNode>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu/enabled',
      '/system/platform/application/menu/enabled',
    ),
    data: { name, enabled },
  })
}

export function fetchSystemMenuDeleteImpact(name: string, scope: SystemMenuApiScope = 'system') {
  return useRequest().post<SystemMenuDeleteImpact>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu/delete-impact',
      '/system/platform/application/menu/delete-impact',
    ),
    data: { name },
  })
}

export function fetchSystemMenuCodeImpact(name: string, scope: SystemMenuApiScope = 'system') {
  return useRequest().post<SystemMenuCodeImpact>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu/code-impact',
      '/system/platform/application/menu/code-impact',
    ),
    data: { name },
  })
}

export function deleteSystemMenu(name: string, scope: SystemMenuApiScope = 'system') {
  return useRequest().post<{ name: string }>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu/delete',
      '/system/platform/application/menu/delete',
    ),
    data: { name },
  })
}
