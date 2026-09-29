import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  ApplicationFunctionColumn,
  ApplicationFunctionColumnBundle,
  ApplicationFunctionColumnSavePayload,
  ApplicationFunctionReferenceImpact,
  ApplicationFunctionTableDeleteImpact,
} from '../types/applicationFunctionColumn'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchApplicationFunctionColumns(menuName: string) {
  return useRequest().post<ApplicationFunctionColumnBundle>({
    url: '/system/menu/columns',
    data: { menuName },
  })
}

export function saveApplicationFunctionColumns(data: ApplicationFunctionColumnSavePayload) {
  return useRequest().put<ApplicationFunctionColumnBundle>({
    url: '/system/menu/columns',
    data,
  })
}

export function fetchAllApplicationFunctionColumns() {
  return useRequest().post<ApplicationFunctionColumn[]>({
    url: '/system/menu-columns/all',
  })
}

export function fetchApplicationFunctionColumnImpact(id: string) {
  return useRequest().post<ApplicationFunctionReferenceImpact>({
    url: '/system/menu/column-impact',
    data: { id },
  })
}

export function fetchApplicationFunctionTableDeleteImpact(menuName: string, tableCode: string) {
  return useRequest().post<ApplicationFunctionTableDeleteImpact>({
    url: '/system/menu/table-delete-impact',
    data: { menuName, tableCode },
  })
}
