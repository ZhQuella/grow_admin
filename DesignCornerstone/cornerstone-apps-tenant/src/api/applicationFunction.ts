import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  ApplicationFunctionCreatePayload,
  ApplicationFunctionDeleteImpact,
  ApplicationFunctionNode,
  ApplicationFunctionUpdatePayload,
} from '../types/applicationFunction'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchApplicationFunctionList() {
  return useRequest().post<ApplicationFunctionNode[]>({
    url: '/platform/application-functions/list',
  })
}

export function createApplicationFunction(data: ApplicationFunctionCreatePayload) {
  return useRequest().post<ApplicationFunctionNode>({
    url: '/system/menus',
    data,
  })
}

export function updateApplicationFunction(name: string, data: ApplicationFunctionUpdatePayload) {
  return useRequest().put<ApplicationFunctionNode>({
    url: '/system/menu',
    data: { originalName: name, ...data },
  })
}

export function setApplicationFunctionEnabled(name: string, enabled: boolean) {
  return useRequest().put<ApplicationFunctionNode>({
    url: '/system/menu/enabled',
    data: { name, enabled },
  })
}

export function fetchApplicationFunctionDeleteImpact(name: string) {
  return useRequest().post<ApplicationFunctionDeleteImpact>({
    url: '/system/menu/delete-impact',
    data: { name },
  })
}

export function deleteApplicationFunction(name: string) {
  return useRequest().post<{ name: string }>({
    url: '/system/menu/delete',
    data: { name },
  })
}
