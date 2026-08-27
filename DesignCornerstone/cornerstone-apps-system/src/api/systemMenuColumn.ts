import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  SystemMenuColumn,
  SystemMenuColumnBundle,
  SystemMenuColumnSavePayload,
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
