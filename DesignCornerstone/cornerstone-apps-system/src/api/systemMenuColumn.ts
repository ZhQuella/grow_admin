import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  SystemMenuColumn,
  SystemMenuColumnBundle,
  SystemMenuColumnSavePayload,
  SystemMenuReferenceImpact,
  SystemMenuTableDeleteImpact,
} from '../types/systemMenuColumn'
import { resolveSystemMenuRequest, type SystemMenuApiScope } from './systemMenuApiScope'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchSystemMenuColumns(menuName: string, scope: SystemMenuApiScope = 'system') {
  return useRequest().post<SystemMenuColumnBundle>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu/columns',
      '/system/platform/application/menu/columns',
    ),
    data: { menuName },
  })
}

export function saveSystemMenuColumns(
  data: SystemMenuColumnSavePayload,
  scope: SystemMenuApiScope = 'system',
) {
  return useRequest().put<SystemMenuColumnBundle>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu/columns',
      '/system/platform/application/menu/columns',
    ),
    data,
  })
}

export function fetchAllSystemMenuColumns(scope: SystemMenuApiScope = 'system') {
  return useRequest().post<SystemMenuColumn[]>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu-columns/all',
      '/system/platform/application/menu-columns/all',
    ),
  })
}

export function fetchSystemMenuColumnImpact(id: string, scope: SystemMenuApiScope = 'system') {
  return useRequest().post<SystemMenuReferenceImpact>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu/column-impact',
      '/system/platform/application/menu/column-impact',
    ),
    data: { id },
  })
}

export function fetchSystemMenuTableDeleteImpact(
  menuName: string,
  tableCode: string,
  scope: SystemMenuApiScope = 'system',
) {
  return useRequest().post<SystemMenuTableDeleteImpact>({
    ...resolveSystemMenuRequest(
      scope,
      '/system/menu/table-delete-impact',
      '/system/platform/application/menu/table-delete-impact',
    ),
    data: { menuName, tableCode },
  })
}
