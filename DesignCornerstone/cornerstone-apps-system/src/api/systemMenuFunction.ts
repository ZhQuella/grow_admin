import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  SystemMenuFunction,
  SystemMenuFunctionDeleteImpact,
  SystemMenuFunctionSavePayload,
} from '../types/systemMenuFunction'
import { resolveSystemMenuRequest, type SystemMenuApiScope } from './systemMenuApiScope'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchSystemMenuFunctions(menuName: string, scope: SystemMenuApiScope = 'system') {
  return useRequest().post<SystemMenuFunction[]>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu/functions',
      '/system/platform/application/menu/functions',
    ),
    data: { menuName },
  })
}

export function saveSystemMenuFunctions(
  data: SystemMenuFunctionSavePayload,
  scope: SystemMenuApiScope = 'system',
) {
  return useRequest().put<SystemMenuFunction[]>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu/functions',
      '/system/platform/application/menu/functions',
    ),
    data,
  })
}

export function fetchAllSystemMenuFunctions(scope: SystemMenuApiScope = 'system') {
  return useRequest().post<SystemMenuFunction[]>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu-functions/all',
      '/system/platform/application/menu-functions/all',
    ),
  })
}

export function fetchSystemMenuFunctionDeleteImpact(
  id: string,
  scope: SystemMenuApiScope = 'system',
) {
  return useRequest().post<SystemMenuFunctionDeleteImpact>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu/function/delete-impact',
      '/system/platform/application/menu/function/delete-impact',
    ),
    data: { id },
  })
}
