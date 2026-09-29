import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  ApplicationFunctionFunction,
  ApplicationFunctionFunctionDeleteImpact,
  ApplicationFunctionFunctionSavePayload,
} from '../types/applicationFunctionFunction'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchApplicationFunctionFunctions(menuName: string) {
  return useRequest().post<ApplicationFunctionFunction[]>({
    url: '/system/menu/functions',
    data: { menuName },
  })
}

export function saveApplicationFunctionFunctions(data: ApplicationFunctionFunctionSavePayload) {
  return useRequest().put<ApplicationFunctionFunction[]>({
    url: '/system/menu/functions',
    data,
  })
}

export function fetchAllApplicationFunctionFunctions() {
  return useRequest().post<ApplicationFunctionFunction[]>({
    url: '/system/menu-functions/all',
  })
}

export function fetchApplicationFunctionFunctionDeleteImpact(id: string) {
  return useRequest().post<ApplicationFunctionFunctionDeleteImpact>({
    url: '/system/menu/function/delete-impact',
    data: { id },
  })
}
