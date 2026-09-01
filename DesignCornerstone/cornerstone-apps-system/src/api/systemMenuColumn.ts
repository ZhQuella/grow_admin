import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  SystemMenuColumn,
  SystemMenuColumnBundle,
  SystemMenuColumnSavePayload,
  SystemMenuReferenceImpact,
  SystemMenuTableDeleteImpact,
} from '../types/systemMenuColumn'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchSystemMenuColumns(menuName: string) {
  return useRequest().post<SystemMenuColumnBundle>({
    url: '/system/menu/columns',
    data: { menuName },
  })
}

export function saveSystemMenuColumns(data: SystemMenuColumnSavePayload) {
  return useRequest().put<SystemMenuColumnBundle>({
    url: '/system/menu/columns',
    data,
  })
}

export function fetchAllSystemMenuColumns() {
  return useRequest().post<SystemMenuColumn[]>({
    url: '/system/menu-columns/all',
  })
}

export function fetchSystemMenuColumnImpact(id: string) {
  return useRequest().post<SystemMenuReferenceImpact>({
    url: '/system/menu/column-impact',
    data: { id },
  })
}

export function fetchSystemMenuTableDeleteImpact(menuName: string, tableCode: string) {
  return useRequest().post<SystemMenuTableDeleteImpact>({
    url: '/system/menu/table-delete-impact',
    data: { menuName, tableCode },
  })
}
