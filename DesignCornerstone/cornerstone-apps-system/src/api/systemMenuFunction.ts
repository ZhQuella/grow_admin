import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  SystemMenuFunction,
  SystemMenuFunctionDeleteImpact,
  SystemMenuFunctionSavePayload,
} from '../types/systemMenuFunction'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchSystemMenuFunctions(menuName: string) {
  return useRequest().post<SystemMenuFunction[]>({
    url: '/system/menu/functions',
    data: { menuName },
  })
}

export function saveSystemMenuFunctions(data: SystemMenuFunctionSavePayload) {
  return useRequest().put<SystemMenuFunction[]>({
    url: '/system/menu/functions',
    data,
  })
}

export function fetchAllSystemMenuFunctions() {
  return useRequest().post<SystemMenuFunction[]>({
    url: '/system/menu-functions/all',
  })
}

export function fetchSystemMenuFunctionDeleteImpact(id: string) {
  return useRequest().post<SystemMenuFunctionDeleteImpact>({
    url: '/system/menu/function/delete-impact',
    data: { id },
  })
}
