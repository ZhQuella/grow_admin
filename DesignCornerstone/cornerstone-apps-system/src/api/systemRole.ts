import { diKT } from '@grow-admin-rock/ioc'
import { Lib as infrastructureLib } from '@grow-admin-rock/infrastructure'
import type {
  SystemDeptTreeNode,
  SystemPerson,
  SystemRoleCreatePayload,
  SystemRoleDataPermItem,
  SystemRoleDetail,
  SystemRoleListItem,
  SystemRolePageResult,
  SystemRoleQuery,
  SystemRoleUpdatePayload,
} from '../types/systemRole'

const useRequest = () => diKT(infrastructureLib.types.InfrastructureAxios)

export function fetchSystemRolePage(params: SystemRoleQuery) {
  return useRequest().post<SystemRolePageResult>({
    url: '/system/roles/page',
    data: params,
  })
}

export function createSystemRole(data: SystemRoleCreatePayload) {
  return useRequest().post<SystemRoleListItem>({
    url: '/system/roles',
    data,
  })
}

export function updateSystemRole(id: string, data: SystemRoleUpdatePayload) {
  return useRequest().put<SystemRoleListItem>({
    url: '/system/role',
    data: { id, ...data },
  })
}

export function deleteSystemRole(id: string) {
  return useRequest().post<{ id: string }>({
    url: '/system/role/delete',
    data: { id },
  })
}

export function getSystemRoleDetail(id: string) {
  return useRequest().post<SystemRoleDetail>({
    url: '/system/role/detail',
    data: { id },
  })
}

export function setSystemRoleEnabled(id: string, enabled: boolean) {
  return useRequest().put<SystemRoleListItem>({
    url: '/system/role/enabled',
    data: { id, enabled },
  })
}

export function saveSystemRoleMembers(id: string, userIds: string[]) {
  return useRequest().put<SystemRoleDetail>({
    url: '/system/role/members',
    data: { id, userIds },
  })
}

export function saveSystemRoleDataPerm(id: string, items: SystemRoleDataPermItem[]) {
  return useRequest().put<SystemRoleDetail>({
    url: '/system/role/data-perm',
    data: { id, items },
  })
}

export function saveSystemRoleMenuPerm(
  id: string,
  data: { menuNames: string[]; functionIds: string[] },
) {
  return useRequest().put<SystemRoleDetail>({
    url: '/system/role/menu-perm',
    data: { id, ...data },
  })
}

export function fetchSystemDeptTree() {
  return useRequest().post<SystemDeptTreeNode[]>({
    url: '/system/depts/tree',
  })
}

export function fetchSystemPersons() {
  return useRequest().post<SystemPerson[]>({
    url: '/system/persons',
  })
}
